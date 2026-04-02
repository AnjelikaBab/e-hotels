// Mock data for the hotel booking application

export interface HotelChain {
  id: string;
  name: string;
  centralOffice: string;
  emails: string[];
  phones: string[];
}

export interface Hotel {
  id: string;
  name: string;
  chainId: string;
  category: 1 | 2 | 3 | 4 | 5;
  numberOfRooms: number;
  address: string;
  city: string;
  state: string;
  emails: string[];
  phones: string[];
  managerId?: string;
}

export interface Room {
  id: string;
  hotelId: string;
  price: number;
  amenities: string[];
  capacity: number;
  viewType: 'Sea View' | 'Mountain View' | 'City View' | 'Garden View' | 'No Special View';
  extendable: boolean;
  problems: string;
  status: 'Available' | 'Occupied' | 'Maintenance';
  roomNumber: string;
}

export interface Customer {
  id: string;
  fullName: string;
  address: string;
  idType: 'SSN' | 'SIN' | "Driver's License";
  idNumber: string;
  registrationDate: string;
}

export interface Employee {
  id: string;
  fullName: string;
  address: string;
  ssn: string;
  role: 'Employee' | 'Hotel Manager';
  hotelId: string;
}

export interface Booking {
  id: string;
  customerId: string;
  roomId: string;
  startDate: string;
  endDate: string;
  status: 'Pending' | 'Confirmed' | 'Converted' | 'Cancelled';
  registrationDate: string;
}

export interface Renting {
  id: string;
  customerId: string;
  roomId: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  checkInDate: string;
  bookingId?: string;
}

export interface Payment {
  id: string;
  rentingId: string;
  amount: number;
  paymentMethod: 'Cash' | 'Credit Card' | 'Debit Card' | 'Wire Transfer';
  paymentDate: string;
}

// Hotel Chains
export const hotelChains: HotelChain[] = [
  {
    id: 'chain1',
    name: 'Prestige Hotels',
    centralOffice: '100 Park Avenue, New York, NY 10017',
    emails: ['contact@prestigehotels.com', 'partners@prestigehotels.com'],
    phones: ['+1-800-555-0101', '+1-800-555-0109']
  },
  {
    id: 'chain2',
    name: 'Coastal Resorts',
    centralOffice: '450 Ocean Drive, Miami, FL 33139',
    emails: ['info@coastalresorts.com', 'support@coastalresorts.com'],
    phones: ['+1-800-555-0202', '+1-800-555-0210']
  },
  {
    id: 'chain3',
    name: 'Mountain Lodge Group',
    centralOffice: '789 Alpine Way, Denver, CO 80202',
    emails: ['reservations@mountainlodge.com', 'ops@mountainlodge.com'],
    phones: ['+1-800-555-0303', '+1-800-555-0311']
  },
  {
    id: 'chain4',
    name: 'Urban Suites',
    centralOffice: '321 Downtown Boulevard, Chicago, IL 60601',
    emails: ['hello@urbansuites.com', 'corp@urbansuites.com'],
    phones: ['+1-800-555-0404', '+1-800-555-0412']
  },
  {
    id: 'chain5',
    name: 'Grand Heritage Hotels',
    centralOffice: '567 Historic Lane, Boston, MA 02108',
    emails: ['welcome@grandheritage.com', 'vip@grandheritage.com'],
    phones: ['+1-800-555-0505', '+1-800-555-0513']
  }
];

