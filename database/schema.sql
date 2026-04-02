CREATE TABLE "HotelChain" (
  "HotelChain_Id" BIGSERIAL PRIMARY KEY,
  "Central_Office_Address" TEXT NOT NULL,
  "Num_of_Hotels" INTEGER NOT NULL DEFAULT 0 CHECK ("Num_of_Hotels" >= 0)
);

CREATE TABLE "Customer" (
  "Customer_SSN" VARCHAR(40) PRIMARY KEY,
  "First_Name" VARCHAR(80) NOT NULL,
  "Last_Name" VARCHAR(80) NOT NULL,
  "Registration_Date" DATE NOT NULL DEFAULT CURRENT_DATE,
  "Address" TEXT NOT NULL
);

CREATE TABLE "Hotel" (
  "Hotel_Id" BIGSERIAL PRIMARY KEY,
  "Rating" SMALLINT NOT NULL CHECK ("Rating" BETWEEN 1 AND 5),
  "Address" TEXT NOT NULL,
  "Email" TEXT NOT NULL,
  "Num_of_Rooms" INTEGER NOT NULL CHECK ("Num_of_Rooms" > 0),
  "Phone_Number" VARCHAR(40) NOT NULL,
  "Manager_Id" VARCHAR(40),
  "HotelChain_Id" BIGINT NOT NULL,
  CONSTRAINT "fk_Hotel_HotelChain"
    FOREIGN KEY ("HotelChain_Id")
    REFERENCES "HotelChain"("HotelChain_Id")
    ON DELETE CASCADE
);

CREATE TABLE "Employee" (
  "Employee_SSN" VARCHAR(40) PRIMARY KEY,
  "First_Name" VARCHAR(80) NOT NULL,
  "Last_Name" VARCHAR(80) NOT NULL,
  "Address" TEXT NOT NULL,
  "Hotel_Id" BIGINT NOT NULL,
  CONSTRAINT "fk_Employee_Hotel"
    FOREIGN KEY ("Hotel_Id")
    REFERENCES "Hotel"("Hotel_Id")
    ON DELETE CASCADE
);

ALTER TABLE "Hotel"
  ADD CONSTRAINT "fk_Hotel_Manager"
  FOREIGN KEY ("Manager_Id")
  REFERENCES "Employee"("Employee_SSN")
  ON DELETE SET NULL;

CREATE TABLE "Room" (
  "Hotel_Id" BIGINT NOT NULL,
  "Room_Id" BIGINT NOT NULL,
  "Price" NUMERIC(10, 2) NOT NULL CHECK ("Price" > 0),
  "Capacity" VARCHAR(40) NOT NULL CHECK ("Capacity" IN ('single', 'double', 'triple', 'quad', 'suite')),
  "View_Type" VARCHAR(30) NOT NULL CHECK ("View_Type" IN ('sea_view', 'mountain_view', 'city_view', 'garden_view', 'no_view')),
  "Extendable" BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY ("Hotel_Id", "Room_Id"),
  CONSTRAINT "fk_Room_Hotel"
    FOREIGN KEY ("Hotel_Id")
    REFERENCES "Hotel"("Hotel_Id")
    ON DELETE CASCADE
);

CREATE TABLE "Amenities" (
  "Hotel_Id" BIGINT NOT NULL,
  "Room_Id" BIGINT NOT NULL,
  "Type" VARCHAR(80) NOT NULL,
  PRIMARY KEY ("Hotel_Id", "Room_Id", "Type"),
  CONSTRAINT "fk_Amenities_Room"
    FOREIGN KEY ("Hotel_Id", "Room_Id")
    REFERENCES "Room"("Hotel_Id", "Room_Id")
    ON DELETE CASCADE
);

CREATE TABLE "Issues" (
  "Hotel_Id" BIGINT NOT NULL,
  "Room_Id" BIGINT NOT NULL,
  "Type" TEXT NOT NULL,
  PRIMARY KEY ("Hotel_Id", "Room_Id", "Type"),
  CONSTRAINT "fk_Issues_Room"
    FOREIGN KEY ("Hotel_Id", "Room_Id")
    REFERENCES "Room"("Hotel_Id", "Room_Id")
    ON DELETE CASCADE
);

CREATE TABLE "Booking" (
  "Booking_Id" BIGSERIAL PRIMARY KEY,
  "Hotel_Id" BIGINT NOT NULL,
  "Room_Id" BIGINT NOT NULL,
  "Customer_SSN" VARCHAR(40),
  "Start_Date" DATE NOT NULL,
  "End_Date" DATE NOT NULL,
  "Booking_Status" VARCHAR(20) NOT NULL CHECK ("Booking_Status" IN ('Pending', 'Confirmed', 'Converted', 'Cancelled')),
  "Book_Date" DATE NOT NULL DEFAULT CURRENT_DATE,
  CHECK ("End_Date" > "Start_Date"),
  CONSTRAINT "fk_Booking_Room"
    FOREIGN KEY ("Hotel_Id", "Room_Id")
    REFERENCES "Room"("Hotel_Id", "Room_Id")
    ON DELETE RESTRICT,
  CONSTRAINT "fk_Booking_Customer"
    FOREIGN KEY ("Customer_SSN")
    REFERENCES "Customer"("Customer_SSN")
    ON DELETE SET NULL
);

