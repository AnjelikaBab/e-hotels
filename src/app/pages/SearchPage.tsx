import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Search, MapPin, Star, Users } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useHotelStore } from '../data/hotelStore';

interface Filters {
  startDate: string;
  endDate: string;
  capacity: string;
  area: string;
  chain: string;
  category: string;
  minRooms: string;
  maxRooms: string;
  minPrice: number;
  maxPrice: number;
}

const DEFAULT_FILTERS: Filters = {
  startDate: '',
  endDate: '',
  capacity: '',
  area: '',
  chain: '',
  category: '',
  minRooms: '',
  maxRooms: '',
  minPrice: 0,
  maxPrice: 1000
};

const parseNumberParam = (value: string | null, fallback: number) => {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const filtersFromSearchParams = (searchParams: URLSearchParams): Filters => ({
  startDate: searchParams.get('startDate') ?? '',
  endDate: searchParams.get('endDate') ?? '',
  capacity: searchParams.get('capacity') ?? '',
  area: searchParams.get('area') ?? '',
  chain: searchParams.get('chain') ?? '',
  category: searchParams.get('category') ?? '',
  minRooms: searchParams.get('minRooms') ?? '',
  maxRooms: searchParams.get('maxRooms') ?? '',
  minPrice: parseNumberParam(searchParams.get('minPrice'), DEFAULT_FILTERS.minPrice),
  maxPrice: parseNumberParam(searchParams.get('maxPrice'), DEFAULT_FILTERS.maxPrice)
});

const buildSearchParams = (filters: Filters) => {
  const params = new URLSearchParams();

  if (filters.startDate) params.set('startDate', filters.startDate);
  if (filters.endDate) params.set('endDate', filters.endDate);
  if (filters.capacity) params.set('capacity', filters.capacity);
  if (filters.area) params.set('area', filters.area);
  if (filters.chain) params.set('chain', filters.chain);
  if (filters.category) params.set('category', filters.category);
  if (filters.minRooms) params.set('minRooms', filters.minRooms);
  if (filters.maxRooms) params.set('maxRooms', filters.maxRooms);
  if (filters.minPrice !== DEFAULT_FILTERS.minPrice) params.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice !== DEFAULT_FILTERS.maxPrice) params.set('maxPrice', String(filters.maxPrice));

  return params;
};

