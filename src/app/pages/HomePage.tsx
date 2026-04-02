import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, Calendar, Shield, Phone } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useHotelStore } from '../data/hotelStore';
import { ImageWithFallback } from '../components/media/ImageWithFallback';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { hotelChains, hotels } = useHotelStore();
  const today = new Date().toISOString().split('T')[0];
  const maxCheckInDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];
  const [quickSearch, setQuickSearch] = useState({
    startDate: '',
    endDate: '',
    capacity: '',
    area: ''
  });
  const uniqueCities = Array.from(new Set(hotels.map((hotel) => hotel.city)));

  const updateQuickSearchDate = (key: 'startDate' | 'endDate', value: string) => {
    setQuickSearch((prev) => {
      const normalizedValue =
        key === 'startDate' && value
          ? value > maxCheckInDate
            ? maxCheckInDate
            : value
          : value;
      const next = { ...prev, [key]: normalizedValue };

      if (key === 'startDate' && next.endDate && normalizedValue && next.endDate < normalizedValue) {
        next.endDate = '';
      }

      return next;
    });
  };

  const navigateToSearch = (withFilters = false) => {
    if (!withFilters) {
      navigate('/search');
      return;
    }

    const params = new URLSearchParams();
    if (quickSearch.startDate) params.set('startDate', quickSearch.startDate);
    if (quickSearch.endDate) params.set('endDate', quickSearch.endDate);
    if (quickSearch.capacity) params.set('capacity', quickSearch.capacity);
    if (quickSearch.area) params.set('area', quickSearch.area);

    const query = params.toString();
    navigate(query ? `/search?${query}` : '/search');
  };
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[600px] overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1744782996368-dc5b7e697f4c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMGxvYmJ5JTIwaW50ZXJpb3J8ZW58MXx8fHwxNzc1MDM4NzU0fDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Luxury hotel lobby"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/60" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex flex-col justify-center">
          <h1 className="text-5xl font-bold text-white mb-4">
            Welcome to e-Hotels
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl">
            Experience luxury and comfort across North America's finest hotels. 
            Real-time availability. Instant bookings. Seamless service.
          </p>
          
          <div className="flex gap-4">
            <Button 
              size="lg" 
              onClick={() => navigateToSearch()}
            >
              <Search className="w-5 h-5 mr-2" />
              Search Rooms
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigateToSearch()}
              className="bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white/20 hover:text-white"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Book Now
            </Button>
          </div>
        </div>
      </div>
      
      {/* Quick Search Section */}
      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20">
        <Card className="bg-card shadow-xl">
          <h2 className="text-2xl mb-4">Quick Search</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm mb-2 text-muted-foreground">Check In</label>
              <input 
                type="date" 
                value={quickSearch.startDate}
                min={today}
                max={maxCheckInDate}
                onChange={(event) => updateQuickSearchDate('startDate', event.target.value)}
                className="w-full px-4 py-2 bg-input-background border border-border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm mb-2 text-muted-foreground">Check Out</label>
              <input 
                type="date" 
                value={quickSearch.endDate}
                min={quickSearch.startDate || today}
                onChange={(event) => updateQuickSearchDate('endDate', event.target.value)}
                className="w-full px-4 py-2 bg-input-background border border-border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm mb-2 text-muted-foreground">Guests</label>
              <select
                value={quickSearch.capacity}
                onChange={(event) => setQuickSearch((prev) => ({ ...prev, capacity: event.target.value }))}
                className="w-full px-4 py-2 bg-input-background border border-border rounded-lg"
              >
                <option value="">Any</option>
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="3">3 Guests</option>
                <option value="4">4+ Guests</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-2 text-muted-foreground">Location</label>
              <select
                value={quickSearch.area}
                onChange={(event) => setQuickSearch((prev) => ({ ...prev, area: event.target.value }))}
                className="w-full px-4 py-2 bg-input-background border border-border rounded-lg"
              >
                <option value="">All Cities</option>
                {uniqueCities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button 
                className="w-full" 
                onClick={() => navigateToSearch(true)}
              >
                Search
              </Button>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Hotel Chains Section */}
      <div className="bg-muted py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl mb-8 text-center">Our Partner Hotel Chains</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {hotelChains.map((chain) => (
              <Card key={chain.id} className="text-center hover:shadow-lg transition-shadow">
                <h4 className="mb-2">{chain.name}</h4>
                <p className="text-sm text-muted-foreground">{chain.phones.join(' | ')}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
      
      {/* Contact Footer */}
      <div className="bg-primary text-primary-foreground py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl mb-4">Contact Us</h3>
              <div className="flex items-center gap-2 mb-2">
                <Phone className="w-5 h-5" />
                <span>1-800-HOTEL-NA</span>
              </div>
              <p className="text-primary-foreground/80">Available 24/7</p>
            </div>
            
            <div>
              <h3 className="text-xl mb-4">Support</h3>
              <p className="text-primary-foreground/80 mb-2">help@ehotels.com</p>
              <p className="text-primary-foreground/80">customer.service@ehotels.com</p>
            </div>
            
            <div>
              <h3 className="text-xl mb-4">Trust & Safety</h3>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-accent" />
                <span>Verified Secure Platform</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
