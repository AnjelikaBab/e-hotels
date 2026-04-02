-- Query 1: Aggregation - Count rooms per hotel
SELECT h.Hotel_Id, h.Address, COUNT(r.Room_Id) AS Total_Rooms
FROM Hotel h
JOIN Room r ON h.Hotel_Id = r.Hotel_Id
GROUP BY h.Hotel_Id, h.Address;

-- Query 2: Nested Query - Hotels with above-average room prices
SELECT h.Hotel_Id, h.Address
FROM Hotel h
WHERE h.Hotel_Id IN (
    SELECT r.Hotel_Id
    FROM Room r
    GROUP BY r.Hotel_Id
    HAVING AVG(r.Price) > (SELECT AVG(Price) FROM Room)
);

-- Query 3: Find available rooms for specific dates
SELECT r.Hotel_Id, r.Room_Id, r.Price, r.Capacity
FROM Room r
WHERE (r.Hotel_Id, r.Room_Id) NOT IN (
    SELECT b.Hotel_Id, b.Room_Id
    FROM Booking b
    WHERE b.Booking_Status = 'active'
      AND b.Start_Date <= '2026-04-05'
      AND b.End_Date >= '2026-04-01'
);

-- Query 4: Total revenue per hotel chain
SELECT hc.HotelChain_Id, SUM(rent.Payment_Amount) AS Total_Revenue
FROM HotelChain hc
JOIN Hotel h ON hc.HotelChain_Id = h.HotelChain_Id
JOIN Renting rent ON h.Hotel_Id = rent.Hotel_Id
WHERE rent.Payment_Status = 'paid'
GROUP BY hc.HotelChain_Id;