import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchBootstrap, useApiData } from '../api/hotelApi';
import type { BootstrapSnapshot } from '../api/hotelApi';
import {
  bookings as seedBookings,
  customers as seedCustomers,
  employees as seedEmployees,
  getHotelById,
  getHotelChainById,
  getRoomById,
  hotelChains as seedHotelChains,
  hotels as seedHotels,
  payments as seedPayments,
  rentings as seedRentings,
  rooms as seedRooms,
  type Booking,
  type Customer,
  type Employee,
  type Hotel,
  type HotelChain,
  type Payment,
  type Renting,
  type Room
} from './mockData';

export interface RoomSearchFilters {
  startDate?: string;
  endDate?: string;
  capacity?: string;
  area?: string;
  chain?: string;
  category?: string;
  minRooms?: string;
  maxRooms?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface BookingArchiveRecord {
  id: string;
  bookingId: string;
  customerId?: string;
  customerName: string;
  roomId?: string;
  roomNumber: string;
  hotelId?: string;
  hotelName: string;
  hotelCity: string;
  hotelChainName: string;
  roomPrice: number;
  startDate: string;
  endDate: string;
  status: Booking['status'];
  registrationDate: string;
}

export interface RentingArchiveRecord {
  id: string;
  rentingId: string;
  bookingId?: string;
  customerId?: string;
  customerName: string;
  employeeId?: string;
  employeeName: string;
  roomId?: string;
  roomNumber: string;
  hotelId?: string;
  hotelName: string;
  hotelCity: string;
  hotelChainName: string;
  roomPrice: number;
  startDate: string;
  endDate: string;
  checkInDate: string;
  source: 'booking' | 'walk-in';
}

export interface AreaAvailableRoomsViewRow {
  id: string;
  area: string;
  hotelsInArea: number;
  availableRooms: number;
}

export interface HotelCapacityViewRow {
  id: string;
  hotelId: string;
  hotelName: string;
  area: string;
  hotelChain: string;
  roomCount: number;
  aggregatedCapacity: number;
}

interface HotelStoreValue {
  hotelChains: HotelChain[];
  hotels: Hotel[];
  rooms: Room[];
  customers: Customer[];
  employees: Employee[];
  bookings: Booking[];
  rentings: Renting[];
  payments: Payment[];
  bookingArchives: BookingArchiveRecord[];
  rentingArchives: RentingArchiveRecord[];
  areaAvailableRoomsView: AreaAvailableRoomsViewRow[];
  hotelCapacityView: HotelCapacityViewRow[];
  apiDataLoading: boolean;
  apiConnectionError: string | null;
  searchAvailableRooms: (filters: RoomSearchFilters) => Room[];
  isRoomAvailableForStay: (roomId: string, startDate: string, endDate: string) => boolean;
  getUnavailableDatesForRoom: (roomId: string) => Date[];
  createBooking: (input: {
    roomId: string;
    customer: Omit<Customer, 'id' | 'registrationDate'>;
    startDate: string;
    endDate: string;
  }) => Promise<Booking | null>;
  cancelBooking: (bookingId: string) => Promise<void>;
  convertBookingToRenting: (bookingId: string, employeeId: string) => Promise<Renting | null>;
  createDirectRenting: (input: {
    customerId: string;
    roomId: string;
    employeeId: string;
    startDate: string;
    endDate: string;
  }) => Promise<Renting | null>;
  recordPayment: (input: Omit<Payment, 'id'>) => Promise<Payment>;
  upsertCustomer: (input: Partial<Customer> & Pick<Customer, 'fullName' | 'address' | 'idType' | 'idNumber'>) => Customer;
  deleteCustomer: (customerId: string) => void;
  upsertEmployee: (input: Partial<Employee> & Pick<Employee, 'fullName' | 'address' | 'ssn' | 'role' | 'hotelId'>) => Employee;
  deleteEmployee: (employeeId: string) => void;
  upsertHotelChain: (
    input: Partial<HotelChain> &
    Pick<HotelChain, 'name' | 'centralOffice' | 'emails' | 'phones'>
  ) => HotelChain;
  deleteHotelChain: (chainId: string) => void;
  upsertHotel: (
    input: Partial<Hotel> &
    Pick<Hotel, 'name' | 'chainId' | 'category' | 'numberOfRooms' | 'address' | 'city' | 'state' | 'emails' | 'phones'>
  ) => Hotel;
  deleteHotel: (hotelId: string) => void;
  upsertRoom: (
    input: Partial<Room> &
    Pick<Room, 'hotelId' | 'price' | 'amenities' | 'capacity' | 'viewType' | 'extendable' | 'problems' | 'status' | 'roomNumber'>
  ) => Room;
  deleteRoom: (roomId: string) => void;
}

const HotelStoreContext = createContext<HotelStoreValue | null>(null);

const cloneSeed = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const todayString = () => {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 10);
};

