import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import express from 'express';
import { buildBootstrapSnapshot } from './bootstrap.js';
import { pool } from './db.js';
import { parseRoomCompositeId, splitFullName } from './mappers.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'e-hotels-api' });
});

app.get('/api/bootstrap', async (_req, res) => {
  try {
    const snapshot = await buildBootstrapSnapshot(pool);
    res.json(snapshot);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Failed to load bootstrap snapshot',
      detail: err instanceof Error ? err.message : String(err)
    });
  }
});

app.post('/api/bookings', async (req, res) => {
  const { roomId, customer, startDate, endDate } = req.body as {
    roomId?: string;
    customer?: { fullName?: string; address?: string; idNumber?: string };
    startDate?: string;
    endDate?: string;
  };

  const parsed = roomId ? parseRoomCompositeId(roomId) : null;
  if (!parsed || !customer?.idNumber || !customer?.fullName || !customer?.address || !startDate || !endDate) {
    res.status(400).json({ error: 'Missing roomId, customer fields, or dates' });
    return;
  }

  const { first, last } = splitFullName(customer.fullName);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `INSERT INTO "Customer" ("Customer_SSN", "First_Name", "Last_Name", "Address", "Registration_Date")
       VALUES ($1, $2, $3, $4, CURRENT_DATE)
       ON CONFLICT ("Customer_SSN") DO UPDATE SET
         "First_Name" = EXCLUDED."First_Name",
         "Last_Name" = EXCLUDED."Last_Name",
         "Address" = EXCLUDED."Address"`,
      [customer.idNumber, first, last, customer.address]
    );

    const ins = await client.query(
      `INSERT INTO "Booking" ("Hotel_Id", "Room_Id", "Customer_SSN", "Start_Date", "End_Date", "Booking_Status", "Book_Date")
       VALUES ($1::bigint, $2::bigint, $3, $4::date, $5::date, 'Confirmed', CURRENT_DATE)
       RETURNING "Booking_Id" AS booking_id`,
      [parsed.hotelId, parsed.roomId, customer.idNumber, startDate, endDate]
    );

    await client.query('COMMIT');
    const snapshot = await buildBootstrapSnapshot(pool);
    const bid = ins.rows[0] as { booking_id: string | number };
    res.status(201).json({ bookingId: String(bid.booking_id), snapshot });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(400).json({
      error: 'Could not create booking',
      detail: err instanceof Error ? err.message : String(err)
    });
  } finally {
    client.release();
  }
});

app.patch('/api/bookings/:id/cancel', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(`UPDATE "Booking" SET "Booking_Status" = 'Cancelled' WHERE "Booking_Id" = $1::bigint`, [id]);
    const snapshot = await buildBootstrapSnapshot(pool);
    res.json({ ok: true, snapshot });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      error: 'Could not cancel booking',
      detail: err instanceof Error ? err.message : String(err)
    });
  }
});

app.post('/api/rentings/direct', async (req, res) => {
  const { customerId, roomId, employeeId, startDate, endDate } = req.body as {
    customerId?: string;
    roomId?: string;
    employeeId?: string;
    startDate?: string;
    endDate?: string;
  };

  const parsed = roomId ? parseRoomCompositeId(roomId) : null;
  if (!parsed || !customerId || !employeeId || !startDate || !endDate) {
    res.status(400).json({ error: 'Missing fields' });
    return;
  }

  try {
    await pool.query(
      `INSERT INTO "Renting" ("Booking_Id", "Hotel_Id", "Room_Id", "Customer_SSN", "Employee_SSN", "Start_Date", "End_Date", "Renting_Status", "Book_Date")
       VALUES (NULL, $1::bigint, $2::bigint, $3, $4, $5::date, $6::date, 'Active', CURRENT_DATE)`,
      [parsed.hotelId, parsed.roomId, customerId, employeeId, startDate, endDate]
    );
    const snapshot = await buildBootstrapSnapshot(pool);
    res.status(201).json({ snapshot });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      error: 'Could not create renting',
      detail: err instanceof Error ? err.message : String(err)
    });
  }
});

app.post('/api/rentings/convert', async (req, res) => {
  const { bookingId, employeeId } = req.body as { bookingId?: string; employeeId?: string };
  if (!bookingId || !employeeId) {
    res.status(400).json({ error: 'Missing bookingId or employeeId' });
    return;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const b = await client.query(
      `SELECT b."Hotel_Id" AS hotel_id, b."Room_Id" AS room_id, b."Customer_SSN" AS customer_ssn,
              b."Start_Date" AS start_date, b."End_Date" AS end_date
       FROM "Booking" b WHERE b."Booking_Id" = $1::bigint`,
      [bookingId]
    );
    if (b.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({ error: 'Booking not found' });
      return;
    }
    const row = b.rows[0] as {
      hotel_id: string | number;
      room_id: string | number;
      customer_ssn: string;
      start_date: string | Date;
      end_date: string | Date;
    };
    const hotelId = row.hotel_id;
    const roomId = row.room_id;
    const cust = row.customer_ssn;
    const startDate = row.start_date;
    const endDate = row.end_date;

    await client.query(
      `UPDATE "Booking" SET "Booking_Status" = 'Converted' WHERE "Booking_Id" = $1::bigint`,
      [bookingId]
    );

    await client.query(
      `INSERT INTO "Renting" ("Booking_Id", "Hotel_Id", "Room_Id", "Customer_SSN", "Employee_SSN", "Start_Date", "End_Date", "Renting_Status", "Book_Date")
       VALUES ($1::bigint, $2::bigint, $3::bigint, $4, $5, $6::date, $7::date, 'Active', CURRENT_DATE)`,
      [bookingId, hotelId, roomId, cust, employeeId, startDate, endDate]
    );

    await client.query('COMMIT');
    const snapshot = await buildBootstrapSnapshot(pool);
    res.status(201).json({ snapshot });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(400).json({
      error: 'Could not convert booking',
      detail: err instanceof Error ? err.message : String(err)
    });
  } finally {
    client.release();
  }
});

app.post('/api/payments', async (req, res) => {
  const { rentingId, amount, paymentMethod, paymentDate } = req.body as {
    rentingId?: string;
    amount?: number;
    paymentMethod?: string;
    paymentDate?: string;
  };

  if (!rentingId || amount == null || !paymentMethod) {
    res.status(400).json({ error: 'Missing rentingId, amount, or paymentMethod' });
    return;
  }

  try {
    await pool.query(
      `INSERT INTO "Payment" ("Renting_Id", "Amount", "Payment_Method", "Payment_Date")
       VALUES ($1::bigint, $2, $3, COALESCE($4::date, CURRENT_DATE))`,
      [rentingId, amount, paymentMethod, paymentDate ?? null]
    );
    const snapshot = await buildBootstrapSnapshot(pool);
    res.status(201).json({ snapshot });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      error: 'Could not record payment',
      detail: err instanceof Error ? err.message : String(err)
    });
  }
});

app.listen(PORT, () => {
  console.log(`[e-hotels-server] listening on http://localhost:${PORT}`);
});