// Hotels
const baseHotels: Hotel[] = [
  {
    id: 'hotel1',
    name: 'Prestige Manhattan',
    chainId: 'chain1',
    category: 5,
    numberOfRooms: 250,
    address: '200 Park Avenue',
    city: 'New York',
    state: 'NY',
    emails: ['manhattan@prestigehotels.com', 'frontdesk.manhattan@prestigehotels.com'],
    phones: ['+1-212-555-0101', '+1-212-555-0108'],
    managerId: 'emp1'
  },
  {
    id: 'hotel2',
    name: 'Prestige Beverly Hills',
    chainId: 'chain1',
    category: 5,
    numberOfRooms: 180,
    address: '9876 Wilshire Boulevard',
    city: 'Los Angeles',
    state: 'CA',
    emails: ['beverlyhills@prestigehotels.com', 'concierge.bh@prestigehotels.com'],
    phones: ['+1-310-555-0102', '+1-310-555-0107']
  },
  {
    id: 'hotel3',
    name: 'Coastal Miami Beach',
    chainId: 'chain2',
    category: 4,
    numberOfRooms: 320,
    address: '1500 Ocean Drive',
    city: 'Miami',
    state: 'FL',
    emails: ['miami@coastalresorts.com', 'frontdesk.miami@coastalresorts.com'],
    phones: ['+1-305-555-0201', '+1-305-555-0208']
  },
  {
    id: 'hotel4',
    name: 'Coastal San Diego',
    chainId: 'chain2',
    category: 4,
    numberOfRooms: 200,
    address: '890 Harbor Drive',
    city: 'San Diego',
    state: 'CA',
    emails: ['sandiego@coastalresorts.com', 'reservations.sd@coastalresorts.com'],
    phones: ['+1-619-555-0202', '+1-619-555-0209']
  },
  {
    id: 'hotel5',
    name: 'Mountain Lodge Aspen',
    chainId: 'chain3',
    category: 5,
    numberOfRooms: 120,
    address: '456 Mountain Road',
    city: 'Aspen',
    state: 'CO',
    emails: ['aspen@mountainlodge.com', 'ski-desk@mountainlodge.com'],
    phones: ['+1-970-555-0301', '+1-970-555-0308']
  },
  {
    id: 'hotel6',
    name: 'Mountain Lodge Tahoe',
    chainId: 'chain3',
    category: 4,
    numberOfRooms: 150,
    address: '678 Lake Boulevard',
    city: 'Lake Tahoe',
    state: 'CA',
    emails: ['tahoe@mountainlodge.com', 'lakeview@mountainlodge.com'],
    phones: ['+1-530-555-0302', '+1-530-555-0309']
  },
  {
    id: 'hotel7',
    name: 'Urban Suites Chicago Loop',
    chainId: 'chain4',
    category: 4,
    numberOfRooms: 280,
    address: '123 Michigan Avenue',
    city: 'Chicago',
    state: 'IL',
    emails: ['loop@urbansuites.com', 'events.loop@urbansuites.com'],
    phones: ['+1-312-555-0401', '+1-312-555-0408']
  },
  {
    id: 'hotel8',
    name: 'Urban Suites Seattle',
    chainId: 'chain4',
    category: 3,
    numberOfRooms: 160,
    address: '789 Pike Street',
    city: 'Seattle',
    state: 'WA',
    emails: ['seattle@urbansuites.com', 'frontdesk.seattle@urbansuites.com'],
    phones: ['+1-206-555-0402', '+1-206-555-0409']
  },
  {
    id: 'hotel9',
    name: 'Grand Heritage Boston',
    chainId: 'chain5',
    category: 5,
    numberOfRooms: 210,
    address: '101 Commonwealth Avenue',
    city: 'Boston',
    state: 'MA',
    emails: ['boston@grandheritage.com', 'heritageclub.boston@grandheritage.com'],
    phones: ['+1-617-555-0501', '+1-617-555-0508']
  },
  {
    id: 'hotel10',
    name: 'Grand Heritage Philadelphia',
    chainId: 'chain5',
    category: 4,
    numberOfRooms: 175,
    address: '234 Market Street',
    city: 'Philadelphia',
    state: 'PA',
    emails: ['philly@grandheritage.com', 'reservations.philly@grandheritage.com'],
    phones: ['+1-215-555-0502', '+1-215-555-0509']
  },
  {
    id: 'hotel11',
    name: 'Prestige Toronto Harbour',
    chainId: 'chain1',
    category: 4,
    numberOfRooms: 205,
    address: '88 Queens Quay West',
    city: 'Toronto',
    state: 'ON',
    emails: ['toronto@prestigehotels.com', 'harbourdesk@prestigehotels.com'],
    phones: ['+1-416-555-0111', '+1-416-555-0118']
  },
  {
    id: 'hotel12',
    name: 'Coastal Vancouver Bay',
    chainId: 'chain2',
    category: 4,
    numberOfRooms: 190,
    address: '425 Waterfront Road',
    city: 'Vancouver',
    state: 'BC',
    emails: ['vancouver@coastalresorts.com', 'bayfront@coastalresorts.com'],
    phones: ['+1-604-555-0212', '+1-604-555-0219']
  },
  {
    id: 'hotel13',
    name: 'Mountain Lodge Banff',
    chainId: 'chain3',
    category: 5,
    numberOfRooms: 145,
    address: '12 Summit Trail',
    city: 'Banff',
    state: 'AB',
    emails: ['banff@mountainlodge.com', 'alpine@mountainlodge.com'],
    phones: ['+1-403-555-0313', '+1-403-555-0319']
  },
  {
    id: 'hotel14',
    name: 'Urban Suites Montreal Centre',
    chainId: 'chain4',
    category: 4,
    numberOfRooms: 175,
    address: '610 Rue Sherbrooke Ouest',
    city: 'Montreal',
    state: 'QC',
    emails: ['montreal@urbansuites.com', 'centre@urbansuites.com'],
    phones: ['+1-514-555-0414', '+1-514-555-0419']
  },
  {
    id: 'hotel15',
    name: 'Grand Heritage Washington Circle',
    chainId: 'chain5',
    category: 5,
    numberOfRooms: 225,
    address: '2100 Pennsylvania Avenue NW',
    city: 'Washington',
    state: 'DC',
    emails: ['washington@grandheritage.com', 'circle@grandheritage.com'],
    phones: ['+1-202-555-0515', '+1-202-555-0519']
  }
];

