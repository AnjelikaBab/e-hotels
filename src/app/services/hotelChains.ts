import { hotelChains, type HotelChain } from '../data/mockData';

export async function getHotelChains(): Promise<HotelChain[]> {
  // Replace this mock-backed implementation with a real database/API call later.
  return hotelChains;
}
