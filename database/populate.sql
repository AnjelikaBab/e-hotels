-- Contents: 5 chains, 8 hotels per chain (40 hotels), 3+ star ratings per chain, two hotels share area (New York);
--           each hotel has 5 rooms (single..suite);

BEGIN;

INSERT INTO "HotelChain" ("HotelChain_Id", "Central_Office_Address", "Num_of_Hotels") VALUES
  (1, '100 Park Avenue, New York, NY 10017', 0),
  (2, '450 Ocean Drive, Miami, FL 33139', 0),
  (3, '789 Alpine Way, Denver, CO 80202', 0),
  (4, '321 Downtown Boulevard, Chicago, IL 60601', 0),
  (5, '567 Historic Lane, Boston, MA 02108', 0);

INSERT INTO "HotelChainNumber" ("HotelChain_Id", "PhoneNumber") VALUES
  (1, '+1-800-555-0101'), (1, '+1-800-555-0102'),
  (2, '+1-800-555-0201'), (2, '+1-800-555-0202'),
  (3, '+1-800-555-0301'), (3, '+1-800-555-0302'),
  (4, '+1-800-555-0401'), (4, '+1-800-555-0402'),
  (5, '+1-800-555-0501'), (5, '+1-800-555-0502');

INSERT INTO "HotelChainEmail" ("HotelChain_Id", "Email") VALUES
  (1, 'contact@prestigehotels.demo'), (1, 'partners@prestigehotels.demo'),
  (2, 'info@coastalresorts.demo'), (2, 'support@coastalresorts.demo'),
  (3, 'reservations@mountainlodge.demo'), (3, 'ops@mountainlodge.demo'),
  (4, 'hello@urbansuites.demo'), (4, 'corp@urbansuites.demo'),
  (5, 'welcome@grandheritage.demo'), (5, 'vip@grandheritage.demo');


INSERT INTO "Hotel" ("Hotel_Id", "Rating", "Address", "Email", "Num_of_Rooms", "Phone_Number", "Manager_Id", "HotelChain_Id")
SELECT
  u.i,
  CASE ((u.i - 1) % 3) WHEN 0 THEN 3 WHEN 1 THEN 4 ELSE 5 END,
  u.addr,
  'hotel' || u.i || '@chain' || ((u.i - 1) / 8 + 1) || '.demo',
  5,
  '+1-212-555-' || LPAD(u.i::text, 4, '0'),
  NULL,
  (u.i - 1) / 8 + 1
FROM unnest(
  ARRAY[
    '100 Park Avenue, New York, NY 10017',
    '200 Madison Avenue, New York, NY 10016',
    '50 Boylston Street, Boston, MA 02116',
    '200 N Michigan Avenue, Chicago, IL 60601',
    '1500 Ocean Drive, Miami Beach, FL 33139',
    '9876 Wilshire Boulevard, Los Angeles, CA 90024',
    '2100 Westlake Avenue, Seattle, WA 98121',
    '1914 Commerce Street, Dallas, TX 75201',
    '88 Queens Quay West, Toronto, ON M5J 0B6',
    '425 Waterfront Road, Vancouver, BC V6C 3R7',
    '740 Lake Eola Drive, Orlando, FL 32801',
    '90 Harbour Island Boulevard, Tampa, FL 33602',
    '1501 Ocean Avenue, San Diego, CA 92101',
    '1020 Granville Street, Vancouver, BC V6Z 1L5',
    '12 Lower Water Street, Halifax, NS B3J 1R3',
    '410 Alpine Plaza, Denver, CO 80205',
    '98 Blackcomb Way, Whistler, BC V8E 1M5',
    '420 Wasatch Avenue, Salt Lake City, UT 84101',
    '77 Bow Trail SW, Calgary, AB T3C 2T8',
    '15 Côte de la Montagne, Quebec City, QC G1K 4E2',
    '200 King Street West, Toronto, ON M5H 3T4',
    '470 10th Avenue, New York, NY 10018',
    '990 Peachtree Street NE, Atlanta, GA 30309',
    '610 Congress Avenue, Austin, TX 78701',
    '1600 Arch Street, Philadelphia, PA 19103',
    '14 Meeting Street, Charleston, SC 29401',
    '220 River Street, Savannah, GA 31401',
    '55 Bloor Street West, Toronto, ON M4W 1A5',
    '730 Canal Street, New Orleans, LA 70130',
    '101 Wellington Street, Ottawa, ON K1A 0A9',
    '300 Peachtree Street, Atlanta, GA 30308',
    '400 Biscayne Boulevard, Miami, FL 33132',
    '500 Royal Street, New Orleans, LA 70130',
    '600 Spring Garden Road, Halifax, NS B3H 1K4',
    '700 Burrard Street, Vancouver, BC V6Z 2H7',
    '800 Robson Street, Vancouver, BC V6Z 3B7',
    '900 Saint-Catherine Street, Montreal, QC H3B 1E3',
    '1000 Rue Sainte-Catherine Ouest, Montreal, QC H3B 1A7',
    '1100 Peel Street, Montreal, QC H3B 2T6',
    '1200 University Avenue, Toronto, ON M5G 1V7'
  ]
) WITH ORDINALITY AS u(addr, i);