const generatedHotelPlans: Record<string, Array<{ name: string; city: string; state: string; category: Hotel['category']; rooms: number; address: string }>> = {
  chain1: [
    { name: 'Prestige New York SoHo', city: 'New York', state: 'NY', category: 4, rooms: 198, address: '55 Spring Street' },
    { name: 'Prestige Miami Design District', city: 'Miami', state: 'FL', category: 5, rooms: 220, address: '210 Biscayne Boulevard' },
    { name: 'Prestige Dallas Uptown', city: 'Dallas', state: 'TX', category: 3, rooms: 174, address: '800 McKinney Avenue' },
    { name: 'Prestige Vancouver Skyline', city: 'Vancouver', state: 'BC', category: 4, rooms: 190, address: '330 Burrard Street' },
    { name: 'Prestige Montreal Old Port', city: 'Montreal', state: 'QC', category: 5, rooms: 208, address: '18 Rue Saint-Paul Ouest' }
  ],
  chain2: [
    { name: 'Coastal Orlando Springs', city: 'Orlando', state: 'FL', category: 3, rooms: 182, address: '740 Lake Eola Drive' },
    { name: 'Coastal Tampa Bayfront', city: 'Tampa', state: 'FL', category: 4, rooms: 196, address: '90 Harbour Island Boulevard' },
    { name: 'Coastal Los Cabos North', city: 'San Diego', state: 'CA', category: 5, rooms: 212, address: '920 Harbor Drive North' },
    { name: 'Coastal Cancun Avenue', city: 'Vancouver', state: 'BC', category: 3, rooms: 168, address: '1020 Granville Street' },
    { name: 'Coastal Halifax Pier', city: 'Halifax', state: 'NS', category: 4, rooms: 158, address: '12 Lower Water Street' }
  ],
  chain3: [
    { name: 'Mountain Lodge Denver Peaks', city: 'Denver', state: 'CO', category: 4, rooms: 166, address: '410 Alpine Plaza' },
    { name: 'Mountain Lodge Whistler Ridge', city: 'Whistler', state: 'BC', category: 5, rooms: 152, address: '98 Blackcomb Way' },
    { name: 'Mountain Lodge Salt Lake Summit', city: 'Salt Lake City', state: 'UT', category: 3, rooms: 170, address: '420 Wasatch Avenue' },
    { name: 'Mountain Lodge Calgary Foothills', city: 'Calgary', state: 'AB', category: 4, rooms: 160, address: '77 Bow Trail SW' },
    { name: 'Mountain Lodge Quebec Heights', city: 'Quebec City', state: 'QC', category: 5, rooms: 148, address: '15 Côte de la Montagne' }
  ],
  chain4: [
    { name: 'Urban Suites Toronto Financial', city: 'Toronto', state: 'ON', category: 3, rooms: 188, address: '200 King Street West' },
    { name: 'Urban Suites New York Hudson', city: 'New York', state: 'NY', category: 4, rooms: 214, address: '470 10th Avenue' },
    { name: 'Urban Suites Atlanta Midtown', city: 'Atlanta', state: 'GA', category: 3, rooms: 172, address: '990 Peachtree Street NE' },
    { name: 'Urban Suites Austin Central', city: 'Austin', state: 'TX', category: 4, rooms: 165, address: '610 Congress Avenue' },
    { name: 'Urban Suites Philadelphia Square', city: 'Philadelphia', state: 'PA', category: 5, rooms: 201, address: '1600 Arch Street' }
  ],
  chain5: [
    { name: 'Grand Heritage Charleston', city: 'Charleston', state: 'SC', category: 5, rooms: 156, address: '14 Meeting Street' },
    { name: 'Grand Heritage Savannah', city: 'Savannah', state: 'GA', category: 4, rooms: 148, address: '220 River Street' },
    { name: 'Grand Heritage Toronto Manor', city: 'Toronto', state: 'ON', category: 5, rooms: 210, address: '55 Bloor Street West' },
    { name: 'Grand Heritage New Orleans', city: 'New Orleans', state: 'LA', category: 3, rooms: 162, address: '730 Canal Street' },
    { name: 'Grand Heritage Ottawa Embassy', city: 'Ottawa', state: 'ON', category: 4, rooms: 154, address: '101 Wellington Street' }
  ]
};

