# E-Hotels

A hotel booking and management portal built with React, Vite, Express, and PostgreSQL.

---

## What's Included

- Customer room search with live filtering
- Room details and booking flow
- Booking lookup and cancellation
- Employee portal
- Booking-to-renting conversion
- Direct renting for walk-in customers
- Archive and history screens
- Two business views presented in the UI

**Booking rules enforced by the app:**
- No overlapping bookings or rentings
- Check-in date cannot be in the past
- Maximum stay is 30 days
- Booking start date cannot be more than 1 year in advance

---

## Quick Start (Mock Data)

No database needed. The app runs entirely on in-memory mock data by default.

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Full Setup (with Database)

Follow these steps to run the app with a real PostgreSQL database.

### 1. Set up PostgreSQL

Make sure PostgreSQL is installed and running (we recommend [Postgres.app](https://postgresapp.com) on Mac).

Create a database:
```bash
psql -U postgres -c "CREATE DATABASE ehotels"
```

Load the SQL files **in this order**:
```bash
psql -U postgres -d ehotels \
  -f database/schema.sql \
  -f database/views.sql \
  -f database/enforcement.sql \
  -f database/populate.sql \
  -f database/indexes.sql
```

| File | Purpose |
|---|---|
| `schema.sql` | Tables and referential integrity |
| `views.sql` | Available rooms and hotel capacity views |
| `enforcement.sql` | Triggers, exclusion constraints, archive sync |
| `populate.sql` | Sample data — chains, hotels, rooms, bookings, rentings, payments |
| `indexes.sql` | Performance indexes (optional but recommended) |

Demo queries are available in [`database/queries.sql`](database/queries.sql).

---

### 2. Configure Environment Variables

Create a `server/.env` file:
```properties
DATABASE_URL=postgresql://postgres@localhost:5432/ehotels
PORT=3001
```

Create a root `.env` file:
```properties
VITE_USE_API=true
```

> **Note:** Never commit your `.env` files to Git. A `.env.example` is included as a reference.

---

### 3. Start the App

```bash
npm run dev:all
```

This starts both the frontend (Vite) and backend (Express) together.

Alternatively, run them in two separate terminals:
```bash
npm run dev         # frontend
npm run dev:server  # backend
```

The API runs on **port 3001**. Vite proxies all `/api` requests to it automatically.

---

## How It Works

| Mode | How to enable | Data source |
|---|---|---|
| Mock data (default) | `VITE_USE_API` not set | In-memory mock store |
| Live database | `VITE_USE_API=true` | PostgreSQL via Express API |

When the API is enabled, the app loads its initial state from `GET /api/bootstrap` and uses `POST`/`PATCH` routes for bookings, rentings, payments, and conversions.