INSERT INTO "Employee" ("Employee_SSN", "First_Name", "Last_Name", "Address", "Hotel_Id")
SELECT '101-01-' || LPAD(gs::text, 4, '0'), 'Manager', 'Hotel' || gs, '1 Internal Way, Staff City, ST 00000', gs
FROM generate_series(1, 40) AS gs;

INSERT INTO "Employee" ("Employee_SSN", "First_Name", "Last_Name", "Address", "Hotel_Id")
SELECT '102-01-' || LPAD(gs::text, 4, '0'), 'Staff', 'Hotel' || gs, '2 Internal Way, Staff City, ST 00000', gs
FROM generate_series(1, 40) AS gs;

UPDATE "Hotel" h
SET "Manager_Id" = '101-01-' || LPAD(h."Hotel_Id"::text, 4, '0');

INSERT INTO "EmployeeRole" ("Employee_SSN", "Role_Type")
SELECT '101-01-' || LPAD(gs::text, 4, '0'), 'Hotel Manager' FROM generate_series(1, 40) AS gs
UNION ALL
SELECT '102-01-' || LPAD(gs::text, 4, '0'), 'Employee' FROM generate_series(1, 40) AS gs;

INSERT INTO "Room" ("Hotel_Id", "Room_Id", "Price", "Capacity", "View_Type", "Extendable")
SELECT
  h."Hotel_Id",
  rnum,
  (120 + h."Hotel_Id" * 3 + rnum * 7)::numeric(10, 2),
  CASE rnum
    WHEN 1 THEN 'single'
    WHEN 2 THEN 'double'
    WHEN 3 THEN 'triple'
    WHEN 4 THEN 'quad'
    ELSE 'suite'
  END,
  CASE (h."Hotel_Id" + rnum) % 5
    WHEN 0 THEN 'sea_view'
    WHEN 1 THEN 'mountain_view'
    WHEN 2 THEN 'city_view'
    WHEN 3 THEN 'garden_view'
    ELSE 'no_view'
  END,
  (rnum < 5)
FROM "Hotel" h
CROSS JOIN generate_series(1, 5) AS rnum;

INSERT INTO "Amenities" ("Hotel_Id", "Room_Id", "Type")
SELECT h."Hotel_Id", 1, 'WiFi' FROM "Hotel" h WHERE h."Hotel_Id" <= 40
UNION ALL
SELECT h."Hotel_Id", 1, 'TV' FROM "Hotel" h WHERE h."Hotel_Id" <= 40
UNION ALL
SELECT h."Hotel_Id", 5, 'Mini Bar' FROM "Hotel" h WHERE mod(h."Hotel_Id", 2) = 0;

INSERT INTO "Issues" ("Hotel_Id", "Room_Id", "Type")
SELECT 3, 2, 'Minor carpet wear'
UNION ALL SELECT 12, 1, 'AC noise reported';

INSERT INTO "Customer" ("Customer_SSN", "First_Name", "Last_Name", "Registration_Date", "Address") VALUES
  ('222-01-0001', 'John', 'Smith', DATE '2024-01-15', '123 Main Street, Boston, MA 02108'),
  ('222-01-0002', 'Sarah', 'Johnson', DATE '2024-02-20', '456 Oak Avenue, New York, NY 10001'),
  ('222-01-0003', 'Michael', 'Chen', DATE '2024-03-10', '789 Pine Road, San Francisco, CA 94102'),
  ('222-01-0004', 'Emily', 'Davis', DATE '2024-01-05', '321 Maple Drive, Chicago, IL 60601'),
  ('222-01-0005', 'David', 'Martinez', DATE '2024-04-12', '654 Elm Street, Miami, FL 33139'),
  ('222-01-0006', 'Anna', 'Lee', DATE '2024-05-01', '10 King Street, Toronto, ON M5H 1A1'),
  ('222-01-0007', 'Carlos', 'Ruiz', DATE '2024-06-20', '20 Bay Street, Toronto, ON M5J 2N8'),
  ('222-01-0008', 'Priya', 'Patel', DATE '2024-07-11', '500 Granville Street, Vancouver, BC V6C 1W6'),
  ('222-01-0009', 'Olivia', 'Brown', DATE '2024-08-02', '700 Peachtree Street, Atlanta, GA 30308'),
  ('222-01-0010', 'Liam', 'O''Connor', DATE '2024-09-09', '40 Harbour Street, Halifax, NS B3J 1A1');