let generatedHotelCounter = baseHotels.length + 1;

const generatedHotels: Hotel[] = Object.entries(generatedHotelPlans).flatMap(([chainId, plans]) =>
  plans.map((plan) => ({
    id: `hotel${generatedHotelCounter++}`,
    name: plan.name,
    chainId,
    category: plan.category,
    numberOfRooms: plan.rooms,
    address: plan.address,
    city: plan.city,
    state: plan.state,
    emails: [
      `${plan.name.toLowerCase().replace(/[^a-z0-9]+/g, '.')}@ehotels-demo.com`,
      `frontdesk.${plan.city.toLowerCase().replace(/[^a-z0-9]+/g, '')}@ehotels-demo.com`
    ],
    phones: [
      `+1-8${generatedHotelCounter.toString().padStart(2, '0')}-555-${(1000 + generatedHotelCounter).toString().slice(-4)}`,
      `+1-8${generatedHotelCounter.toString().padStart(2, '0')}-555-${(2000 + generatedHotelCounter).toString().slice(-4)}`
    ]
  }))
);

const allHotelsWithoutManagers = [...baseHotels, ...generatedHotels];

// Rooms
const baseRooms: Room[] = [
  {
    id: 'room1',
    hotelId: 'hotel1',
    price: 450,
    amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Safe', 'Room Service'],
    capacity: 2,
    viewType: 'City View',
    extendable: true,
    problems: '',
    status: 'Available',
    roomNumber: '1501'
  },
  {
    id: 'room2',
    hotelId: 'hotel1',
    price: 650,
    amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Safe', 'Room Service', 'Jacuzzi'],
    capacity: 2,
    viewType: 'City View',
    extendable: true,
    problems: '',
    status: 'Available',
    roomNumber: '1802'
  },
  {
    id: 'room3',
    hotelId: 'hotel3',
    price: 380,
    amenities: ['WiFi', 'TV', 'Air Conditioning', 'Balcony', 'Room Service'],
    capacity: 4,
    viewType: 'Sea View',
    extendable: true,
    problems: '',
    status: 'Available',
    roomNumber: '305'
  },
  {
    id: 'room4',
    hotelId: 'hotel3',
    price: 320,
    amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Fridge'],
    capacity: 2,
    viewType: 'Sea View',
    extendable: false,
    problems: '',
    status: 'Available',
    roomNumber: '207'
  },
  {
    id: 'room5',
    hotelId: 'hotel5',
    price: 520,
    amenities: ['WiFi', 'TV', 'Fireplace', 'Hot Tub', 'Balcony', 'Mini Bar'],
    capacity: 2,
    viewType: 'Mountain View',
    extendable: true,
    problems: '',
    status: 'Available',
    roomNumber: '401'
  },
  {
    id: 'room6',
    hotelId: 'hotel5',
    price: 780,
    amenities: ['WiFi', 'TV', 'Fireplace', 'Hot Tub', 'Balcony', 'Mini Bar', 'Kitchen'],
    capacity: 4,
    viewType: 'Mountain View',
    extendable: true,
    problems: '',
    status: 'Available',
    roomNumber: '501'
  },
  {
    id: 'room7',
    hotelId: 'hotel7',
    price: 280,
    amenities: ['WiFi', 'TV', 'Air Conditioning', 'Desk'],
    capacity: 2,
    viewType: 'City View',
    extendable: true,
    problems: '',
    status: 'Available',
    roomNumber: '1205'
  },
  {
    id: 'room8',
    hotelId: 'hotel9',
    price: 420,
    amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Safe', 'Historic Decor'],
    capacity: 2,
    viewType: 'Garden View',
    extendable: false,
    problems: '',
    status: 'Available',
    roomNumber: '302'
  },
  {
    id: 'room9',
    hotelId: 'hotel2',
    price: 580,
    amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Safe', 'Pool Access'],
    capacity: 2,
    viewType: 'Garden View',
    extendable: true,
    problems: '',
    status: 'Available',
    roomNumber: '1104'
  },
  {
    id: 'room10',
    hotelId: 'hotel4',
    price: 350,
    amenities: ['WiFi', 'TV', 'Air Conditioning', 'Balcony'],
    capacity: 3,
    viewType: 'Sea View',
    extendable: true,
    problems: '',
    status: 'Available',
    roomNumber: '608'
  },
  {
    id: 'room11',
    hotelId: 'hotel1',
    price: 420,
    amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar'],
    capacity: 2,
    viewType: 'City View',
    extendable: false,
    problems: 'Minor wear on carpet',
    status: 'Occupied',
    roomNumber: '1203'
  },
  {
    id: 'room12',
    hotelId: 'hotel6',
    price: 390,
    amenities: ['WiFi', 'TV', 'Fireplace', 'Balcony'],
    capacity: 2,
    viewType: 'Mountain View',
    extendable: true,
    problems: '',
    status: 'Maintenance',
    roomNumber: '704'
  }
];

