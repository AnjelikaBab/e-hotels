CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE OR REPLACE FUNCTION "ensure_manager_belongs_to_hotel"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW."Manager_Id" IS NULL THEN
    RETURN NEW;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM "Employee" e
    WHERE e."Employee_SSN" = NEW."Manager_Id"
      AND e."Hotel_Id" = NEW."Hotel_Id"
  ) THEN
    RAISE EXCEPTION 'Manager % must belong to Hotel %', NEW."Manager_Id", NEW."Hotel_Id";
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER "trg_ensure_manager_belongs_to_hotel"
BEFORE INSERT OR UPDATE OF "Manager_Id", "Hotel_Id"
ON "Hotel"
FOR EACH ROW
EXECUTE FUNCTION "ensure_manager_belongs_to_hotel"();

CREATE OR REPLACE FUNCTION "validate_booking_rules"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW."End_Date" <= NEW."Start_Date" THEN
    RAISE EXCEPTION 'End_Date must be after Start_Date';
  END IF;

  IF NEW."Start_Date" < CURRENT_DATE THEN
    RAISE EXCEPTION 'Booking start date cannot be in the past';
  END IF;

  IF (NEW."End_Date" - NEW."Start_Date") > 30 THEN
    RAISE EXCEPTION 'Maximum stay is 30 days';
  END IF;

  IF NEW."Start_Date" > CURRENT_DATE + INTERVAL '1 year' THEN
    RAISE EXCEPTION 'Booking cannot start more than 1 year in advance';
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER "trg_validate_booking_rules"
BEFORE INSERT OR UPDATE OF "Start_Date", "End_Date"
ON "Booking"
FOR EACH ROW
EXECUTE FUNCTION "validate_booking_rules"();

CREATE OR REPLACE FUNCTION "validate_renting_rules"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW."End_Date" <= NEW."Start_Date" THEN
    RAISE EXCEPTION 'End_Date must be after Start_Date';
  END IF;

  IF NEW."Start_Date" < CURRENT_DATE THEN
    RAISE EXCEPTION 'Renting start date cannot be in the past';
  END IF;

  IF (NEW."End_Date" - NEW."Start_Date") > 30 THEN
    RAISE EXCEPTION 'Maximum stay is 30 days';
  END IF;

  IF NEW."Start_Date" > CURRENT_DATE + INTERVAL '1 year' THEN
    RAISE EXCEPTION 'Renting cannot start more than 1 year in advance';
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER "trg_validate_renting_rules"
BEFORE INSERT OR UPDATE OF "Start_Date", "End_Date"
ON "Renting"
FOR EACH ROW
EXECUTE FUNCTION "validate_renting_rules"();

ALTER TABLE "Booking"
  ADD CONSTRAINT "ex_Booking_Room_Date_Overlap"
  EXCLUDE USING gist (
    "Hotel_Id" WITH =,
    "Room_Id" WITH =,
    daterange("Start_Date", "End_Date", '[)') WITH &&
  )
  WHERE ("Booking_Status" IN ('Pending', 'Confirmed'));

ALTER TABLE "Renting"
  ADD CONSTRAINT "ex_Renting_Room_Date_Overlap"
  EXCLUDE USING gist (
    "Hotel_Id" WITH =,
    "Room_Id" WITH =,
    daterange("Start_Date", "End_Date", '[)') WITH &&
  )
  WHERE ("Booking_Status" IN ('Active', 'Confirmed', 'Converted'));

CREATE OR REPLACE FUNCTION "validate_renting_from_booking"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  source_booking "Booking"%ROWTYPE;
BEGIN
  IF NEW."Booking_Id" IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT *
  INTO source_booking
  FROM "Booking"
  WHERE "Booking_Id" = NEW."Booking_Id";

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking % does not exist', NEW."Booking_Id";
  END IF;

  IF source_booking."Hotel_Id" <> NEW."Hotel_Id"
     OR source_booking."Room_Id" <> NEW."Room_Id"
     OR source_booking."Customer_SSN" IS DISTINCT FROM NEW."Customer_SSN" THEN
    RAISE EXCEPTION 'Renting must match booking hotel, room, and customer';
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER "trg_validate_renting_from_booking"
BEFORE INSERT OR UPDATE OF "Booking_Id", "Hotel_Id", "Room_Id", "Customer_SSN"
ON "Renting"
FOR EACH ROW
EXECUTE FUNCTION "validate_renting_from_booking"();