INSERT INTO "Booking" ("Hotel_Id", "Room_Id", "Customer_SSN", "Start_Date", "End_Date", "Booking_Status", "Book_Date") VALUES
  (1, 1, '222-01-0001', CURRENT_DATE + 14, CURRENT_DATE + 18, 'Confirmed', CURRENT_DATE),
  (1, 2, '222-01-0002', CURRENT_DATE + 20, CURRENT_DATE + 24, 'Pending', CURRENT_DATE),
  (2, 1, '222-01-0003', CURRENT_DATE + 10, CURRENT_DATE + 13, 'Confirmed', CURRENT_DATE),
  (3, 1, '222-01-0004', CURRENT_DATE + 25, CURRENT_DATE + 28, 'Pending', CURRENT_DATE),
  (5, 2, '222-01-0005', CURRENT_DATE + 30, CURRENT_DATE + 35, 'Confirmed', CURRENT_DATE),
  (9, 3, '222-01-0006', CURRENT_DATE + 12, CURRENT_DATE + 15, 'Confirmed', CURRENT_DATE),
  (10, 1, '222-01-0007', CURRENT_DATE + 8, CURRENT_DATE + 11, 'Pending', CURRENT_DATE),
  (11, 4, '222-01-0008', CURRENT_DATE + 16, CURRENT_DATE + 19, 'Confirmed', CURRENT_DATE),
  (17, 2, '222-01-0009', CURRENT_DATE + 22, CURRENT_DATE + 26, 'Pending', CURRENT_DATE),
  (25, 5, '222-01-0010', CURRENT_DATE + 40, CURRENT_DATE + 45, 'Confirmed', CURRENT_DATE);


INSERT INTO "Renting" ("Booking_Id", "Hotel_Id", "Room_Id", "Customer_SSN", "Employee_SSN", "Start_Date", "End_Date", "Renting_Status", "Book_Date") VALUES
  (NULL, 4, 1, '222-01-0003', '102-01-0004', CURRENT_DATE + 7, CURRENT_DATE + 10, 'Active', CURRENT_DATE),
  (NULL, 6, 2, '222-01-0005', '102-01-0006', CURRENT_DATE + 9, CURRENT_DATE + 12, 'Active', CURRENT_DATE),
  (NULL, 8, 3, '222-01-0001', '102-01-0008', CURRENT_DATE + 11, CURRENT_DATE + 14, 'Confirmed', CURRENT_DATE);


INSERT INTO "Renting" ("Booking_Id", "Hotel_Id", "Room_Id", "Customer_SSN", "Employee_SSN", "Start_Date", "End_Date", "Renting_Status", "Book_Date")
SELECT b."Booking_Id", b."Hotel_Id", b."Room_Id", b."Customer_SSN", '102-01-0001', CURRENT_DATE + 50, CURRENT_DATE + 55, 'Converted', CURRENT_DATE
FROM "Booking" b
WHERE b."Hotel_Id" = 1 AND b."Room_Id" = 1 AND b."Customer_SSN" = '222-01-0001'
LIMIT 1;

INSERT INTO "Payment" ("Renting_Id", "Amount", "Payment_Method", "Payment_Date")
SELECT r."Renting_Id", 450.00, 'Credit Card', CURRENT_DATE
FROM "Renting" r
WHERE r."Hotel_Id" = 4 AND r."Room_Id" = 1 AND r."Booking_Id" IS NULL
LIMIT 1;

INSERT INTO "Payment" ("Renting_Id", "Amount", "Payment_Method", "Payment_Date")
SELECT r."Renting_Id", 320.50, 'Debit Card', CURRENT_DATE
FROM "Renting" r
WHERE r."Hotel_Id" = 6 AND r."Room_Id" = 2 AND r."Booking_Id" IS NULL
LIMIT 1;

UPDATE "HotelChain" hc
SET "Num_of_Hotels" = (SELECT COUNT(*) FROM "Hotel" h WHERE h."HotelChain_Id" = hc."HotelChain_Id");

SELECT setval(pg_get_serial_sequence('"HotelChain"', 'HotelChain_Id'), (SELECT COALESCE(MAX("HotelChain_Id"), 1) FROM "HotelChain"));
SELECT setval(pg_get_serial_sequence('"Hotel"', 'Hotel_Id'), (SELECT COALESCE(MAX("Hotel_Id"), 1) FROM "Hotel"));
SELECT setval(pg_get_serial_sequence('"Booking"', 'Booking_Id'), (SELECT COALESCE(MAX("Booking_Id"), 1) FROM "Booking"));
SELECT setval(pg_get_serial_sequence('"Renting"', 'Renting_Id'), (SELECT COALESCE(MAX("Renting_Id"), 1) FROM "Renting"));
SELECT setval(pg_get_serial_sequence('"Payment"', 'Payment_Id'), (SELECT COALESCE(MAX("Payment_Id"), 1) FROM "Payment"));

COMMIT;