const requiredCapacities = [1, 2, 3, 4, 5];
const capacityAmenities: Record<number, string[]> = {
  1: ['WiFi', 'TV', 'Desk'],
  2: ['WiFi', 'TV', 'Air Conditioning', 'Mini Fridge'],
  3: ['WiFi', 'TV', 'Air Conditioning', 'Balcony', 'Mini Fridge'],
  4: ['WiFi', 'TV', 'Air Conditioning', 'Kitchenette', 'Sofa Bed'],
  5: ['WiFi', 'TV', 'Air Conditioning', 'Kitchen', 'Dining Area', 'Lounge']
};
const capacityViews: Room['viewType'][] = ['City View', 'Garden View', 'Sea View', 'Mountain View', 'No Special View'];

let generatedRoomCounter = baseRooms.length + 1;

const generatedRooms: Room[] = allHotelsWithoutManagers.flatMap((hotel) => {
  const existingRooms = baseRooms.filter((room) => room.hotelId === hotel.id);
  const existingCapacities = new Set(existingRooms.map((room) => room.capacity));

  return requiredCapacities
    .filter((capacity) => !existingCapacities.has(capacity))
    .map((capacity, index) => ({
      id: `room${generatedRoomCounter++}`,
      hotelId: hotel.id,
      price: 140 + capacity * 85 + index * 15,
      amenities: capacityAmenities[capacity],
      capacity,
      viewType: capacityViews[(capacity + hotel.category) % capacityViews.length],
      extendable: capacity < 5,
      problems: '',
      status: 'Available' as const,
      roomNumber: `${hotel.id.replace('hotel', '')}${capacity}0${index + 1}`
    }));
});

