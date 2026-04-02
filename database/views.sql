CREATE VIEW AvailableRoomsPerArea AS
SELECT
    h.Area,
    COUNT(*) AS Available_Rooms
FROM Room r
JOIN Hotel h ON h.Hotel_Id = r.Hotel_Id
WHERE NOT EXISTS (
    SELECT 1
    FROM Booking b
    WHERE b.Hotel_Id = r.Hotel_Id
      AND b.Room_Id = r.Room_Id
      AND b.Booking_Status = 'active'
      AND b.Start_Date <= CURRENT_DATE
      AND b.End_Date > CURRENT_DATE
)
AND NOT EXISTS (
    SELECT 1
    FROM Renting rt
    WHERE rt.Hotel_Id = r.Hotel_Id
      AND rt.Room_Id = r.Room_Id
      AND rt.Start_Date <= CURRENT_DATE
      AND rt.End_Date > CURRENT_DATE
)
GROUP BY h.Area;

CREATE VIEW HotelCapacity AS
SELECT
    h.Hotel_Id,
    h.Address,
    COUNT(*) AS Total_Rooms,
    SUM(
        CASE r.Capacity
            WHEN 'single' THEN 1
            WHEN 'double' THEN 2
            WHEN 'triple' THEN 3
            WHEN 'quad' THEN 4
            WHEN 'suite' THEN 5
        END
    ) AS Total_Capacity
FROM Hotel h
JOIN Room r ON r.Hotel_Id = h.Hotel_Id
GROUP BY h.Hotel_Id, h.Address;