const maxAdvanceBookingDate = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  const timezoneOffset = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10);
};

const createId = (prefix: string) => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }

  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
};

const rangesOverlap = (startA: string, endA: string, startB: string, endB: string) =>
  startA < endB && startB < endA;

const enumerateDates = (startDate: string, endDate: string) => {
  const dates: Date[] = [];
  const current = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  while (current < end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

const buildBookingArchiveRecord = (booking: Booking): BookingArchiveRecord => {
  const customer = seedCustomers.find((entry) => entry.id === booking.customerId);
  const room = getRoomById(booking.roomId);
  const hotel = room ? getHotelById(room.hotelId) : null;
  const chain = hotel ? getHotelChainById(hotel.chainId) : null;

  return {
    id: `booking-archive-${booking.id}`,
    bookingId: booking.id,
    customerId: customer?.id,
    customerName: customer?.fullName ?? 'Deleted customer',
    roomId: room?.id,
    roomNumber: room?.roomNumber ?? 'Deleted room',
    hotelId: hotel?.id,
    hotelName: hotel?.name ?? 'Deleted hotel',
    hotelCity: hotel?.city ?? 'Unknown',
    hotelChainName: chain?.name ?? 'Unknown chain',
    roomPrice: room?.price ?? 0,
    startDate: booking.startDate,
    endDate: booking.endDate,
    status: booking.status,
    registrationDate: booking.registrationDate
  };
};

const buildRentingArchiveRecord = (renting: Renting): RentingArchiveRecord => {
  const customer = seedCustomers.find((entry) => entry.id === renting.customerId);
  const employee = seedEmployees.find((entry) => entry.id === renting.employeeId);
  const room = getRoomById(renting.roomId);
  const hotel = room ? getHotelById(room.hotelId) : null;
  const chain = hotel ? getHotelChainById(hotel.chainId) : null;

  return {
    id: `renting-archive-${renting.id}`,
    rentingId: renting.id,
    bookingId: renting.bookingId,
    customerId: customer?.id,
    customerName: customer?.fullName ?? 'Deleted customer',
    employeeId: employee?.id,
    employeeName: employee?.fullName ?? 'Deleted employee',
    roomId: room?.id,
    roomNumber: room?.roomNumber ?? 'Deleted room',
    hotelId: hotel?.id,
    hotelName: hotel?.name ?? 'Deleted hotel',
    hotelCity: hotel?.city ?? 'Unknown',
    hotelChainName: chain?.name ?? 'Unknown chain',
    roomPrice: room?.price ?? 0,
    startDate: renting.startDate,
    endDate: renting.endDate,
    checkInDate: renting.checkInDate,
    source: renting.bookingId ? 'booking' : 'walk-in'
  };
};

export function HotelStoreProvider({ children }: { children: React.ReactNode }) {
  const useApi = useApiData();
  const [apiDataLoading, setApiDataLoading] = useState(useApi);
  const [apiConnectionError, setApiConnectionError] = useState<string | null>(null);
  const [sqlAreaView, setSqlAreaView] = useState<AreaAvailableRoomsViewRow[]>([]);
  const [sqlHotelCapView, setSqlHotelCapView] = useState<HotelCapacityViewRow[]>([]);

  const [hotelChains, setHotelChains] = useState<HotelChain[]>(() => (useApi ? [] : cloneSeed(seedHotelChains)));
  const [hotels, setHotels] = useState<Hotel[]>(() => (useApi ? [] : cloneSeed(seedHotels)));
  const [rooms, setRooms] = useState<Room[]>(() => (useApi ? [] : cloneSeed(seedRooms)));
  const [customers, setCustomers] = useState<Customer[]>(() => (useApi ? [] : cloneSeed(seedCustomers)));
  const [employees, setEmployees] = useState<Employee[]>(() => (useApi ? [] : cloneSeed(seedEmployees)));
  const [bookings, setBookings] = useState<Booking[]>(() => (useApi ? [] : cloneSeed(seedBookings)));
  const [rentings, setRentings] = useState<Renting[]>(() => (useApi ? [] : cloneSeed(seedRentings)));
  const [payments, setPayments] = useState<Payment[]>(() => (useApi ? [] : cloneSeed(seedPayments)));
  const [bookingArchives, setBookingArchives] = useState<BookingArchiveRecord[]>(() =>
    useApi ? [] : seedBookings.map((booking) => buildBookingArchiveRecord(booking))
  );
  const [rentingArchives, setRentingArchives] = useState<RentingArchiveRecord[]>(() =>
    useApi ? [] : seedRentings.map((renting) => buildRentingArchiveRecord(renting))
  );

  const applySnapshot = useCallback((s: BootstrapSnapshot) => {
    setHotelChains(s.hotelChains);
    setHotels(s.hotels);
    setRooms(s.rooms);
    setCustomers(s.customers);
    setEmployees(s.employees);
    setBookings(s.bookings);
    setRentings(s.rentings);
    setPayments(s.payments);
    setBookingArchives(s.bookingArchives);
    setRentingArchives(s.rentingArchives);
    setSqlAreaView(s.areaAvailableRoomsView as AreaAvailableRoomsViewRow[]);
    setSqlHotelCapView(s.hotelCapacityView as HotelCapacityViewRow[]);
  }, []);

  useEffect(() => {
    if (!useApi) return;
    let cancelled = false;
    setApiDataLoading(true);
    setApiConnectionError(null);
    fetchBootstrap()
      .then((snapshot) => {
        if (!cancelled) applySnapshot(snapshot);
      })
      .catch((err: Error) => {
        if (!cancelled) setApiConnectionError(err.message ?? 'Failed to load API data');
      })
      .finally(() => {
        if (!cancelled) setApiDataLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [useApi, applySnapshot]);

  const searchAvailableRooms = (filters: RoomSearchFilters) => {
    return rooms.filter((room) => {
      if (room.status !== 'Available') return false;

      const hotel = hotels.find((entry) => entry.id === room.hotelId);
      if (!hotel) return false;

      if (filters.capacity && room.capacity < Number.parseInt(filters.capacity, 10)) return false;
      if (filters.area && !hotel.city.toLowerCase().includes(filters.area.toLowerCase())) return false;
      if (filters.chain && hotel.chainId !== filters.chain) return false;
      if (filters.category && hotel.category !== Number.parseInt(filters.category, 10)) return false;
      if (filters.minRooms && hotel.numberOfRooms < Number.parseInt(filters.minRooms, 10)) return false;
      if (filters.maxRooms && hotel.numberOfRooms > Number.parseInt(filters.maxRooms, 10)) return false;
      if (typeof filters.minPrice === 'number' && room.price < filters.minPrice) return false;
      if (typeof filters.maxPrice === 'number' && room.price > filters.maxPrice) return false;

      if (!filters.startDate || !filters.endDate) return true;

      const hasOverlappingBooking = bookings.some(
        (booking) =>
          booking.roomId === room.id &&
          (booking.status === 'Pending' || booking.status === 'Confirmed') &&
          rangesOverlap(filters.startDate!, filters.endDate!, booking.startDate, booking.endDate)
      );

      if (hasOverlappingBooking) return false;

      return !rentings.some(
        (renting) =>
          renting.roomId === room.id &&
          rangesOverlap(filters.startDate!, filters.endDate!, renting.startDate, renting.endDate)
      );
    });
  };

  const isRoomAvailableForStay = (roomId: string, startDate: string, endDate: string) => {
    if (!startDate || !endDate || endDate <= startDate) {
      return false;
    }

    if (startDate < todayString()) {
      return false;
    }

    if (startDate > maxAdvanceBookingDate()) {
      return false;
    }

    const room = rooms.find((entry) => entry.id === roomId);
    if (!room || room.status !== 'Available') {
      return false;
    }

    const hasOverlappingBooking = bookings.some(
      (booking) =>
        booking.roomId === roomId &&
        (booking.status === 'Pending' || booking.status === 'Confirmed') &&
        rangesOverlap(startDate, endDate, booking.startDate, booking.endDate)
    );

    if (hasOverlappingBooking) {
      return false;
    }

    return !rentings.some(
      (renting) =>
        renting.roomId === roomId &&
        rangesOverlap(startDate, endDate, renting.startDate, renting.endDate)
    );
  };

  const getUnavailableDatesForRoom = (roomId: string) => {
    const blockedDateMap = new Map<string, Date>();

    bookings
      .filter((booking) => booking.roomId === roomId && (booking.status === 'Pending' || booking.status === 'Confirmed'))
      .forEach((booking) => {
        enumerateDates(booking.startDate, booking.endDate).forEach((date) => {
          blockedDateMap.set(date.toISOString().slice(0, 10), date);
        });
      });

    rentings
      .filter((renting) => renting.roomId === roomId)
      .forEach((renting) => {
        enumerateDates(renting.startDate, renting.endDate).forEach((date) => {
          blockedDateMap.set(date.toISOString().slice(0, 10), date);
        });
      });

    return Array.from(blockedDateMap.values());
  };

  const upsertBookingArchive = (record: BookingArchiveRecord) => {
    setBookingArchives((current) => {
      const next = current.filter((entry) => entry.bookingId !== record.bookingId);
      return [...next, record];
    });
  };

  const upsertRentingArchive = (record: RentingArchiveRecord) => {
    setRentingArchives((current) => {
      const next = current.filter((entry) => entry.rentingId !== record.rentingId);
      return [...next, record];
    });
  };

  const upsertCustomer = (
    input: Partial<Customer> & Pick<Customer, 'fullName' | 'address' | 'idType' | 'idNumber'>
  ) => {
    const nextCustomer: Customer = {
      id: input.id ?? createId('cust'),
      fullName: input.fullName,
      address: input.address,
      idType: input.idType,
      idNumber: input.idNumber,
      registrationDate: input.registrationDate ?? todayString()
    };

    setCustomers((current) => {
      const existingIndex = current.findIndex((entry) => entry.id === nextCustomer.id);
      if (existingIndex === -1) return [...current, nextCustomer];

      const next = [...current];
      next[existingIndex] = nextCustomer;
      return next;
    });

    return nextCustomer;
  };

  const deleteCustomer = (customerId: string) => {
    setCustomers((current) => current.filter((entry) => entry.id !== customerId));
  };

  const upsertEmployee = (
    input: Partial<Employee> & Pick<Employee, 'fullName' | 'address' | 'ssn' | 'role' | 'hotelId'>
  ) => {
    const nextEmployee: Employee = {
      id: input.id ?? createId('emp'),
      fullName: input.fullName,
      address: input.address,
      ssn: input.ssn,
      role: input.role,
      hotelId: input.hotelId
    };

    setEmployees((current) => {
      const existingIndex = current.findIndex((entry) => entry.id === nextEmployee.id);
      if (existingIndex === -1) return [...current, nextEmployee];

      const next = [...current];
      next[existingIndex] = nextEmployee;
      return next;
    });

    return nextEmployee;
  };

  const deleteEmployee = (employeeId: string) => {
    setEmployees((current) => current.filter((entry) => entry.id !== employeeId));
  };

  const upsertHotelChain = (
    input: Partial<HotelChain> &
      Pick<HotelChain, 'name' | 'centralOffice' | 'emails' | 'phones'>
  ) => {
    const nextChain: HotelChain = {
      id: input.id ?? createId('chain'),
      name: input.name,
      centralOffice: input.centralOffice,
      emails: input.emails,
      phones: input.phones
    };

    setHotelChains((current) => {
      const existingIndex = current.findIndex((entry) => entry.id === nextChain.id);
      if (existingIndex === -1) return [...current, nextChain];

      const next = [...current];
      next[existingIndex] = nextChain;
      return next;
    });

    return nextChain;
  };

  const deleteHotelChain = (chainId: string) => {
    setHotelChains((current) => current.filter((entry) => entry.id !== chainId));
    setHotels((current) => current.filter((entry) => entry.chainId !== chainId));
    setRooms((current) =>
      current.filter((entry) =>
        hotels.some((hotel) => hotel.id === entry.hotelId && hotel.chainId !== chainId)
      )
    );
  };

  const upsertHotel = (
    input: Partial<Hotel> &
      Pick<Hotel, 'name' | 'chainId' | 'category' | 'numberOfRooms' | 'address' | 'city' | 'state' | 'emails' | 'phones'>
  ) => {
    const nextHotel: Hotel = {
      id: input.id ?? createId('hotel'),
      name: input.name,
      chainId: input.chainId,
      category: input.category,
      numberOfRooms: input.numberOfRooms,
      address: input.address,
      city: input.city,
      state: input.state,
      emails: input.emails,
      phones: input.phones,
      managerId: input.managerId
    };

    setHotels((current) => {
      const existingIndex = current.findIndex((entry) => entry.id === nextHotel.id);
      if (existingIndex === -1) return [...current, nextHotel];

      const next = [...current];
      next[existingIndex] = nextHotel;
      return next;
    });

    return nextHotel;
  };

  const deleteHotel = (hotelId: string) => {
    setHotels((current) => current.filter((entry) => entry.id !== hotelId));
    setRooms((current) => current.filter((entry) => entry.hotelId !== hotelId));
  };

  const upsertRoom = (
    input: Partial<Room> &
      Pick<Room, 'hotelId' | 'price' | 'amenities' | 'capacity' | 'viewType' | 'extendable' | 'problems' | 'status' | 'roomNumber'>
  ) => {
    const nextRoom: Room = {
      id: input.id ?? createId('room'),
      hotelId: input.hotelId,
      price: input.price,
      amenities: input.amenities,
      capacity: input.capacity,
      viewType: input.viewType,
      extendable: input.extendable,
      problems: input.problems,
      status: input.status,
      roomNumber: input.roomNumber
    };

    setRooms((current) => {
      const existingIndex = current.findIndex((entry) => entry.id === nextRoom.id);
      if (existingIndex === -1) return [...current, nextRoom];

      const next = [...current];
      next[existingIndex] = nextRoom;
      return next;
    });

    return nextRoom;
  };

  const deleteRoom = (roomId: string) => {
    setRooms((current) => current.filter((entry) => entry.id !== roomId));
  };

  const createBooking = async (input: {
    roomId: string;
    customer: Omit<Customer, 'id' | 'registrationDate'>;
    startDate: string;
    endDate: string;
  }): Promise<Booking | null> => {
    if (useApi) {
      if (input.startDate < todayString() || input.startDate > maxAdvanceBookingDate()) {
        return null;
      }
      if (!isRoomAvailableForStay(input.roomId, input.startDate, input.endDate)) {
        return null;
      }
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: input.roomId,
          customer: {
            fullName: input.customer.fullName,
            address: input.customer.address,
            idNumber: input.customer.idNumber
          },
          startDate: input.startDate,
          endDate: input.endDate
        })
      });
      const data = (await res.json()) as { bookingId?: string; snapshot?: BootstrapSnapshot; error?: string };
      if (!res.ok || !data.snapshot || !data.bookingId) {
        return null;
      }
      applySnapshot(data.snapshot);
      const created = data.snapshot.bookings.find((b) => b.id === String(data.bookingId));
      return created ?? null;
    }

    if (input.startDate < todayString()) {
      return null;
    }

    if (input.startDate > maxAdvanceBookingDate()) {
      return null;
    }

    if (!isRoomAvailableForStay(input.roomId, input.startDate, input.endDate)) {
      return null;
    }

    const customer = upsertCustomer(input.customer);
    const nextBooking: Booking = {
      id: createId('book'),
      customerId: customer.id,
      roomId: input.roomId,
      startDate: input.startDate,
      endDate: input.endDate,
      status: 'Confirmed',
      registrationDate: todayString()
    };

    setBookings((current) => [...current, nextBooking]);

    const room = rooms.find((entry) => entry.id === nextBooking.roomId);
    const hotel = room ? hotels.find((entry) => entry.id === room.hotelId) : null;
    const chain = hotel ? hotelChains.find((entry) => entry.id === hotel.chainId) : null;
    upsertBookingArchive({
      id: `booking-archive-${nextBooking.id}`,
      bookingId: nextBooking.id,
      customerId: customer.id,
      customerName: customer.fullName,
      roomId: room?.id,
      roomNumber: room?.roomNumber ?? 'Deleted room',
      hotelId: hotel?.id,
      hotelName: hotel?.name ?? 'Deleted hotel',
      hotelCity: hotel?.city ?? 'Unknown',
      hotelChainName: chain?.name ?? 'Unknown chain',
      roomPrice: room?.price ?? 0,
      startDate: nextBooking.startDate,
      endDate: nextBooking.endDate,
      status: nextBooking.status,
      registrationDate: nextBooking.registrationDate
    });

    return nextBooking;
  };

  const cancelBooking = async (bookingId: string) => {
    if (useApi) {
      const res = await fetch(`/api/bookings/${encodeURIComponent(bookingId)}/cancel`, { method: 'PATCH' });
      const data = (await res.json()) as { snapshot?: BootstrapSnapshot };
      if (res.ok && data.snapshot) applySnapshot(data.snapshot);
      return;
    }

    setBookings((current) =>
      current.map((entry) => (entry.id === bookingId ? { ...entry, status: 'Cancelled' } : entry))
    );
    setBookingArchives((current) =>
      current.map((entry) => (entry.bookingId === bookingId ? { ...entry, status: 'Cancelled' } : entry))
    );
  };

  const convertBookingToRenting = async (bookingId: string, employeeId: string): Promise<Renting | null> => {
    if (useApi) {
      const res = await fetch('/api/rentings/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, employeeId })
      });
      const data = (await res.json()) as { snapshot?: BootstrapSnapshot };
      if (!res.ok || !data.snapshot) return null;
      applySnapshot(data.snapshot);
      const renting = [...data.snapshot.rentings]
        .reverse()
        .find((r) => r.bookingId === bookingId);
      return renting ?? null;
    }

    const booking = bookings.find((entry) => entry.id === bookingId);
    if (!booking) return null;

    const nextRenting: Renting = {
      id: createId('rent'),
      customerId: booking.customerId,
      roomId: booking.roomId,
      employeeId,
      startDate: booking.startDate,
      endDate: booking.endDate,
      checkInDate: todayString(),
      bookingId: booking.id
    };

    setBookings((current) =>
      current.map((entry) => (entry.id === booking.id ? { ...entry, status: 'Converted' } : entry))
    );
    setRentings((current) => [...current, nextRenting]);
    setBookingArchives((current) =>
      current.map((entry) => (entry.bookingId === booking.id ? { ...entry, status: 'Converted' } : entry))
    );

    const customer = customers.find((entry) => entry.id === nextRenting.customerId);
    const employee = employees.find((entry) => entry.id === nextRenting.employeeId);
    const room = rooms.find((entry) => entry.id === nextRenting.roomId);
    const hotel = room ? hotels.find((entry) => entry.id === room.hotelId) : null;
    const chain = hotel ? hotelChains.find((entry) => entry.id === hotel.chainId) : null;
    upsertRentingArchive({
      id: `renting-archive-${nextRenting.id}`,
      rentingId: nextRenting.id,
      bookingId: nextRenting.bookingId,
      customerId: customer?.id,
      customerName: customer?.fullName ?? 'Deleted customer',
      employeeId: employee?.id,
      employeeName: employee?.fullName ?? 'Deleted employee',
      roomId: room?.id,
      roomNumber: room?.roomNumber ?? 'Deleted room',
      hotelId: hotel?.id,
      hotelName: hotel?.name ?? 'Deleted hotel',
      hotelCity: hotel?.city ?? 'Unknown',
      hotelChainName: chain?.name ?? 'Unknown chain',
      roomPrice: room?.price ?? 0,
      startDate: nextRenting.startDate,
      endDate: nextRenting.endDate,
      checkInDate: nextRenting.checkInDate,
      source: 'booking'
    });

    return nextRenting;
  };

  const createDirectRenting = async (input: {
    customerId: string;
    roomId: string;
    employeeId: string;
    startDate: string;
    endDate: string;
  }): Promise<Renting | null> => {
    if (useApi) {
      if (input.startDate < todayString() || input.startDate > maxAdvanceBookingDate()) {
        return null;
      }
      if (!isRoomAvailableForStay(input.roomId, input.startDate, input.endDate)) {
        return null;
      }
      const res = await fetch('/api/rentings/direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      });
      const data = (await res.json()) as { snapshot?: BootstrapSnapshot };
      if (!res.ok || !data.snapshot) return null;
      applySnapshot(data.snapshot);
      const match = data.snapshot.rentings.find(
        (r) =>
          r.customerId === input.customerId &&
          r.roomId === input.roomId &&
          r.startDate === input.startDate &&
          r.endDate === input.endDate
      );
      return match ?? data.snapshot.rentings[data.snapshot.rentings.length - 1] ?? null;
    }

    if (input.startDate < todayString()) {
      return null;
    }

    if (input.startDate > maxAdvanceBookingDate()) {
      return null;
    }

    if (!isRoomAvailableForStay(input.roomId, input.startDate, input.endDate)) {
      return null;
    }

    const nextRenting: Renting = {
      id: createId('rent'),
      customerId: input.customerId,
      roomId: input.roomId,
      employeeId: input.employeeId,
      startDate: input.startDate,
      endDate: input.endDate,
      checkInDate: todayString()
    };

    setRentings((current) => [...current, nextRenting]);

    const customer = customers.find((entry) => entry.id === nextRenting.customerId);
    const employee = employees.find((entry) => entry.id === nextRenting.employeeId);
    const room = rooms.find((entry) => entry.id === nextRenting.roomId);
    const hotel = room ? hotels.find((entry) => entry.id === room.hotelId) : null;
    const chain = hotel ? hotelChains.find((entry) => entry.id === hotel.chainId) : null;
    upsertRentingArchive({
      id: `renting-archive-${nextRenting.id}`,
      rentingId: nextRenting.id,
      bookingId: undefined,
      customerId: customer?.id,
      customerName: customer?.fullName ?? 'Deleted customer',
      employeeId: employee?.id,
      employeeName: employee?.fullName ?? 'Deleted employee',
      roomId: room?.id,
      roomNumber: room?.roomNumber ?? 'Deleted room',
      hotelId: hotel?.id,
      hotelName: hotel?.name ?? 'Deleted hotel',
      hotelCity: hotel?.city ?? 'Unknown',
      hotelChainName: chain?.name ?? 'Unknown chain',
      roomPrice: room?.price ?? 0,
      startDate: nextRenting.startDate,
      endDate: nextRenting.endDate,
      checkInDate: nextRenting.checkInDate,
      source: 'walk-in'
    });

    return nextRenting;
  };

  const recordPayment = async (input: Omit<Payment, 'id'>): Promise<Payment> => {
    if (useApi) {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      });
      const data = (await res.json()) as { snapshot?: BootstrapSnapshot };
      if (!res.ok || !data.snapshot) {
        throw new Error('Payment failed');
      }
      applySnapshot(data.snapshot);
      const forRenting = data.snapshot.payments.filter((p) => p.rentingId === input.rentingId);
      const pay = forRenting.sort((a, b) => Number(b.id) - Number(a.id))[0];
      if (pay) return pay;
      throw new Error('Payment failed');
    }

    const nextPayment: Payment = {
      id: createId('pay'),
      ...input
    };

    setPayments((current) => [nextPayment, ...current]);
    return nextPayment;
  };

  const areaAvailableRoomsView = useMemo<AreaAvailableRoomsViewRow[]>(() => {
    if (useApi) return sqlAreaView;

    const activeDate = todayString();
    const grouped = new Map<string, { availableRooms: number; hotelIds: Set<string> }>();

    hotels.forEach((hotel) => {
      const areaKey = `${hotel.city}, ${hotel.state}`;
      const current = grouped.get(areaKey) ?? { availableRooms: 0, hotelIds: new Set<string>() };
      current.hotelIds.add(hotel.id);

      rooms
        .filter((room) => room.hotelId === hotel.id)
        .forEach((room) => {
          const hasActiveBooking = bookings.some(
            (booking) =>
              booking.roomId === room.id &&
              (booking.status === 'Pending' || booking.status === 'Confirmed') &&
              booking.startDate <= activeDate &&
              booking.endDate > activeDate
          );

          const hasActiveRenting = rentings.some(
            (renting) =>
              renting.roomId === room.id &&
              renting.startDate <= activeDate &&
              renting.endDate > activeDate
          );

          if (room.status === 'Available' && !hasActiveBooking && !hasActiveRenting) {
            current.availableRooms += 1;
          }
        });

      grouped.set(areaKey, current);
    });

    return Array.from(grouped.entries())
      .map(([area, value], index) => ({
        id: `area-view-${index + 1}`,
        area,
        hotelsInArea: value.hotelIds.size,
        availableRooms: value.availableRooms
      }))
      .sort((left, right) => right.availableRooms - left.availableRooms || left.area.localeCompare(right.area));
  }, [useApi, sqlAreaView, hotels, rooms, bookings, rentings]);

  const hotelCapacityView = useMemo<HotelCapacityViewRow[]>(() => {
    if (useApi) return sqlHotelCapView;

    return hotels
      .map((hotel) => {
        const hotelRooms = rooms.filter((room) => room.hotelId === hotel.id);
        const chain = hotelChains.find((entry) => entry.id === hotel.chainId);

        return {
          id: `hotel-capacity-${hotel.id}`,
          hotelId: hotel.id,
          hotelName: hotel.name,
          area: `${hotel.city}, ${hotel.state}`,
          hotelChain: chain?.name ?? 'Unknown chain',
          roomCount: hotelRooms.length,
          aggregatedCapacity: hotelRooms.reduce((sum, room) => sum + room.capacity, 0)
        };
      })
      .sort((left, right) => right.aggregatedCapacity - left.aggregatedCapacity || left.hotelName.localeCompare(right.hotelName));
  }, [useApi, sqlHotelCapView, hotels, rooms, hotelChains]);

  const value: HotelStoreValue = {
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
    hotelCapacityView,
    apiDataLoading,
    apiConnectionError,
    searchAvailableRooms,
    isRoomAvailableForStay,
    getUnavailableDatesForRoom,
    createBooking,
    cancelBooking,
    convertBookingToRenting,
    createDirectRenting,
    recordPayment,
    upsertCustomer,
    deleteCustomer,
    upsertEmployee,
    deleteEmployee,
    upsertHotelChain,
    deleteHotelChain,
    upsertHotel,
    deleteHotel,
    upsertRoom,
    deleteRoom
  };

  if (useApi && apiDataLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading…</div>;
  }

  if (useApi && apiConnectionError) {
    return (
      <div className="p-8 text-center text-red-600">
        Failed to connect to database API: {apiConnectionError}
      </div>
    );
  }

  return <HotelStoreContext.Provider value={value}>{children}</HotelStoreContext.Provider>;
}

export function useHotelStore() {
  const context = useContext(HotelStoreContext);

  if (!context) {
    throw new Error('useHotelStore must be used within HotelStoreProvider');
  }

  return context;
}