// Customers
export const customers: Customer[] = [
  {
    id: 'cust1',
    fullName: 'John Smith',
    address: '123 Main Street, Boston, MA 02108',
    idType: 'SSN',
    idNumber: '123-45-6789',
    registrationDate: '2024-01-15'
  },
  {
    id: 'cust2',
    fullName: 'Sarah Johnson',
    address: '456 Oak Avenue, New York, NY 10001',
    idType: "Driver's License",
    idNumber: 'S1234567',
    registrationDate: '2024-02-20'
  },
  {
    id: 'cust3',
    fullName: 'Michael Chen',
    address: '789 Pine Road, San Francisco, CA 94102',
    idType: 'SSN',
    idNumber: '234-56-7890',
    registrationDate: '2024-03-10'
  },
  {
    id: 'cust4',
    fullName: 'Emily Davis',
    address: '321 Maple Drive, Chicago, IL 60601',
    idType: "Driver's License",
    idNumber: 'D7654321',
    registrationDate: '2024-01-05'
  },
  {
    id: 'cust5',
    fullName: 'David Martinez',
    address: '654 Elm Street, Miami, FL 33139',
    idType: 'SSN',
    idNumber: '345-67-8901',
    registrationDate: '2024-04-12'
  }
];

// Employees
const baseEmployees: Employee[] = [
  {
    id: 'emp1',
    fullName: 'Robert Anderson',
    address: '111 Business Plaza, New York, NY 10017',
    ssn: '123-45-6789',
    role: 'Hotel Manager',
    hotelId: 'hotel1'
  },
  {
    id: 'emp2',
    fullName: 'Jennifer Wilson',
    address: '222 Staff Court, Miami, FL 33139',
    ssn: '234-56-7890',
    role: 'Employee',
    hotelId: 'hotel3'
  },
  {
    id: 'emp3',
    fullName: 'William Brown',
    address: '333 Employee Lane, Aspen, CO 81611',
    ssn: '345-67-8901',
    role: 'Employee',
    hotelId: 'hotel5'
  },
  {
    id: 'emp4',
    fullName: 'Lisa Thompson',
    address: '444 Worker Street, Chicago, IL 60601',
    ssn: '456-78-9012',
    role: 'Employee',
    hotelId: 'hotel7'
  },
  {
    id: 'emp5',
    fullName: 'James Garcia',
    address: '555 Staff Avenue, Boston, MA 02108',
    ssn: '567-89-0123',
    role: 'Hotel Manager',
    hotelId: 'hotel9'
  }
];

const managedHotelIds = new Set(baseHotels.filter((hotel) => hotel.managerId).map((hotel) => hotel.id));
let generatedEmployeeCounter = baseEmployees.length + 1;

