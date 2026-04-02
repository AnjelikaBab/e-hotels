CREATE OR REPLACE VIEW "vw_AvailableRoomsPerArea" AS
SELECT
  TRIM(SPLIT_PART(h."Address", ',', 2)) AS "Area",
  COUNT(DISTINCT h."Hotel_Id") AS "Hotels_In_Area",
  COUNT(*) FILTER (
    WHERE NOT EXISTS (
      SELECT 1
      FROM "Booking" b
      WHERE b."Hotel_Id" = r."Hotel_Id"
        AND b."Room_Id" = r."Room_Id"
        AND b."Booking_Status" IN ('Pending', 'Confirmed')
        AND CURRENT_DATE >= b."Start_Date"
        AND CURRENT_DATE < b."End_Date"
    )
    AND NOT EXISTS (
      SELECT 1
      FROM "Renting" re
      WHERE re."Hotel_Id" = r."Hotel_Id"
        AND re."Room_Id" = r."Room_Id"
        AND re."Booking_Status" IN ('Active', 'Confirmed', 'Converted')
        AND CURRENT_DATE >= re."Start_Date"
        AND CURRENT_DATE < re."End_Date"
    )
  ) AS "Available_Rooms"
FROM "Hotel" h
JOIN "Room" r ON r."Hotel_Id" = h."Hotel_Id"
GROUP BY TRIM(SPLIT_PART(h."Address", ',', 2));

CREATE OR REPLACE VIEW "vw_HotelAggregatedCapacity" AS
SELECT
  h."Hotel_Id",
  h."Address" AS "Hotel_Address",
  hc."HotelChain_Id",
  COUNT(r."Room_Id") AS "Room_Count",
  SUM(
    CASE r."Capacity"
      WHEN 'single' THEN 1
      WHEN 'double' THEN 2
      WHEN 'triple' THEN 3
      WHEN 'quad' THEN 4
      WHEN 'suite' THEN 5
      ELSE 0
    END
  ) AS "Aggregated_Capacity"
FROM "Hotel" h
JOIN "HotelChain" hc ON hc."HotelChain_Id" = h."HotelChain_Id"
JOIN "Room" r ON r."Hotel_Id" = h."Hotel_Id"
GROUP BY h."Hotel_Id", h."Address", hc."HotelChain_Id";
