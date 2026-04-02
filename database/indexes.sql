-- Index 1: Speed up room availability searches by date
CREATE INDEX idx_booking_dates ON Booking(Start_Date, End_Date);

-- Index 2: Speed up searches by area
CREATE INDEX idx_hotel_area ON Hotel(Area);

-- Index 3: Speed up price range queries
CREATE INDEX idx_room_price ON Room(Price);