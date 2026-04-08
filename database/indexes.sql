CREATE INDEX IF NOT EXISTS "idx_Hotel_HotelChain_Id"
  ON "Hotel" ("HotelChain_Id");

CREATE INDEX IF NOT EXISTS "idx_Booking_Hotel_Room"
  ON "Booking" ("Hotel_Id", "Room_Id");

CREATE INDEX IF NOT EXISTS "idx_Renting_Customer_SSN"
  ON "Renting" ("Customer_SSN");