CREATE OR REPLACE FUNCTION "sync_booking_archive"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  source_booking "Booking"%ROWTYPE;
BEGIN
  source_booking := COALESCE(NEW, OLD);

  INSERT INTO "Booking_Archive" (
    "Booking_Id",
    "Hotel_Id",
    "Room_Id",
    "Customer_SSN",
    "Customer_First_Name",
    "Customer_Last_Name",
    "Customer_Address",
    "Start_Date",
    "End_Date",
    "Booking_Status",
    "Book_Date",
    "Hotel_Address",
    "Room_Price"
  )
  SELECT
    source_booking."Booking_Id",
    source_booking."Hotel_Id",
    source_booking."Room_Id",
    source_booking."Customer_SSN",
    c."First_Name",
    c."Last_Name",
    c."Address",
    source_booking."Start_Date",
    source_booking."End_Date",
    source_booking."Booking_Status",
    source_booking."Book_Date",
    h."Address",
    r."Price"
  FROM "Customer" c
  JOIN "Room" r
    ON r."Hotel_Id" = source_booking."Hotel_Id"
   AND r."Room_Id" = source_booking."Room_Id"
  JOIN "Hotel" h
    ON h."Hotel_Id" = source_booking."Hotel_Id"
  WHERE c."Customer_SSN" = source_booking."Customer_SSN"
  ON CONFLICT ("Booking_Id") DO UPDATE
  SET "Hotel_Id" = EXCLUDED."Hotel_Id",
      "Room_Id" = EXCLUDED."Room_Id",
      "Customer_SSN" = EXCLUDED."Customer_SSN",
      "Customer_First_Name" = EXCLUDED."Customer_First_Name",
      "Customer_Last_Name" = EXCLUDED."Customer_Last_Name",
      "Customer_Address" = EXCLUDED."Customer_Address",
      "Start_Date" = EXCLUDED."Start_Date",
      "End_Date" = EXCLUDED."End_Date",
      "Booking_Status" = EXCLUDED."Booking_Status",
      "Book_Date" = EXCLUDED."Book_Date",
      "Hotel_Address" = EXCLUDED."Hotel_Address",
      "Room_Price" = EXCLUDED."Room_Price";

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION "sync_renting_archive"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  source_renting "Renting"%ROWTYPE;
BEGIN
  source_renting := COALESCE(NEW, OLD);

  INSERT INTO "Renting_Archive" (
    "Renting_Id",
    "Booking_Id",
    "Hotel_Id",
    "Room_Id",
    "Customer_SSN",
    "Employee_SSN",
    "Customer_First_Name",
    "Customer_Last_Name",
    "Employee_First_Name",
    "Employee_Last_Name",
    "Start_Date",
    "End_Date",
    "Booking_Status",
    "Book_Date",
    "Hotel_Address",
    "Room_Price"
  )
  SELECT
    source_renting."Renting_Id",
    source_renting."Booking_Id",
    source_renting."Hotel_Id",
    source_renting."Room_Id",
    source_renting."Customer_SSN",
    source_renting."Employee_SSN",
    c."First_Name",
    c."Last_Name",
    e."First_Name",
    e."Last_Name",
    source_renting."Start_Date",
    source_renting."End_Date",
    source_renting."Booking_Status",
    source_renting."Book_Date",
    h."Address",
    r."Price"
  FROM "Customer" c
  JOIN "Employee" e ON e."Employee_SSN" = source_renting."Employee_SSN"
  JOIN "Room" r
    ON r."Hotel_Id" = source_renting."Hotel_Id"
   AND r."Room_Id" = source_renting."Room_Id"
  JOIN "Hotel" h
    ON h."Hotel_Id" = source_renting."Hotel_Id"
  WHERE c."Customer_SSN" = source_renting."Customer_SSN"
  ON CONFLICT ("Renting_Id") DO UPDATE
  SET "Booking_Id" = EXCLUDED."Booking_Id",
      "Hotel_Id" = EXCLUDED."Hotel_Id",
      "Room_Id" = EXCLUDED."Room_Id",
      "Customer_SSN" = EXCLUDED."Customer_SSN",
      "Employee_SSN" = EXCLUDED."Employee_SSN",
      "Customer_First_Name" = EXCLUDED."Customer_First_Name",
      "Customer_Last_Name" = EXCLUDED."Customer_Last_Name",
      "Employee_First_Name" = EXCLUDED."Employee_First_Name",
      "Employee_Last_Name" = EXCLUDED."Employee_Last_Name",
      "Start_Date" = EXCLUDED."Start_Date",
      "End_Date" = EXCLUDED."End_Date",
      "Booking_Status" = EXCLUDED."Booking_Status",
      "Book_Date" = EXCLUDED."Book_Date",
      "Hotel_Address" = EXCLUDED."Hotel_Address",
      "Room_Price" = EXCLUDED."Room_Price";

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE TRIGGER "trg_sync_booking_archive_after_insert"
AFTER INSERT ON "Booking"
FOR EACH ROW
EXECUTE FUNCTION "sync_booking_archive"();

CREATE OR REPLACE TRIGGER "trg_sync_booking_archive_after_update"
AFTER UPDATE ON "Booking"
FOR EACH ROW
EXECUTE FUNCTION "sync_booking_archive"();

CREATE OR REPLACE TRIGGER "trg_sync_booking_archive_before_delete"
BEFORE DELETE ON "Booking"
FOR EACH ROW
EXECUTE FUNCTION "sync_booking_archive"();

CREATE OR REPLACE TRIGGER "trg_sync_renting_archive_after_insert"
AFTER INSERT ON "Renting"
FOR EACH ROW
EXECUTE FUNCTION "sync_renting_archive"();

CREATE OR REPLACE TRIGGER "trg_sync_renting_archive_after_update"
AFTER UPDATE ON "Renting"
FOR EACH ROW
EXECUTE FUNCTION "sync_renting_archive"();

CREATE OR REPLACE TRIGGER "trg_sync_renting_archive_before_delete"
BEFORE DELETE ON "Renting"
FOR EACH ROW
EXECUTE FUNCTION "sync_renting_archive"();
