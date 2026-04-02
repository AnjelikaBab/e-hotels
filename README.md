# e-Hotels

PHP + MySQL reference implementation for hotel room search, booking, renting, payments, and CRUD operations.

## Setup

1. Create DB and run scripts in this order:
   - `database/create_tables.sql`
   - `database/triggers.sql`
   - `database/views.sql`
   - `database/indexes.sql`
   - `database/populate_data.sql`
2. Configure environment variables:
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`
3. Start PHP server from repo root:
   - `php -S localhost:8000`
4. Open [http://localhost:8000](http://localhost:8000).

## Features implemented

- Room search with live filter combinations:
  - date range, capacity, area, hotel chain, category, number of rooms in hotel, max price
- Booking creation
- Employee renting actions:
  - transform booking to renting (check-in)
  - direct renting for walk-in customer
- Payment update for renting
- CRUD interfaces:
  - customers, employees (+roles), hotels, rooms (+amenities/issues)
- SQL views shown in UI:
  - `AvailableRoomsPerArea`
  - `HotelCapacity`

## Notes

- Historical resilience: `Booking` and `Renting` keep snapshot columns so old records remain meaningful even if linked entities are deleted.
- Archive tables are populated by delete triggers on `Booking` and `Renting`.