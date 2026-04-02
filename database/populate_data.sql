INSERT INTO HotelChain (Name, Central_Office_Address) VALUES
('Aurora Hotels', '100 King St, Toronto, ON'),
('Maple Crown', '50 Yonge St, Toronto, ON'),
('Pacific Luxe', '200 Burrard St, Vancouver, BC'),
('Continental Stay', '10 Wacker Dr, Chicago, IL'),
('Blue Horizon Inns', '90 Brickell Ave, Miami, FL');

INSERT INTO HotelChainEmail VALUES
(1,'contact@aurora.com'),(2,'support@maplecrown.com'),(3,'hello@pacificluxe.com'),(4,'info@continentalstay.com'),(5,'reservations@bluehorizon.com');
INSERT INTO HotelChainPhone VALUES
(1,'+1-416-555-1001'),(2,'+1-416-555-1002'),(3,'+1-604-555-1003'),(4,'+1-312-555-1004'),(5,'+1-305-555-1005');

INSERT INTO Hotel (HotelChain_Id, Rating, Address, Area, Email, Phone_Number) VALUES
(1,5,'1 Times Sq, New York, NY','Manhattan','ny@aurora.com','212-555-0001'),
(1,4,'500 Market St, San Francisco, CA','Downtown SF','sf@aurora.com','415-555-0002'),
(1,3,'800 Boylston St, Boston, MA','Back Bay','bos@aurora.com','617-555-0003'),
(1,2,'77 St-Catherine St, Montreal, QC','Downtown Montreal','mtl@aurora.com','514-555-0004'),
(2,5,'200 Michigan Ave, Chicago, IL','Chicago Loop','chi@maplecrown.com','312-555-0101'),
(2,4,'1500 Broadway, Nashville, TN','Music Row','nsh@maplecrown.com','615-555-0102'),
(2,3,'300 Canal St, New Orleans, LA','French Quarter','nol@maplecrown.com','504-555-0103'),
(2,2,'700 17th St, Denver, CO','LoDo','den@maplecrown.com','303-555-0104'),
(3,5,'1200 Robson St, Vancouver, BC','West End','van@pacificluxe.com','604-555-0201'),
(3,4,'250 8th Ave, Seattle, WA','Downtown Seattle','sea@pacificluxe.com','206-555-0202'),
(3,3,'60 Congress St, Portland, ME','Old Port','por@pacificluxe.com','207-555-0203'),
(3,2,'220 Congress Ave, Austin, TX','Downtown Austin','aus@pacificluxe.com','512-555-0204'),
(4,5,'1 Rue Sainte-Anne, Quebec City, QC','Old Quebec','qc@continentalstay.com','418-555-0301'),
(4,4,'101 Rideau St, Ottawa, ON','ByWard','ott@continentalstay.com','613-555-0302'),
(4,3,'300 7th Ave, Calgary, AB','Downtown Calgary','yyc@continentalstay.com','403-555-0303'),
(4,2,'88 Granville St, Halifax, NS','Waterfront','hal@continentalstay.com','902-555-0304'),
(5,5,'1401 Ocean Dr, Miami, FL','South Beach','mia@bluehorizon.com','305-555-0401'),
(5,4,'99 Beale St, Memphis, TN','Downtown Memphis','mem@bluehorizon.com','901-555-0402'),
(5,3,'12 Riverwalk, San Antonio, TX','River Walk','sat@bluehorizon.com','210-555-0403'),
(5,2,'50 Rue St-Paul, Mexico City, MX','Centro Historico','cdmx@bluehorizon.com','+52-55-5555-0404');

INSERT INTO Room (Hotel_Id, Room_Id, Price, Capacity, View_Type, Extendable) VALUES
(1,101,220,'single','city',0),(1,102,310,'double','city',1),
(2,101,240,'single','city',0),(2,102,360,'suite','sea',0),
(5,101,190,'double','city',1),(5,102,270,'triple','city',1),
(9,101,280,'double','mountain',0),(9,102,460,'suite','mountain',0),
(17,101,350,'double','sea',1),(17,102,520,'suite','sea',0);

INSERT INTO RoomAmenities VALUES
(1,101,'WiFi'),(1,101,'TV'),(1,102,'WiFi'),(1,102,'Mini Fridge'),
(17,101,'Balcony'),(17,101,'AC');

INSERT INTO RoomIssues VALUES
(2,101,'Bathroom faucet leak');

INSERT INTO Customer (Customer_SSN, First_Name, Last_Name, Address, Registration_Date) VALUES
('CUS-1001','John','Doe','123 King St, Toronto, ON','2026-01-10'),
('CUS-1002','Jane','Smith','90 Queen St, Ottawa, ON','2026-02-12'),
('CUS-1003','Ali','Khan','44 Main St, Chicago, IL','2026-03-01');

INSERT INTO Employee (Employee_SSN, Hotel_Id, First_Name, Last_Name, Address) VALUES
('EMP-2001',1,'Alice','Brown','1 Staff Way, New York, NY'),
('EMP-2002',1,'Mark','Evans','2 Staff Way, New York, NY'),
('EMP-2003',17,'Maria','Lopez','3 Staff Way, Miami, FL');

INSERT INTO EmployeeRole VALUES
('EMP-2001','Manager'),('EMP-2002','Receptionist'),('EMP-2003','Manager');

INSERT INTO HotelManager VALUES
(1,'EMP-2001'),(17,'EMP-2003');

INSERT INTO Booking (Hotel_Id, Room_Id, Customer_SSN, Start_Date, End_Date, Booking_Status)
VALUES
(1,101,'CUS-1001','2026-04-03','2026-04-06','active'),
(17,101,'CUS-1002','2026-04-10','2026-04-14','active');