CREATE TABLE "Renting" (
  "Renting_Id" BIGSERIAL PRIMARY KEY,
  "Booking_Id" BIGINT,
  "Hotel_Id" BIGINT NOT NULL,
  "Room_Id" BIGINT NOT NULL,
  "Customer_SSN" VARCHAR(40) NOT NULL,
  "Employee_SSN" VARCHAR(40) NOT NULL,
  "Start_Date" DATE NOT NULL,
  "End_Date" DATE NOT NULL,
  "Booking_Status" VARCHAR(20) NOT NULL CHECK ("Booking_Status" IN ('Pending', 'Confirmed', 'Converted', 'Cancelled', 'Active', 'Completed')),
  "Book_Date" DATE NOT NULL DEFAULT CURRENT_DATE,
  CHECK ("End_Date" > "Start_Date"),
  CONSTRAINT "fk_Renting_Booking"
    FOREIGN KEY ("Booking_Id")
    REFERENCES "Booking"("Booking_Id")
    ON DELETE SET NULL,
  CONSTRAINT "fk_Renting_Room"
    FOREIGN KEY ("Hotel_Id", "Room_Id")
    REFERENCES "Room"("Hotel_Id", "Room_Id")
    ON DELETE RESTRICT,
  CONSTRAINT "fk_Renting_Customer"
    FOREIGN KEY ("Customer_SSN")
    REFERENCES "Customer"("Customer_SSN")
    ON DELETE RESTRICT,
  CONSTRAINT "fk_Renting_Employee"
    FOREIGN KEY ("Employee_SSN")
    REFERENCES "Employee"("Employee_SSN")
    ON DELETE RESTRICT
);

CREATE TABLE "EmployeeRole" (
  "Employee_SSN" VARCHAR(40) NOT NULL,
  "Role_Type" VARCHAR(80) NOT NULL CHECK ("Role_Type" IN ('Employee', 'Hotel Manager')),
  PRIMARY KEY ("Employee_SSN", "Role_Type"),
  CONSTRAINT "fk_EmployeeRole_Employee"
    FOREIGN KEY ("Employee_SSN")
    REFERENCES "Employee"("Employee_SSN")
    ON DELETE CASCADE
);

CREATE TABLE "HotelChainNumber" (
  "HotelChain_Id" BIGINT NOT NULL,
  "PhoneNumber" VARCHAR(40) NOT NULL,
  PRIMARY KEY ("HotelChain_Id", "PhoneNumber"),
  CONSTRAINT "fk_HotelChainNumber_HotelChain"
    FOREIGN KEY ("HotelChain_Id")
    REFERENCES "HotelChain"("HotelChain_Id")
    ON DELETE CASCADE
);

CREATE TABLE "HotelChainEmail" (
  "HotelChain_Id" BIGINT NOT NULL,
  "Email" TEXT NOT NULL,
  PRIMARY KEY ("HotelChain_Id", "Email"),
  CONSTRAINT "fk_HotelChainEmail_HotelChain"
    FOREIGN KEY ("HotelChain_Id")
    REFERENCES "HotelChain"("HotelChain_Id")
    ON DELETE CASCADE
);

CREATE TABLE "Payment" (
  "Payment_Id" BIGSERIAL PRIMARY KEY,
  "Renting_Id" BIGINT NOT NULL,
  "Amount" NUMERIC(10, 2) NOT NULL CHECK ("Amount" >= 0),
  "Payment_Method" VARCHAR(30) NOT NULL CHECK ("Payment_Method" IN ('Cash', 'Credit Card', 'Debit Card', 'Wire Transfer')),
  "Payment_Date" DATE NOT NULL DEFAULT CURRENT_DATE,
  CONSTRAINT "fk_Payment_Renting"
    FOREIGN KEY ("Renting_Id")
    REFERENCES "Renting"("Renting_Id")
    ON DELETE CASCADE
);

CREATE TABLE "Booking_Archive" (
  "Booking_Id" BIGINT PRIMARY KEY,
  "Hotel_Id" BIGINT,
  "Room_Id" BIGINT,
  "Customer_SSN" VARCHAR(40),
  "Customer_First_Name" VARCHAR(80) NOT NULL,
  "Customer_Last_Name" VARCHAR(80) NOT NULL,
  "Customer_Address" TEXT NOT NULL,
  "Start_Date" DATE NOT NULL,
  "End_Date" DATE NOT NULL,
  "Booking_Status" VARCHAR(20) NOT NULL,
  "Book_Date" DATE NOT NULL,
  "Hotel_Address" TEXT NOT NULL,
  "Room_Price" NUMERIC(10, 2) NOT NULL
);

CREATE TABLE "Renting_Archive" (
  "Renting_Id" BIGINT PRIMARY KEY,
  "Booking_Id" BIGINT,
  "Hotel_Id" BIGINT,
  "Room_Id" BIGINT,
  "Customer_SSN" VARCHAR(40),
  "Employee_SSN" VARCHAR(40),
  "Customer_First_Name" VARCHAR(80) NOT NULL,
  "Customer_Last_Name" VARCHAR(80) NOT NULL,
  "Employee_First_Name" VARCHAR(80) NOT NULL,
  "Employee_Last_Name" VARCHAR(80) NOT NULL,
  "Start_Date" DATE NOT NULL,
  "End_Date" DATE NOT NULL,
  "Booking_Status" VARCHAR(20) NOT NULL,
  "Book_Date" DATE NOT NULL,
  "Hotel_Address" TEXT NOT NULL,
  "Room_Price" NUMERIC(10, 2) NOT NULL
);
