import React, { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { MapPin, Star, Users, Check, X, AlertCircle, ChevronLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { BookingDateField } from '../components/BookingDateField';
import { useHotelStore } from '../data/hotelStore';
import { ImageWithFallback } from '../components/media/ImageWithFallback';

export const RoomDetailsPage: React.FC = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { rooms, hotels, hotelChains, isRoomAvailableForStay, getUnavailableDatesForRoom } = useHotelStore();
  const [bookingDates, setBookingDates] = useState({
    startDate: searchParams.get('startDate') ?? '',
    endDate: searchParams.get('endDate') ?? ''
  });
  const today = new Date().toISOString().split('T')[0];
  const maxCheckInDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];
  
  const room = rooms.find((entry) => entry.id === (roomId || '')) ?? null;
  const hotel = room ? hotels.find((entry) => entry.id === room.hotelId) ?? null : null;
  const chain = hotel ? hotelChains.find((entry) => entry.id === hotel.chainId) ?? null : null;

  const updateBookingDate = (key: 'startDate' | 'endDate', value: string) => {
    setBookingDates((prev) => {
      const normalizedValue =
        key === 'startDate' && value
          ? value < today
            ? today
            : value > maxCheckInDate
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
  
  if (!room || !hotel) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="mb-4">Room not found</h2>
            <Button onClick={() => navigate('/search')}>Back to Search</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const nights = bookingDates.startDate && bookingDates.endDate
    ? Math.max(
        0,
        Math.ceil(
          (new Date(bookingDates.endDate).getTime() - new Date(bookingDates.startDate).getTime()) /
          (1000 * 60 * 60 * 24)
        )
      )
    : 0;
  const subtotal = room.price * nights;
  const taxes = Math.round(subtotal * 0.15);
  const total = subtotal + taxes;

  const bookingParams = new URLSearchParams();
  if (bookingDates.startDate) bookingParams.set('startDate', bookingDates.startDate);
  if (bookingDates.endDate) bookingParams.set('endDate', bookingDates.endDate);
  const bookingTarget = bookingParams.toString()
    ? `/booking/${room.id}?${bookingParams.toString()}`
    : `/booking/${room.id}`;
  const isSelectedStayAvailable =
    !bookingDates.startDate ||
    !bookingDates.endDate ||
    isRoomAvailableForStay(room.id, bookingDates.startDate, bookingDates.endDate);
  const hasPastCheckInDate = Boolean(bookingDates.startDate && bookingDates.startDate < today);
  const exceedsAdvanceBookingWindow = Boolean(bookingDates.startDate && bookingDates.startDate > maxCheckInDate);
  const exceedsMaximumStay = nights > 30;
  const unavailableDates = getUnavailableDatesForRoom(room.id);
  const searchBackTarget = searchParams.toString()
    ? `/search?${searchParams.toString()}`
    : '/search';
  
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(searchBackTarget)}
          className="mb-6"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Search
        </Button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="mb-6 rounded-xl overflow-hidden h-96 bg-muted">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800"
                alt="Hotel room"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Room Info */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{hotel.name} - Room {room.roomNumber}</CardTitle>
                    <div className="flex items-center gap-2 text-muted-foreground mt-2">
                      <MapPin className="w-4 h-4" />
                      <span>{hotel.address}, {hotel.city}, {hotel.state}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1">
                        {[...Array(hotel.category)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">{chain?.name}</span>
                    </div>
                  </div>
                  <Badge variant={room.status === 'Available' ? 'success' : 'warning'}>
                    {room.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Capacity</div>
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      <span className="text-lg">{room.capacity} Guests</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">View Type</div>
                    <div className="text-lg">{room.viewType}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Extendable</div>
                    <div className="flex items-center gap-2">
                      {room.extendable ? (
                        <>
                          <Check className="w-5 h-5 text-green-600" />
                          <span>Yes</span>
                        </>
                      ) : (
                        <>
                          <X className="w-5 h-5 text-red-600" />
                          <span>No</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Room Number</div>
                    <div className="text-lg">{room.roomNumber}</div>
                  </div>
                </div>
                
                {room.problems && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-yellow-800 mb-1">Room Issues</div>
                        <div className="text-sm text-yellow-700">{room.problems}</div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div>
                  <h4 className="mb-3">Amenities</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {room.amenities.map((amenity, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Hotel Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>About {hotel.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hotel Chain</span>
                    <span>{chain?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Rooms</span>
                    <span>{hotel.numberOfRooms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Emails</span>
                    <span className="text-right">{hotel.emails.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phones</span>
                    <span className="text-right">{hotel.phones.join(', ')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="text-4xl font-semibold text-primary mb-1">
                    ${room.price}
                  </div>
                  <div className="text-muted-foreground">per night</div>
                </div>
                
                <div className="space-y-4 mb-6">
                  <BookingDateField
                    label="Check-in Date"
                    value={bookingDates.startDate}
                    onChange={(value) => updateBookingDate('startDate', value)}
                    disabledDates={unavailableDates}
                    minDate={new Date(`${today}T00:00:00`)}
                    maxDate={new Date(`${maxCheckInDate}T00:00:00`)}
                  />
                  <BookingDateField
                    label="Check-out Date"
                    value={bookingDates.endDate}
                    onChange={(value) => updateBookingDate('endDate', value)}
                    disabledDates={unavailableDates}
                    minDate={bookingDates.startDate ? new Date(`${bookingDates.startDate}T00:00:00`) : undefined}
                  />
                </div>

                {exceedsAdvanceBookingWindow && bookingDates.startDate && (
                  <div className="flex items-start gap-3 p-4 mb-6 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>Check-in date cannot be more than 1 year in advance.</span>
                  </div>
                )}

                {hasPastCheckInDate && bookingDates.startDate && (
                  <div className="flex items-start gap-3 p-4 mb-6 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>Check-in date cannot be in the past.</span>
                  </div>
                )}

                {!hasPastCheckInDate && !exceedsAdvanceBookingWindow && !isSelectedStayAvailable && bookingDates.startDate && bookingDates.endDate && (
                  <div className="flex items-start gap-3 p-4 mb-6 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>Those dates overlap an existing booking or renting for this room.</span>
                  </div>
                )}

                {exceedsMaximumStay && bookingDates.startDate && bookingDates.endDate && (
                  <div className="flex items-start gap-3 p-4 mb-6 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>Maximum stay is 30 days per booking.</span>
                  </div>
                )}

                {unavailableDates.length > 0 && (
                  <p className="mb-6 text-sm text-muted-foreground">
                    Greyed dates are already booked or rented.
                  </p>
                )}
                
                <div className="border-t border-border pt-4 mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">{nights || 0} nights</span>
                    <span>${subtotal}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Taxes & Fees</span>
                    <span>${taxes}</span>
                  </div>
                  <div className="border-t border-border pt-2 mt-2">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span className="text-primary">${total}</span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="w-full mb-3"
                  onClick={() => navigate(bookingTarget)}
                  disabled={room.status !== 'Available' || hasPastCheckInDate || exceedsAdvanceBookingWindow || !isSelectedStayAvailable || exceedsMaximumStay}
                >
                  Book This Room
                </Button>
                <Button 
                  variant="secondary" 
                  className="w-full"
                  onClick={() => navigate(bookingTarget)}
                  disabled={room.status !== 'Available' || hasPastCheckInDate || exceedsAdvanceBookingWindow || !isSelectedStayAvailable || exceedsMaximumStay}
                >
                  Rent Now
                </Button>
                
                <div className="mt-6 text-sm text-muted-foreground text-center">
                  <p>Free cancellation up to 24 hours before check-in</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