export const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<Filters>(() => filtersFromSearchParams(searchParams));
  const { hotelChains, hotels, searchAvailableRooms } = useHotelStore();
  const today = new Date().toISOString().split('T')[0];
  const maxCheckInDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];

  useEffect(() => {
    setFilters(filtersFromSearchParams(searchParams));
  }, [searchParams]);
  
  const updateFilter = (key: keyof Filters, value: string | number) => {
    setFilters((prev) => {
      const nextFilters = { ...prev, [key]: value };
      const normalizedValue =
        key === 'startDate' && typeof value === 'string'
          ? value < today
            ? today
            : value > maxCheckInDate
              ? maxCheckInDate
              : value
          : value;

      if (key === 'startDate' && typeof normalizedValue === 'string') {
        nextFilters.startDate = normalizedValue;

        if (nextFilters.endDate && nextFilters.endDate < normalizedValue) {
          nextFilters.endDate = '';
        }
      }

      setSearchParams(buildSearchParams(nextFilters), { replace: true });
      return nextFilters;
    });
  };
  
  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchParams(new URLSearchParams(), { replace: true });
  };
  
  const activeFilters = useMemo(() => {
    const active: string[] = [];
    if (filters.startDate) active.push(`Check-in: ${filters.startDate}`);
    if (filters.endDate) active.push(`Check-out: ${filters.endDate}`);
    if (filters.capacity) active.push(`${filters.capacity} Guests`);
    if (filters.area) active.push(filters.area);
    if (filters.chain) {
      const chain = hotelChains.find(c => c.id === filters.chain);
      if (chain) active.push(chain.name);
    }
    if (filters.category) active.push(`${filters.category}-Star`);
    if (filters.minRooms || filters.maxRooms) {
      active.push(`Hotel Size: ${filters.minRooms || '0'}-${filters.maxRooms || '∞'}`);
    }
    if (filters.minPrice > 0 || filters.maxPrice < 1000) {
      active.push(`$${filters.minPrice}-$${filters.maxPrice}`);
    }
    return active;
  }, [filters]);
  
  const filteredRooms = useMemo(() => {
    return searchAvailableRooms(filters);
  }, [filters, searchAvailableRooms]);
  
  const uniqueCities = Array.from(new Set(hotels.map(h => h.city)));
  const stayParams = new URLSearchParams();
  if (filters.startDate) stayParams.set('startDate', filters.startDate);
  if (filters.endDate) stayParams.set('endDate', filters.endDate);
  const stayQuery = stayParams.toString();
  
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="mb-2">Search Available Rooms</h1>
          <p className="text-muted-foreground">
            Find your perfect room from {filteredRooms.length} available options
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Filters</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearFilters}
                  >
                    Clear All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Dates */}
                <div>
                  <label className="block mb-2 text-sm">Check-in Date</label>
                  <input
                    type="date"
                    value={filters.startDate}
                    min={today}
                    max={maxCheckInDate}
                    onChange={(e) => updateFilter('startDate', e.target.value)}
                    className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm"
                  />
                </div>
                
                <div>
                  <label className="block mb-2 text-sm">Check-out Date</label>
                  <input
                    type="date"
                    value={filters.endDate}
                    min={filters.startDate || today}
                    onChange={(e) => updateFilter('endDate', e.target.value)}
                    className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm"
                  />
                </div>
                
                {/* Capacity */}
                <div>
                  <label className="block mb-2 text-sm">Room Capacity</label>
                  <select
                    value={filters.capacity}
                    onChange={(e) => updateFilter('capacity', e.target.value)}
                    className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm"
                  >
                    <option value="">Any</option>
                    <option value="1">1 Guest</option>
                    <option value="2">2 Guests</option>
                    <option value="3">3 Guests</option>
                    <option value="4">4+ Guests</option>
                  </select>
                </div>
                
                {/* Area */}
                <div>
                  <label className="block mb-2 text-sm">Location</label>
                  <select
                    value={filters.area}
                    onChange={(e) => updateFilter('area', e.target.value)}
                    className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm"
                  >
                    <option value="">All Cities</option>
                    {uniqueCities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                
                {/* Hotel Chain */}
                <div>
                  <label className="block mb-2 text-sm">Hotel Chain</label>
                  <select
                    value={filters.chain}
                    onChange={(e) => updateFilter('chain', e.target.value)}
                    className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm"
                  >
                    <option value="">All Chains</option>
                    {hotelChains.map(chain => (
                      <option key={chain.id} value={chain.id}>{chain.name}</option>
                    ))}
                  </select>
                </div>
                
                {/* Category */}
                <div>
                  <label className="block mb-2 text-sm">Hotel Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => updateFilter('category', e.target.value)}
                    className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm"
                  >
                    <option value="">All Categories</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </div>
                
                {/* Hotel Size */}
                <div>
                  <label className="block mb-2 text-sm">Hotel Size (Rooms)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minRooms}
                      onChange={(e) => updateFilter('minRooms', e.target.value)}
                      className="px-3 py-2 bg-input-background border border-border rounded-lg text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxRooms}
                      onChange={(e) => updateFilter('maxRooms', e.target.value)}
                      className="px-3 py-2 bg-input-background border border-border rounded-lg text-sm"
                    />
                  </div>
                </div>
                
                {/* Price Range */}
                <div>
                  <label className="block mb-2 text-sm">
                    Price Range: ${filters.minPrice} - ${filters.maxPrice}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="50"
                    value={filters.maxPrice}
                    onChange={(e) => updateFilter('maxPrice', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Results */}
          <div className="lg:col-span-3">
            {/* Active Filters */}
            {activeFilters.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {activeFilters.map((filter, idx) => (
                  <Badge key={idx} variant="info" className="text-sm">
                    {filter}
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Room Results */}
            <div className="space-y-4">
              {filteredRooms.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="mb-2">No rooms found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your filters to see more results
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredRooms.map(room => {
                  const hotel = hotels.find((entry) => entry.id === room.hotelId);
                  const chain = hotel ? hotelChains.find((entry) => entry.id === hotel.chainId) : null;
                  
                  if (!hotel) return null;
                  
                  return (
                    <Card key={room.id} className="hover:shadow-lg transition-shadow">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="mb-1">{hotel.name}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                <MapPin className="w-4 h-4" />
                                <span>{hotel.address}, {hotel.city}, {hotel.state}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                  {[...Array(hotel.category)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                                  ))}
                                </div>
                                <span className="text-sm text-muted-foreground">{chain?.name}</span>
                              </div>
                            </div>
                            <Badge variant="success">Available</Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-sm">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              <span>Capacity: {room.capacity} guests</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">Room: </span>
                              <span>{room.roomNumber}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">View: </span>
                              <span>{room.viewType}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">Extendable: </span>
                              <span>{room.extendable ? 'Yes' : 'No'}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            {room.amenities.slice(0, 5).map((amenity, idx) => (
                              <Badge key={idx} variant="default" className="text-xs">
                                {amenity}
                              </Badge>
                            ))}
                            {room.amenities.length > 5 && (
                              <Badge variant="default" className="text-xs">
                                +{room.amenities.length - 5} more
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col justify-between border-l border-border pl-6">
                          <div>
                            <div className="text-3xl font-semibold text-primary mb-1">
                              ${room.price}
                            </div>
                            <div className="text-sm text-muted-foreground mb-4">per night</div>
                          </div>
                          
                          <div className="space-y-2">
                            <Button 
                              className="w-full"
                              onClick={() => navigate(stayQuery ? `/room/${room.id}?${stayQuery}` : `/room/${room.id}`)}
                            >
                              View Details
                            </Button>
                            <Button 
                              variant="secondary" 
                              className="w-full"
                              onClick={() => navigate(stayQuery ? `/booking/${room.id}?${stayQuery}` : `/booking/${room.id}`)}
                            >
                              Book Room
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
