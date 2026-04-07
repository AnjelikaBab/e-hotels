import type { Pool } from 'pg';
import {
  capacityToNumber,
  parseAddress,
  roomCompositeId,
  viewTypeToUi
} from './mappers.js';

export async function buildBootstrapSnapshot(pool: Pool) {
  const [
    chainsRes,
    hotelsRes,
    roomsRes,
    customersRes,
    employeesRes,
    bookingsRes,
    rentingsRes,
    paymentsRes,
    bookingArchiveRes,
    rentingArchiveRes,
    areaViewRes,
    hotelCapViewRes
  ] = await Promise.all([
    pool.query(`
      SELECT hc."HotelChain_Id" AS hotel_chain_id, hc."Central_Office_Address" AS central_office_address, hc."Num_of_Hotels" AS num_of_hotels,
        COALESCE((SELECT array_agg(e."Email" ORDER BY e."Email") FROM "HotelChainEmail" e WHERE e."HotelChain_Id" = hc."HotelChain_Id"), ARRAY[]::text[]) AS emails,
        COALESCE((SELECT array_agg(n."PhoneNumber" ORDER BY n."PhoneNumber") FROM "HotelChainNumber" n WHERE n."HotelChain_Id" = hc."HotelChain_Id"), ARRAY[]::text[]) AS phones
      FROM "HotelChain" hc
      ORDER BY hc."HotelChain_Id"
    `),
    pool.query(`
      SELECT h."Hotel_Id" AS hotel_id, h."Rating" AS rating, h."Address" AS address, h."Email" AS email,
        h."Num_of_Rooms" AS num_of_rooms, h."Phone_Number" AS phone_number, h."Manager_Id" AS manager_id, h."HotelChain_Id" AS hotel_chain_id
      FROM "Hotel" h
      ORDER BY h."Hotel_Id"
    `),
    pool.query(`
      SELECT r."Hotel_Id" AS hotel_id, r."Room_Id" AS room_id, r."Price" AS price, r."Capacity" AS capacity, r."View_Type" AS view_type, r."Extendable" AS extendable,
        COALESCE((SELECT array_agg(a."Type" ORDER BY a."Type") FROM "Amenities" a
          WHERE a."Hotel_Id" = r."Hotel_Id" AND a."Room_Id" = r."Room_Id"), ARRAY[]::text[]) AS amenity_types,
        COALESCE((SELECT string_agg(i."Type", '; ' ORDER BY i."Type") FROM "Issues" i
          WHERE i."Hotel_Id" = r."Hotel_Id" AND i."Room_Id" = r."Room_Id"), '') AS issue_types
      FROM "Room" r
      ORDER BY r."Hotel_Id", r."Room_Id"
    `),
    pool.query(`
      SELECT c."Customer_SSN" AS customer_ssn, c."First_Name" AS first_name, c."Last_Name" AS last_name,
        c."Registration_Date" AS registration_date, c."Address" AS address
      FROM "Customer" c
      ORDER BY c."Customer_SSN"
    `),
    pool.query(`
      SELECT e."Employee_SSN" AS employee_ssn, e."First_Name" AS first_name, e."Last_Name" AS last_name, e."Address" AS address, e."Hotel_Id" AS hotel_id,
        COALESCE(
          (SELECT er."Role_Type" FROM "EmployeeRole" er
           WHERE er."Employee_SSN" = e."Employee_SSN" AND er."Role_Type" = 'Hotel Manager' LIMIT 1),
          (SELECT er."Role_Type" FROM "EmployeeRole" er WHERE er."Employee_SSN" = e."Employee_SSN" LIMIT 1),
          'Employee'
        ) AS role_type
      FROM "Employee" e
      ORDER BY e."Hotel_Id", e."Employee_SSN"
    `),
    pool.query(`
      SELECT b."Booking_Id" AS booking_id, b."Hotel_Id" AS hotel_id, b."Room_Id" AS room_id, b."Customer_SSN" AS customer_ssn,
        b."Start_Date" AS start_date, b."End_Date" AS end_date, b."Booking_Status" AS booking_status, b."Book_Date" AS book_date
      FROM "Booking" b
      ORDER BY b."Booking_Id"
    `),
    pool.query(`
      SELECT r."Renting_Id" AS renting_id, r."Booking_Id" AS booking_id, r."Hotel_Id" AS hotel_id, r."Room_Id" AS room_id,
        r."Customer_SSN" AS customer_ssn, r."Employee_SSN" AS employee_ssn, r."Start_Date" AS start_date, r."End_Date" AS end_date,
        r."Renting_Status" AS renting_status, r."Book_Date" AS book_date
      FROM "Renting" r
      ORDER BY r."Renting_Id"
    `),
    pool.query(`
      SELECT p."Payment_Id" AS payment_id, p."Renting_Id" AS renting_id, p."Amount" AS amount, p."Payment_Method" AS payment_method, p."Payment_Date" AS payment_date
      FROM "Payment" p
      ORDER BY p."Payment_Id"
    `),
    pool.query(`
      SELECT ba."Booking_Id" AS booking_id, ba."Hotel_Id" AS hotel_id, ba."Room_Id" AS room_id, ba."Customer_SSN" AS customer_ssn,
        ba."Customer_First_Name" AS customer_first_name, ba."Customer_Last_Name" AS customer_last_name, ba."Customer_Address" AS customer_address,
        ba."Start_Date" AS start_date, ba."End_Date" AS end_date, ba."Booking_Status" AS booking_status, ba."Book_Date" AS book_date,
        ba."Hotel_Address" AS hotel_address, ba."Room_Price" AS room_price
      FROM "Booking_Archive" ba
      ORDER BY ba."Booking_Id"
    `),
    pool.query(`
      SELECT ra."Renting_Id" AS renting_id, ra."Booking_Id" AS booking_id, ra."Hotel_Id" AS hotel_id, ra."Room_Id" AS room_id,
        ra."Customer_SSN" AS customer_ssn, ra."Employee_SSN" AS employee_ssn,
        ra."Customer_First_Name" AS customer_first_name, ra."Customer_Last_Name" AS customer_last_name,
        ra."Employee_First_Name" AS employee_first_name, ra."Employee_Last_Name" AS employee_last_name,
        ra."Start_Date" AS start_date, ra."End_Date" AS end_date, ra."Renting_Status" AS renting_status, ra."Book_Date" AS book_date,
        ra."Hotel_Address" AS hotel_address, ra."Room_Price" AS room_price
      FROM "Renting_Archive" ra
      ORDER BY ra."Renting_Id"
    `),
    pool.query(`SELECT * FROM "vw_AvailableRoomsPerArea"`),
    pool.query(`
      SELECT v."Hotel_Id" AS hotel_id, v."Hotel_Address" AS hotel_address, v."HotelChain_Id" AS hotel_chain_id, v."Room_Count" AS room_count, v."Aggregated_Capacity" AS aggregated_capacity
      FROM "vw_HotelAggregatedCapacity" v
      ORDER BY v."Hotel_Id"
    `)
  ]);

  const hotelChains = chainsRes.rows.map((row: Record<string, unknown>) => {
    const id = String(row.hotel_chain_id);
    return {
      id,
      name: `Chain ${id}`,
      centralOffice: String(row.central_office_address),
      emails: (row.emails as string[]) ?? [],
      phones: (row.phones as string[]) ?? []
    };
  });

  const hotels = hotelsRes.rows.map((row: Record<string, unknown>) => {
    const addr = String(row.address);
    const { street, city, state } = parseAddress(addr);
    return {
      id: String(row.hotel_id),
      name: street.slice(0, 80) || `Hotel ${row.hotel_id}`,
      chainId: String(row.hotel_chain_id),
      category: Number(row.rating) as 1 | 2 | 3 | 4 | 5,
      numberOfRooms: Number(row.num_of_rooms),
      address: addr,
      city,
      state,
      emails: row.email ? [String(row.email)] : [],
      phones: row.phone_number ? [String(row.phone_number)] : [],
      managerId: row.manager_id ? String(row.manager_id) : undefined
    };
  });

  const rooms = roomsRes.rows.map((row: Record<string, unknown>) => {
    const hid = String(row.hotel_id);
    const rid = String(row.room_id);
    const amenities = (row.amenity_types as string[]) ?? [];
    const problems = (row.issue_types as string) || '';
    return {
      id: roomCompositeId(hid, rid),
      hotelId: hid,
      price: Number(row.price),
      amenities,
      capacity: capacityToNumber(String(row.capacity)),
      viewType: viewTypeToUi(String(row.view_type)) as
        | 'Sea View'
        | 'Mountain View'
        | 'City View'
        | 'Garden View'
        | 'No Special View',
      extendable: Boolean(row.extendable),
      problems,
      status: 'Available' as const,
      roomNumber: rid
    };
  });

  const customers = customersRes.rows.map((row: Record<string, unknown>) => ({
    id: String(row.customer_ssn),
    fullName: `${row.first_name} ${row.last_name}`.trim(),
    address: String(row.address),
    idType: 'SSN' as const,
    idNumber: String(row.customer_ssn),
    registrationDate: row.registration_date
      ? new Date(row.registration_date as string).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10)
  }));

  const employees = employeesRes.rows.map((row: Record<string, unknown>) => {
    const role = String(row.role_type) === 'Hotel Manager' ? 'Hotel Manager' : 'Employee';
    return {
      id: String(row.employee_ssn),
      fullName: `${row.first_name} ${row.last_name}`.trim(),
      address: String(row.address),
      ssn: String(row.employee_ssn),
      role: role as 'Employee' | 'Hotel Manager',
      hotelId: String(row.hotel_id)
    };
  });

  const bookings = bookingsRes.rows.map((row: Record<string, unknown>) => ({
    id: String(row.booking_id),
    customerId: row.customer_ssn ? String(row.customer_ssn) : '',
    roomId: roomCompositeId(row.hotel_id as string | number, row.room_id as string | number),
    startDate: formatDate(row.start_date),
    endDate: formatDate(row.end_date),
    status: row.booking_status,
    registrationDate: formatDate(row.book_date)
  }));

  const rentings = rentingsRes.rows.map((row: Record<string, unknown>) => ({
    id: String(row.renting_id),
    customerId: String(row.customer_ssn),
    roomId: roomCompositeId(row.hotel_id as string | number, row.room_id as string | number),
    employeeId: String(row.employee_ssn),
    startDate: formatDate(row.start_date),
    endDate: formatDate(row.end_date),
    checkInDate: formatDate(row.start_date),
    bookingId: row.booking_id != null ? String(row.booking_id) : undefined
  }));

  const payments = paymentsRes.rows.map((row: Record<string, unknown>) => ({
    id: String(row.payment_id),
    rentingId: String(row.renting_id),
    amount: Number(row.amount),
    paymentMethod: row.payment_method,
    paymentDate: formatDate(row.payment_date)
  }));

  const bookingArchives = bookingArchiveRes.rows.map((row: Record<string, unknown>) => ({
    id: `booking-archive-${row.booking_id}`,
    bookingId: String(row.booking_id),
    customerId: row.customer_ssn ? String(row.customer_ssn) : undefined,
    customerName: `${row.customer_first_name} ${row.customer_last_name}`.trim(),
    roomId:
      row.hotel_id != null && row.room_id != null
        ? roomCompositeId(row.hotel_id as string | number, row.room_id as string | number)
        : undefined,
    roomNumber: row.room_id != null ? String(row.room_id) : '',
    hotelId: row.hotel_id != null ? String(row.hotel_id) : undefined,
    hotelName: String(row.hotel_address || '').split(',')[0]?.trim() ?? 'Hotel',
    hotelCity: parseAddress(String(row.hotel_address || '')).city || 'Unknown',
    hotelChainName: 'Unknown chain',
    roomPrice: Number(row.room_price),
    startDate: formatDate(row.start_date),
    endDate: formatDate(row.end_date),
    status: row.booking_status,
    registrationDate: formatDate(row.book_date)
  }));

  const rentingArchives = rentingArchiveRes.rows.map((row: Record<string, unknown>) => ({
    id: `renting-archive-${row.renting_id}`,
    rentingId: String(row.renting_id),
    bookingId: row.booking_id != null ? String(row.booking_id) : undefined,
    customerId: row.customer_ssn ? String(row.customer_ssn) : undefined,
    customerName: `${row.customer_first_name} ${row.customer_last_name}`.trim(),
    employeeId: row.employee_ssn ? String(row.employee_ssn) : undefined,
    employeeName: `${row.employee_first_name} ${row.employee_last_name}`.trim(),
    roomId:
      row.hotel_id != null && row.room_id != null
        ? roomCompositeId(row.hotel_id as string | number, row.room_id as string | number)
        : undefined,
    roomNumber: row.room_id != null ? String(row.room_id) : '',
    hotelId: row.hotel_id != null ? String(row.hotel_id) : undefined,
    hotelName: String(row.hotel_address || '').split(',')[0]?.trim() ?? 'Hotel',
    hotelCity: parseAddress(String(row.hotel_address || '')).city || 'Unknown',
    hotelChainName: 'Unknown chain',
    roomPrice: Number(row.room_price),
    startDate: formatDate(row.start_date),
    endDate: formatDate(row.end_date),
    checkInDate: formatDate(row.start_date),
    source: row.booking_id != null ? ('booking' as const) : ('walk-in' as const)
  }));

  const areaAvailableRoomsView = areaViewRes.rows.map((row: Record<string, unknown>, index: number) => {
    const area = row.Area ?? row.area;
    const hotelsIn = row.Hotels_In_Area ?? row.hotels_in_area;
    const avail = row.Available_Rooms ?? row.available_rooms;
    return {
      id: `area-view-${index + 1}-${String(area).slice(0, 24)}`,
      area: String(area).trim(),
      hotelsInArea: Number(hotelsIn),
      availableRooms: Number(avail)
    };
  });

  const hotelCapacityView = hotelCapViewRes.rows.map((row: Record<string, unknown>) => {
    const addr = String(row.hotel_address);
    const { city, state } = parseAddress(addr);
    return {
      id: `hotel-capacity-${row.hotel_id}`,
      hotelId: String(row.hotel_id),
      hotelName: addr.split(',')[0]?.trim() ?? `Hotel ${row.hotel_id}`,
      area: `${city}, ${state}`,
      hotelChain: `Chain ${row.hotel_chain_id}`,
      roomCount: Number(row.room_count),
      aggregatedCapacity: Number(row.aggregated_capacity)
    };
  });

  return {
    hotelChains,
    hotels,
    rooms,
    customers,
    employees,
    bookings,
    rentings,
    payments,
    bookingArchives,
    rentingArchives,
    areaAvailableRoomsView,
    hotelCapacityView
  };
}

function formatDate(d: unknown): string {
  if (d == null) return '';
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  return String(d).slice(0, 10);
}
