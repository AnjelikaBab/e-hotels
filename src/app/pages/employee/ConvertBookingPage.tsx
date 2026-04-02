import React, { useState } from 'react';
import { Search, Check } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useHotelStore } from '../../data/hotelStore';
import { useEmployeeAuth } from '../../context/EmployeeAuthContext';

export const ConvertBookingPage: React.FC = () => {
  const { bookings, rooms, hotels, customers, convertBookingToRenting } = useHotelStore();
  const { currentEmployee } = useEmployeeAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const confirmedBookings = bookings.filter((booking) => {
    if (booking.status !== 'Confirmed') return false;
    if (!currentEmployee) return false;

    const room = rooms.find((entry) => entry.id === booking.roomId);
    return room?.hotelId === currentEmployee.hotelId;
  });
  
  const filteredBookings = confirmedBookings.filter(booking => {
    if (!searchTerm) return true;
    
    const customer = customers.find((entry) => entry.id === booking.customerId);
    const room = rooms.find((entry) => entry.id === booking.roomId);
    const hotel = room ? hotels.find((entry) => entry.id === room.hotelId) : null;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      booking.id.toLowerCase().includes(searchLower) ||
      customer?.fullName.toLowerCase().includes(searchLower) ||
      hotel?.name.toLowerCase().includes(searchLower) ||
      room?.roomNumber.toLowerCase().includes(searchLower)
    );
  });
  
  const booking = selectedBooking ? bookings.find((entry) => entry.id === selectedBooking) ?? null : null;
  const room = booking ? rooms.find((entry) => entry.id === booking.roomId) ?? null : null;
  const hotel = room ? hotels.find((entry) => entry.id === room.hotelId) ?? null : null;
  const customer = booking ? customers.find((entry) => entry.id === booking.customerId) ?? null : null;
  
  const handleConvert = () => {
    if (!selectedBooking || !currentEmployee) {
      return;
    }

    convertBookingToRenting(selectedBooking, currentEmployee.id);
    setShowConfirmModal(false);
    setShowSuccessModal(true);
    setSelectedBooking(null);
  };
  
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="mb-2">Convert Booking to Renting</h1>
        <p className="text-muted-foreground">
          Convert a confirmed booking into an active renting during check-in
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search Section */}
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Search Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search by booking ID, customer name, hotel, or room number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Booking Results */}
          <div className="space-y-4">
            {filteredBookings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground">No confirmed bookings found</p>
                </CardContent>
              </Card>
            ) : (
              filteredBookings.map(booking => {
                const room = rooms.find((entry) => entry.id === booking.roomId);
                const hotel = room ? hotels.find((entry) => entry.id === room.hotelId) : null;
                const customer = customers.find((entry) => entry.id === booking.customerId);
                
                if (!room || !hotel || !customer) return null;
                
                const isSelected = selectedBooking === booking.id;
                
                return (
                  <Card 
                    key={booking.id}
                    onClick={() => setSelectedBooking(booking.id)}
                    className={`cursor-pointer transition-all ${
                      isSelected ? 'ring-2 ring-accent shadow-lg' : 'hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="mb-1">{customer.fullName}</h4>
                            <p className="text-sm text-muted-foreground">
                              Booking ID: <span className="font-mono">{booking.id}</span>
                            </p>
                          </div>
                          <Badge variant="success">{booking.status}</Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-muted-foreground">Hotel: </span>
                            <span>{hotel.name}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Room: </span>
                            <span>#{room.roomNumber}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Check-in: </span>
                            <span>{booking.startDate}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Check-out: </span>
                            <span>{booking.endDate}</span>
                          </div>
                        </div>
                        
                        {isSelected && (
                          <div className="pt-3 border-t border-border">
                            <Badge variant="info" className="text-xs">
                              <Check className="w-3 h-3 mr-1" />
                              Selected for conversion
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
        
        {/* Conversion Panel */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Conversion Details</CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedBooking ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Select a booking to convert</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="mb-3">Booking Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Customer</span>
                        <span className="font-medium">{customer?.fullName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Hotel</span>
                        <span className="font-medium">{hotel?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Room</span>
                        <span className="font-medium">#{room?.roomNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Handled By</span>
                        <span className="font-medium">{currentEmployee?.fullName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Period</span>
                        <span className="font-medium">
                          {booking?.startDate} - {booking?.endDate}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                    This will create a new renting record and mark the booking as converted using the signed-in employee.
                  </div>
                  
                  <Button
                    className="w-full"
                    onClick={() => setShowConfirmModal(true)}
                    disabled={!currentEmployee}
                  >
                    Convert to Renting
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Conversion"
        size="sm"
      >
        <div className="space-y-4">
          <p>Are you sure you want to convert this booking to a renting?</p>
          
          <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Customer</span>
              <span>{customer?.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hotel</span>
              <span>{hotel?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Room</span>
              <span>#{room?.roomNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Employee</span>
              <span>{currentEmployee?.fullName}</span>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConvert}
              className="flex-1"
            >
              Confirm Conversion
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Conversion Successful"
        size="sm"
      >
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="mb-2">Renting Created Successfully</h3>
          <p className="text-muted-foreground mb-6">
            The booking has been converted to an active renting.
          </p>
          <Button onClick={() => setShowSuccessModal(false)}>
            Done
          </Button>
        </div>
      </Modal>
    </div>
  );
};
