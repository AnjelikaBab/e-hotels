import { hotelChains, type HotelChain } from '../data/mockData';

export async function getHotelChains(): Promise<HotelChain[]> {
  return hotelChains;
}
