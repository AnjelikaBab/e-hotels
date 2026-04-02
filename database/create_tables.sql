CREATE TABLE HotelChain (
    HotelChain_Id INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(120) NOT NULL UNIQUE,
    Central_Office_Address VARCHAR(255) NOT NULL
);

CREATE TABLE HotelChainEmail (
    HotelChain_Id INT NOT NULL,
    Email VARCHAR(100) NOT NULL,
    PRIMARY KEY (HotelChain_Id, Email),
    FOREIGN KEY (HotelChain_Id) REFERENCES HotelChain(HotelChain_Id) ON DELETE CASCADE
);

CREATE TABLE HotelChainPhone (
    HotelChain_Id INT NOT NULL,
    Phone_Number VARCHAR(20) NOT NULL,
    PRIMARY KEY (HotelChain_Id, Phone_Number),
    FOREIGN KEY (HotelChain_Id) REFERENCES HotelChain(HotelChain_Id) ON DELETE CASCADE
);

CREATE TABLE Hotel (
    Hotel_Id INT PRIMARY KEY AUTO_INCREMENT,
    HotelChain_Id INT NOT NULL,
    Rating INT NOT NULL CHECK (Rating BETWEEN 1 AND 5),
    Address VARCHAR(255) NOT NULL,
    Area VARCHAR(100) NOT NULL,
    Email VARCHAR(100),
    Phone_Number VARCHAR(20),
    FOREIGN KEY (HotelChain_Id) REFERENCES HotelChain(HotelChain_Id) ON DELETE CASCADE
);

CREATE TABLE Room (
    Hotel_Id INT NOT NULL,
    Room_Id INT NOT NULL,
    Price DECIMAL(10,2) NOT NULL CHECK (Price > 0),
    Capacity ENUM('single', 'double', 'triple', 'quad', 'suite') NOT NULL,
    View_Type ENUM('sea', 'mountain', 'city', 'garden', 'none') NOT NULL,
    Extendable BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (Hotel_Id, Room_Id),
    FOREIGN KEY (Hotel_Id) REFERENCES Hotel(Hotel_Id) ON DELETE CASCADE
);

CREATE TABLE RoomAmenities (
    Hotel_Id INT NOT NULL,
    Room_Id INT NOT NULL,
    Amenity VARCHAR(50) NOT NULL,
    PRIMARY KEY (Hotel_Id, Room_Id, Amenity),
    FOREIGN KEY (Hotel_Id, Room_Id) REFERENCES Room(Hotel_Id, Room_Id) ON DELETE CASCADE
);

CREATE TABLE RoomIssues (
    Hotel_Id INT NOT NULL,
    Room_Id INT NOT NULL,
    Issue VARCHAR(255) NOT NULL,
    PRIMARY KEY (Hotel_Id, Room_Id, Issue),
    FOREIGN KEY (Hotel_Id, Room_Id) REFERENCES Room(Hotel_Id, Room_Id) ON DELETE CASCADE
);

CREATE TABLE Customer (
    Customer_SSN VARCHAR(20) PRIMARY KEY,
    First_Name VARCHAR(50) NOT NULL,
    Last_Name VARCHAR(50) NOT NULL,
    Address VARCHAR(255) NOT NULL,
    Registration_Date DATE NOT NULL DEFAULT (CURRENT_DATE)
);

CREATE TABLE Employee (
    Employee_SSN VARCHAR(20) PRIMARY KEY,
    Hotel_Id INT NOT NULL,
    First_Name VARCHAR(50) NOT NULL,
    Last_Name VARCHAR(50) NOT NULL,
    Address VARCHAR(255) NOT NULL,
    FOREIGN KEY (Hotel_Id) REFERENCES Hotel(Hotel_Id) ON DELETE CASCADE
);

CREATE TABLE EmployeeRole (
    Employee_SSN VARCHAR(20) NOT NULL,
    Role_Type VARCHAR(50) NOT NULL,
    PRIMARY KEY (Employee_SSN, Role_Type),
    FOREIGN KEY (Employee_SSN) REFERENCES Employee(Employee_SSN) ON DELETE CASCADE
);