const generatedManagerEmployees: Employee[] = allHotelsWithoutManagers
  .filter((hotel) => !managedHotelIds.has(hotel.id))
  .map((hotel, index) => ({
    id: `emp${generatedEmployeeCounter++}`,
    fullName: `Manager ${index + 1} ${hotel.city}`,
    address: `${100 + index} Corporate Residence, ${hotel.city}, ${hotel.state}`,
    ssn: `${600 + index}-88-${(1000 + index).toString().slice(-4)}`,
    role: 'Hotel Manager',
    hotelId: hotel.id
  }));

export const employees: Employee[] = [...baseEmployees, ...generatedManagerEmployees];

const generatedManagerMap = new Map(generatedManagerEmployees.map((employee) => [employee.hotelId, employee.id]));

export const hotels: Hotel[] = allHotelsWithoutManagers.map((hotel) => ({
  ...hotel,
  managerId: hotel.managerId ?? generatedManagerMap.get(hotel.id)
}));

export const rooms: Room[] = [...baseRooms, ...generatedRooms];

// Bookings
export const bookings: Booking[] = [
  {
    id: 'book1',
    customerId: 'cust1',
    roomId: 'room1',
    startDate: '2026-04-15',
    endDate: '2026-04-18',
    status: 'Confirmed',
    registrationDate: '2026-03-20'
  },
  {
    id: 'book2',
    customerId: 'cust2',
    roomId: 'room3',
    startDate: '2026-04-10',
    endDate: '2026-04-14',
    status: 'Pending',
    registrationDate: '2026-03-28'
  },
  {
    id: 'book3',
    customerId: 'cust3',
    roomId: 'room5',
    startDate: '2026-04-20',
    endDate: '2026-04-25',
    status: 'Confirmed',
    registrationDate: '2026-03-15'
  },
  {
    id: 'book4',
    customerId: 'cust4',
    roomId: 'room7',
    startDate: '2026-04-05',
    endDate: '2026-04-07',
    status: 'Converted',
    registrationDate: '2026-03-25'
  }
];

// Rentings
export const rentings: Renting[] = [
  {
    id: 'rent1',
    customerId: 'cust4',
    roomId: 'room11',
    employeeId: 'emp1',
    startDate: '2026-03-30',
    endDate: '2026-04-05',
    checkInDate: '2026-03-30',
    bookingId: 'book4'
  },
  {
    id: 'rent2',
    customerId: 'cust5',
    roomId: 'room12',
    employeeId: 'emp2',
    startDate: '2026-03-28',
    endDate: '2026-04-02',
    checkInDate: '2026-03-28'
  }
];

// Payments
export const payments: Payment[] = [
  {
    id: 'pay1',
    rentingId: 'rent1',
    amount: 2520,
    paymentMethod: 'Credit Card',
    paymentDate: '2026-03-30'
  },
  {
    id: 'pay2',
    rentingId: 'rent2',
    amount: 1950,
    paymentMethod: 'Cash',
    paymentDate: '2026-03-28'
  }
];

// Helper functions
export const getHotelById = (id: string) => hotels.find(h => h.id === id);
export const getHotelChainById = (id: string) => hotelChains.find(c => c.id === id);
export const getRoomById = (id: string) => rooms.find(r => r.id === id);
export const getCustomerById = (id: string) => customers.find(c => c.id === id);
export const getEmployeeById = (id: string) => employees.find(e => e.id === id);
export const getBookingById = (id: string) => bookings.find(b => b.id === id);
export const getRentingById = (id: string) => rentings.find(r => r.id === id);

export const getHotelsByChain = (chainId: string) => hotels.filter(h => h.chainId === chainId);
export const getRoomsByHotel = (hotelId: string) => rooms.filter(r => r.hotelId === hotelId);
export const getBookingsByCustomer = (customerId: string) => bookings.filter(b => b.customerId === customerId);
