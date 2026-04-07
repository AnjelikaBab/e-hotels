export function parseAddress(address: string): { street: string; city: string; state: string } {
  const parts = address.split(',').map((p) => p.trim());
  const street = parts[0] ?? '';
  const city = parts[1] ?? '';
  const stateZip = parts[2] ?? '';
  const state = stateZip.split(/\s+/)[0] ?? '';
  return { street, city, state };
}

export function capacityToNumber(cap: string): number {
  const m: Record<string, number> = {
    single: 1,
    double: 2,
    triple: 3,
    quad: 4,
    suite: 5
  };
  return m[cap] ?? 1;
}

export function viewTypeToUi(v: string): string {
  const m: Record<string, string> = {
    sea_view: 'Sea View',
    mountain_view: 'Mountain View',
    city_view: 'City View',
    garden_view: 'Garden View',
    no_view: 'No Special View'
  };
  return m[v] ?? 'No Special View';
}

export function roomCompositeId(hotelId: string | number, roomId: string | number): string {
  return `${hotelId}-${roomId}`;
}

export function parseRoomCompositeId(id: string): { hotelId: string; roomId: string } | null {
  const i = id.indexOf('-');
  if (i <= 0) return null;
  const hotelId = id.slice(0, i);
  const roomId = id.slice(i + 1);
  if (!hotelId || !roomId) return null;
  return { hotelId, roomId };
}

export function splitFullName(fullName: string): { first: string; last: string } {
  const t = fullName.trim();
  const space = t.indexOf(' ');
  if (space === -1) return { first: t || 'Guest', last: 'Guest' };
  return { first: t.slice(0, space), last: t.slice(space + 1).trim() || 'Guest' };
}