CREATE TABLE HotelManager (
    Hotel_Id INT PRIMARY KEY,
    Employee_SSN VARCHAR(20) NOT NULL UNIQUE,
    FOREIGN KEY (Hotel_Id) REFERENCES Hotel(Hotel_Id) ON DELETE CASCADE,
    FOREIGN KEY (Employee_SSN) REFERENCES Employee(Employee_SSN) ON DELETE CASCADE
);

CREATE TABLE Booking (
    Booking_Id INT PRIMARY KEY AUTO_INCREMENT,
    Hotel_Id INT,
    Room_Id INT,
    Customer_SSN VARCHAR(20),
    Customer_Name_Snapshot VARCHAR(120) NOT NULL,
    Hotel_Address_Snapshot VARCHAR(255) NOT NULL,
    Room_Price_Snapshot DECIMAL(10,2) NOT NULL,
    Start_Date DATE NOT NULL,
    End_Date DATE NOT NULL,
    Booking_Status ENUM('active', 'cancelled', 'completed') DEFAULT 'active',
    Book_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (End_Date > Start_Date),
    FOREIGN KEY (Hotel_Id, Room_Id) REFERENCES Room(Hotel_Id, Room_Id) ON DELETE SET NULL,
    FOREIGN KEY (Customer_SSN) REFERENCES Customer(Customer_SSN) ON DELETE SET NULL
);

CREATE TABLE Renting (
    Renting_Id INT PRIMARY KEY AUTO_INCREMENT,
    Booking_Id INT,
    Hotel_Id INT,
    Room_Id INT,
    Customer_SSN VARCHAR(20),
    Employee_SSN VARCHAR(20),
    Customer_Name_Snapshot VARCHAR(120) NOT NULL,
    Employee_Name_Snapshot VARCHAR(120) NOT NULL,
    Hotel_Address_Snapshot VARCHAR(255) NOT NULL,
    Room_Price_Snapshot DECIMAL(10,2) NOT NULL,
    Start_Date DATE NOT NULL,
    End_Date DATE NOT NULL,
    Payment_Amount DECIMAL(10,2),
    Payment_Status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    CHECK (End_Date > Start_Date),
    FOREIGN KEY (Booking_Id) REFERENCES Booking(Booking_Id) ON DELETE SET NULL,
    FOREIGN KEY (Hotel_Id, Room_Id) REFERENCES Room(Hotel_Id, Room_Id) ON DELETE SET NULL,
    FOREIGN KEY (Customer_SSN) REFERENCES Customer(Customer_SSN) ON DELETE SET NULL,
    FOREIGN KEY (Employee_SSN) REFERENCES Employee(Employee_SSN) ON DELETE SET NULL
);

CREATE TABLE BookingArchive (
    Archive_Id INT PRIMARY KEY AUTO_INCREMENT,
    Original_Booking_Id INT NOT NULL,
    Customer_Name VARCHAR(120) NOT NULL,
    Customer_SSN VARCHAR(20),
    Hotel_Address VARCHAR(255) NOT NULL,
    Room_Number INT,
    Room_Price DECIMAL(10,2) NOT NULL,
    Start_Date DATE NOT NULL,
    End_Date DATE NOT NULL,
    Book_Date TIMESTAMP NOT NULL,
    Archived_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE RentingArchive (
    Archive_Id INT PRIMARY KEY AUTO_INCREMENT,
    Original_Renting_Id INT NOT NULL,
    Original_Booking_Id INT,
    Customer_Name VARCHAR(120) NOT NULL,
    Customer_SSN VARCHAR(20),
    Hotel_Address VARCHAR(255) NOT NULL,
    Room_Number INT,
    Room_Price DECIMAL(10,2) NOT NULL,
    Employee_Name VARCHAR(120) NOT NULL,
    Start_Date DATE NOT NULL,
    End_Date DATE NOT NULL,
    Payment_Amount DECIMAL(10,2),
    Archived_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);