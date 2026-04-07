import type {
  Booking,
  BookingArchiveRecord,
  Customer,
  Employee,
  Hotel,
  HotelChain,
  Payment,
  Renting,
  RentingArchiveRecord,
  Room
} from '../data/mockData';

export interface BootstrapSnapshot {
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
  areaAvailableRoomsView: Array<{
    id: string;
    area: string;
    hotelsInArea: number;
    availableRooms: number;
  }>;
  hotelCapacityView: Array<{
    id: string;
    hotelId: string;
    hotelName: string;
    area: string;
    hotelChain: string;
    roomCount: number;
    aggregatedCapacity: number;
  }>;
}

export async function fetchBootstrap(): Promise<BootstrapSnapshot> {
  const res = await fetch('/api/bootstrap');
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Bootstrap failed (${res.status})`);
  }
  return res.json() as Promise<BootstrapSnapshot>;
}

export const useApiData = () => import.meta.env.VITE_USE_API === 'true';
