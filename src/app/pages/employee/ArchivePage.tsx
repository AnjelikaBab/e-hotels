import React, { useState } from 'react';
import { Search, Calendar, Download } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { useHotelStore } from '../../data/hotelStore';

export const ArchivePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bookings' | 'rentings'>('bookings');
  const [searchTerm, setSearchTerm] = useState('');
  const { bookingArchives, rentingArchives } = useHotelStore();
  
  const filteredBookings = bookingArchives.filter(booking => {
    const search = searchTerm.toLowerCase();
    return (
      booking.bookingId.toLowerCase().includes(search) ||
      booking.customerName.toLowerCase().includes(search)
    );
  });
  
  const filteredRentings = rentingArchives.filter(renting => {
    const search = searchTerm.toLowerCase();
    return (
      renting.rentingId.toLowerCase().includes(search) ||
      renting.customerName.toLowerCase().includes(search)
    );
  });
  
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'success';
      case 'Pending': return 'warning';
      case 'Converted': return 'info';
      case 'Cancelled': return 'error';
      default: return 'default';
    }
  };
  
  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2">Archive & History</h1>
          <p className="text-muted-foreground">
            View historical records of bookings and rentings
          </p>
        </div>
        <Button size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export Archive
        </Button>
      </div>
      
      {/* Info Banner */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-blue-900 mb-1">Archive Integrity</h4>
            <p className="text-sm text-blue-800">
              Historical records are preserved permanently, even if related customers, 
              rooms, or hotels are deleted. This ensures complete audit trails and 
              regulatory compliance.
            </p>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="mb-6 border-b border-border">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'bookings' 
                ? 'border-accent text-accent' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Booking History
          </button>
          <button
            onClick={() => setActiveTab('rentings')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'rentings' 
                ? 'border-accent text-accent' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Renting History
          </button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{activeTab === 'bookings' ? 'Booking Archive' : 'Renting Archive'}</span>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeTab === 'bookings' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4">Booking ID</th>
                    <th className="text-left py-3 px-4">Customer</th>
                    <th className="text-left py-3 px-4">Hotel</th>
                    <th className="text-left py-3 px-4">Room</th>
                    <th className="text-left py-3 px-4">Dates</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-muted-foreground">
                        No booking records found
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map(booking => {
                      return (
                        <tr key={booking.id} className="border-b border-border hover:bg-muted/50">
                          <td className="py-3 px-4 font-mono text-sm">{booking.bookingId}</td>
                          <td className="py-3 px-4 font-medium">{booking.customerName}</td>
                          <td className="py-3 px-4 text-sm">{booking.hotelName}</td>
                          <td className="py-3 px-4 text-sm">#{booking.roomNumber}</td>
                          <td className="py-3 px-4 text-sm">
                            {booking.startDate} - {booking.endDate}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={getStatusVariant(booking.status)}>
                              {booking.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {booking.registrationDate}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4">Renting ID</th>
                    <th className="text-left py-3 px-4">Customer</th>
                    <th className="text-left py-3 px-4">Hotel</th>
                    <th className="text-left py-3 px-4">Room</th>
                    <th className="text-left py-3 px-4">Period</th>
                    <th className="text-left py-3 px-4">Check-in Date</th>
                    <th className="text-left py-3 px-4">From Booking</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRentings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-muted-foreground">
                        No renting records found
                      </td>
                    </tr>
                  ) : (
                    filteredRentings.map(renting => {
                      return (
                        <tr key={renting.id} className="border-b border-border hover:bg-muted/50">
                          <td className="py-3 px-4 font-mono text-sm">{renting.rentingId}</td>
                          <td className="py-3 px-4 font-medium">{renting.customerName}</td>
                          <td className="py-3 px-4 text-sm">{renting.hotelName}</td>
                          <td className="py-3 px-4 text-sm">#{renting.roomNumber}</td>
                          <td className="py-3 px-4 text-sm">
                            {renting.startDate} - {renting.endDate}
                          </td>
                          <td className="py-3 px-4 text-sm">{renting.checkInDate}</td>
                          <td className="py-3 px-4">
                            {renting.source === 'booking' ? (
                              <Badge variant="info">Yes</Badge>
                            ) : (
                              <Badge variant="default">Walk-in</Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h4 className="mb-2">Data Retention Policy</h4>
        <p className="text-sm text-muted-foreground">
          All historical records are retained indefinitely for audit and compliance purposes. 
          Records remain accessible even after related entities are modified or deleted, 
          ensuring complete traceability of all transactions.
        </p>
      </div>
    </div>
  );
};
