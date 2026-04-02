DELIMITER //

CREATE TRIGGER booking_fill_snapshots
BEFORE INSERT ON Booking
FOR EACH ROW
BEGIN
    DECLARE customer_name VARCHAR(120);
    DECLARE hotel_address VARCHAR(255);
    DECLARE room_price DECIMAL(10,2);

    IF NEW.End_Date <= NEW.Start_Date THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'End date must be after start date';
    END IF;

    SELECT CONCAT(c.First_Name, ' ', c.Last_Name)
      INTO customer_name
    FROM Customer c
    WHERE c.Customer_SSN = NEW.Customer_SSN;

    SELECT h.Address, r.Price
      INTO hotel_address, room_price
    FROM Room r
    JOIN Hotel h ON h.Hotel_Id = r.Hotel_Id
    WHERE r.Hotel_Id = NEW.Hotel_Id
      AND r.Room_Id = NEW.Room_Id;

    IF customer_name IS NULL OR hotel_address IS NULL OR room_price IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid customer or room reference';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM Booking b
        WHERE b.Hotel_Id = NEW.Hotel_Id
          AND b.Room_Id = NEW.Room_Id
          AND b.Booking_Status = 'active'
          AND b.Start_Date < NEW.End_Date
          AND b.End_Date > NEW.Start_Date
    ) OR EXISTS (
        SELECT 1
        FROM Renting rt
        WHERE rt.Hotel_Id = NEW.Hotel_Id
          AND rt.Room_Id = NEW.Room_Id
          AND rt.Start_Date < NEW.End_Date
          AND rt.End_Date > NEW.Start_Date
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Room not available for selected dates';
    END IF;

    SET NEW.Customer_Name_Snapshot = customer_name;
    SET NEW.Hotel_Address_Snapshot = hotel_address;
    SET NEW.Room_Price_Snapshot = room_price;
END //

CREATE TRIGGER renting_fill_snapshots
BEFORE INSERT ON Renting
FOR EACH ROW
BEGIN
    DECLARE customer_name VARCHAR(120);
    DECLARE employee_name VARCHAR(120);
    DECLARE hotel_address VARCHAR(255);
    DECLARE room_price DECIMAL(10,2);

    IF NEW.End_Date <= NEW.Start_Date THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'End date must be after start date';
    END IF;

    SELECT CONCAT(c.First_Name, ' ', c.Last_Name)
      INTO customer_name
    FROM Customer c
    WHERE c.Customer_SSN = NEW.Customer_SSN;

    SELECT CONCAT(e.First_Name, ' ', e.Last_Name)
      INTO employee_name
    FROM Employee e
    WHERE e.Employee_SSN = NEW.Employee_SSN;

    SELECT h.Address, r.Price
      INTO hotel_address, room_price
    FROM Room r
    JOIN Hotel h ON h.Hotel_Id = r.Hotel_Id
    WHERE r.Hotel_Id = NEW.Hotel_Id
      AND r.Room_Id = NEW.Room_Id;

    IF customer_name IS NULL OR employee_name IS NULL OR hotel_address IS NULL OR room_price IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid references for renting';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM Renting rt
        WHERE rt.Hotel_Id = NEW.Hotel_Id
          AND rt.Room_Id = NEW.Room_Id
          AND rt.Start_Date < NEW.End_Date
          AND rt.End_Date > NEW.Start_Date
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Room already rented for selected dates';
    END IF;

    SET NEW.Customer_Name_Snapshot = customer_name;
    SET NEW.Employee_Name_Snapshot = employee_name;
    SET NEW.Hotel_Address_Snapshot = hotel_address;
    SET NEW.Room_Price_Snapshot = room_price;
END //

CREATE TRIGGER archive_booking_before_delete
BEFORE DELETE ON Booking
FOR EACH ROW
BEGIN
    INSERT INTO BookingArchive (
        Original_Booking_Id, Customer_Name, Customer_SSN, Hotel_Address,
        Room_Number, Room_Price, Start_Date, End_Date, Book_Date
    )
    VALUES (
        OLD.Booking_Id, OLD.Customer_Name_Snapshot, OLD.Customer_SSN, OLD.Hotel_Address_Snapshot,
        OLD.Room_Id, OLD.Room_Price_Snapshot, OLD.Start_Date, OLD.End_Date, OLD.Book_Date
    );
END //

CREATE TRIGGER archive_renting_before_delete
BEFORE DELETE ON Renting
FOR EACH ROW
BEGIN
    INSERT INTO RentingArchive (
        Original_Renting_Id, Original_Booking_Id, Customer_Name, Customer_SSN, Hotel_Address,
        Room_Number, Room_Price, Employee_Name, Start_Date, End_Date, Payment_Amount
    )
    VALUES (
        OLD.Renting_Id, OLD.Booking_Id, OLD.Customer_Name_Snapshot, OLD.Customer_SSN, OLD.Hotel_Address_Snapshot,
        OLD.Room_Id, OLD.Room_Price_Snapshot, OLD.Employee_Name_Snapshot, OLD.Start_Date, OLD.End_Date, OLD.Payment_Amount
    );
END //

DELIMITER ;