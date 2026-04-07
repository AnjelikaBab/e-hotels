-- Indexes for e-hotels (assignment 2e)
-- Run after schema.sql, views.sql, enforcement.sql, and populate.sql (indexes work on empty tables too).
--
-- 1) Hotel by chain — expected workload: list/filter hotels by chain (employee portal, chain
--    management, reports). B-tree on FK column speeds WHERE "HotelChain_Id" = ? and JOINs to HotelChain.
CREATE INDEX IF NOT EXISTS "idx_Hotel_HotelChain_Id"
  ON "Hotel" ("HotelChain_Id");

-- 2) Booking by room — expected workload: availability checks, date overlap exclusion, and
--    joins Booking to Room/Hotel. Composite index matches lookups by (hotel, room) and supports
--    range filters on dates when combined with planner use of exclusion constraint indexes.
CREATE INDEX IF NOT EXISTS "idx_Booking_Hotel_Room"
  ON "Booking" ("Hotel_Id", "Room_Id");

-- 3) Renting by customer — expected workload: customer history, payments, archive-style lookups
--    WHERE "Customer_SSN" = ?. Speeds portal queries that list all rentings for a guest.
CREATE INDEX IF NOT EXISTS "idx_Renting_Customer_SSN"
  ON "Renting" ("Customer_SSN");
