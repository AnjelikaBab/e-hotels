## Current Status

Implemented in the frontend:
- Customer room search with live filtering
- Room details and booking flow
- Customer booking lookup/cancel flow
- Employee portal
- Booking to renting conversion
- Direct renting for walk-in customers
- Archive/history screens
- Two business views presented in the UI

- prevents overlapping bookings/rentings during the running session.
- prevents past check-in dates, and the SQL enforcement file mirrors that rule.
- maximum stay is 30 days
- booking start date cannot be more than 1 year in advance


## Run website
This is react+vite
```bash
npm install
npm run dev
```

##  TODO
after created sql server
### 1

Run [schema.sql](/C:/Users/user/Downloads/hotel/database/schema.sql)

### 2

Run [views.sql](/C:/Users/user/Downloads/hotel/database/views.sql)


### 3. database enforcement

Run [enforcement.sql](/C:/Users/user/Downloads/hotel/database/enforcement.sql)

***
Still needed later:
- insert 5 hotel chains
- insert more than 14 hotel locations across North America
- insert customers, employees, rooms, amenities, issues, bookings, rentings, and payments
- optionally add archive starter rows if your final database strategy requires preloaded historical data

### 5

Replace the mock store methods in [hotelStore.tsx](/C:/Users/user/Downloads/hotel/src/app/data/hotelStore.tsx) with backend/API calls for:
- room availability search
- booking creation
- renting creation
- booking to renting conversion
- payment recording
- CRUD operations
- archive/history retrieval
- SQL view retrieval

