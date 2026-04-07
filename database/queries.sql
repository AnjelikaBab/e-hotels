-- Sample queries for e-hotels (assignment 2c)
-- At least 4 queries: includes aggregation (Query 1) and a nested subquery (Query 2).
-- Run against a populated database (after populate.sql).

-- -----------------------------------------------------------------------------
-- Query 1 — Aggregation: average room price per hotel chain (GROUP BY + AVG)
-- -----------------------------------------------------------------------------
SELECT
  hc."HotelChain_Id",
  hc."Central_Office_Address",
  ROUND(AVG(r."Price")::numeric, 2) AS "Avg_Room_Price"
FROM "HotelChain" hc
JOIN "Hotel" h ON h."HotelChain_Id" = hc."HotelChain_Id"
JOIN "Room" r ON r."Hotel_Id" = h."Hotel_Id"
GROUP BY hc."HotelChain_Id", hc."Central_Office_Address"
ORDER BY hc."HotelChain_Id";

-- -----------------------------------------------------------------------------
-- Query 2 — Nested query: hotels that have at least one suite room priced above the
--           chain-wide average suite price (subquery in HAVING / scalar subquery)
-- -----------------------------------------------------------------------------
SELECT
  h."Hotel_Id",
  h."Address",
  h."Rating",
  MIN(r."Price") AS "Min_Suite_Price"
FROM "Hotel" h
JOIN "Room" r ON r."Hotel_Id" = h."Hotel_Id"
WHERE r."Capacity" = 'suite'
GROUP BY h."Hotel_Id", h."Address", h."Rating", h."HotelChain_Id"
HAVING MIN(r."Price") > (
  SELECT AVG(r2."Price")
  FROM "Room" r2
  JOIN "Hotel" h2 ON h2."Hotel_Id" = r2."Hotel_Id"
  WHERE h2."HotelChain_Id" = h."HotelChain_Id"
    AND r2."Capacity" = 'suite'
)
ORDER BY h."Hotel_Id";

-- -----------------------------------------------------------------------------
-- Query 3 — Join + filter: pending or confirmed bookings starting in the next 30 days
-- -----------------------------------------------------------------------------
SELECT
  b."Booking_Id",
  c."First_Name",
  c."Last_Name",
  h."Address" AS "Hotel_Address",
  b."Start_Date",
  b."End_Date",
  b."Booking_Status"
FROM "Booking" b
JOIN "Customer" c ON c."Customer_SSN" = b."Customer_SSN"
JOIN "Hotel" h ON h."Hotel_Id" = b."Hotel_Id"
WHERE b."Booking_Status" IN ('Pending', 'Confirmed')
  AND b."Start_Date" >= CURRENT_DATE
  AND b."Start_Date" < CURRENT_DATE + INTERVAL '30 days'
ORDER BY b."Start_Date", b."Booking_Id";

-- -----------------------------------------------------------------------------
-- Query 4 — EXISTS: employees who have recorded at least one payment (correlated EXISTS)
-- -----------------------------------------------------------------------------
SELECT DISTINCT
  e."Employee_SSN",
  e."First_Name",
  e."Last_Name",
  h."Address" AS "Hotel_Address"
FROM "Employee" e
JOIN "Hotel" h ON h."Hotel_Id" = e."Hotel_Id"
WHERE EXISTS (
  SELECT 1
  FROM "Renting" re
  JOIN "Payment" p ON p."Renting_Id" = re."Renting_Id"
  WHERE re."Employee_SSN" = e."Employee_SSN"
)
ORDER BY e."Last_Name", e."First_Name";
