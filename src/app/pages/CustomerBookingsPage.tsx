import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { AlertCircle, Calendar, MapPin, Search } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useHotelStore } from '../data/hotelStore';

type LookupMode = 'bookingId' | 'guestDetails';
type CustomerIdType = 'SSN' | 'SIN' | "Driver's License";

export const CustomerBookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { bookings, customers, rooms, hotels, cancelBooking } = useHotelStore();
  const [lookupMode, setLookupMode] = useState<LookupMode>('bookingId');
  const [bookingId, setBookingId] = useState('');
  const [lastName, setLastName] = useState('');
  const [idType, setIdType] = useState<CustomerIdType>('SSN');
  const [idNumber, setIdNumber] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [matchingBookingIds, setMatchingBookingIds] = useState<string[]>([]);
  const [lookupError, setLookupError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const matchingBookings = useMemo(
    () => matchingBookingIds
      .map((id) => bookings.find((booking) => booking.id === id) ?? null)
      .filter((booking): booking is NonNullable<typeof booking> => booking !== null),
    [matchingBookingIds]
  );

  const selectedBookingData = selectedBooking
    ? bookings.find((booking) => booking.id === selectedBooking) ?? null
    : null;

  const selectedRoom = selectedBookingData ? rooms.find((entry) => entry.id === selectedBookingData.roomId) ?? null : null;
  const selectedHotel = selectedRoom ? hotels.find((entry) => entry.id === selectedRoom.hotelId) ?? null : null;
  const selectedCustomer = selectedBookingData ? customers.find((entry) => entry.id === selectedBookingData.customerId) ?? null : null;

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Converted':
        return 'info';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const resetResults = () => {
    setHasSearched(false);
    setMatchingBookingIds([]);
    setLookupError('');
    setSelectedBooking(null);
    setShowCancelModal(false);
  };

  const handleModeChange = (mode: LookupMode) => {
    setLookupMode(mode);
    setBookingId('');
    setLastName('');
    setIdType('SSN');
    setIdNumber('');
    resetResults();
  };

  const handleLookup = () => {
    setHasSearched(true);
    setLookupError('');
    setSelectedBooking(null);

    if (lookupMode === 'bookingId') {
      const normalizedBookingId = bookingId.trim().toLowerCase();
      if (!normalizedBookingId) {
        setMatchingBookingIds([]);
        setLookupError('Enter a booking ID.');
        return;
      }

      const match = bookings.find((booking) => booking.id.toLowerCase() === normalizedBookingId);
      setMatchingBookingIds(match ? [match.id] : []);

      if (!match) {
        setLookupError('No booking matched that booking ID.');
      }

      return;
    }

    const normalizedLastName = lastName.trim().toLowerCase();
    const normalizedIdNumber = idNumber.trim().toLowerCase();
    if (!normalizedLastName || !normalizedIdNumber) {
      setMatchingBookingIds([]);
      setLookupError('Enter last name, ID type, and ID number.');
      return;
    }

    const matches = bookings.filter((booking) => {
      const customer = customers.find((entry) => entry.id === booking.customerId);
      if (!customer) {
        return false;
      }

      const customerLastName = customer.fullName.trim().split(/\s+/).at(-1)?.toLowerCase() ?? '';
      return (
        customerLastName === normalizedLastName &&
        customer.idType === idType &&
        customer.idNumber.trim().toLowerCase() === normalizedIdNumber
      );
    });

    setMatchingBookingIds(matches.map((booking) => booking.id));

    if (matches.length === 0) {
      setLookupError('No booking matched that last name and ID information.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="mb-2">My Bookings</h1>
          <p className="text-muted-foreground">
            Look up your reservation by booking ID, or by last name with matching ID information.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Find a Booking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row gap-3">
              <Button
                variant={lookupMode === 'bookingId' ? 'primary' : 'outline'}
                onClick={() => handleModeChange('bookingId')}
              >
                Search by Booking ID
              </Button>
              <Button
                variant={lookupMode === 'guestDetails' ? 'primary' : 'outline'}
                onClick={() => handleModeChange('guestDetails')}
              >
                Search by Last Name + ID
              </Button>
            </div>

            {lookupMode === 'bookingId' ? (
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
                <Input
                  label="Booking ID"
                  placeholder="e.g. book1"
                  value={bookingId}
                  onChange={(event) => setBookingId(event.target.value)}
                />
                <div className="flex items-end">
                  <Button className="w-full md:w-auto" onClick={handleLookup}>
                    <Search className="w-4 h-4 mr-2" />
                    Find Booking
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  label="Last Name"
                  placeholder="e.g. Smith"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                />
                <div>
                  <label className="block mb-2 text-sm">ID Type</label>
                  <select
                    value={idType}
                    onChange={(event) => setIdType(event.target.value as CustomerIdType)}
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-lg"
                  >
                    <option value="SSN">SSN</option>
                    <option value="SIN">SIN</option>
                    <option value="Driver's License">Driver's License</option>
                  </select>
                </div>
                <Input
                  label={`${idType} Number`}
                  placeholder={idType === "Driver's License" ? 'Enter license number' : `Enter ${idType}`}
                  value={idNumber}
                  onChange={(event) => setIdNumber(event.target.value)}
                />
                <div className="flex items-end">
                  <Button className="w-full md:w-auto" onClick={handleLookup}>
                    <Search className="w-4 h-4 mr-2" />
                    Find Booking
                  </Button>
                </div>
              </div>
            )}

            {lookupError && (
              <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{lookupError}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {!hasSearched ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="mb-2">No booking loaded yet</h3>
              <p className="text-muted-foreground">
                Enter your booking details above to retrieve your reservation.
              </p>
            </CardContent>
          </Card>
        ) : matchingBookings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="mb-2">No matching booking found</h3>
              <p className="text-muted-foreground mb-6">
                Check your booking ID, or verify the last name and ID information exactly as entered when booking.
              </p>
              <Button onClick={() => navigate('/search')}>
                Search Rooms
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {matchingBookings.map((booking) => {
              const room = rooms.find((entry) => entry.id === booking.roomId);
              const hotel = room ? hotels.find((entry) => entry.id === room.hotelId) : null;
              const customer = customers.find((entry) => entry.id === booking.customerId);

              if (!room || !hotel || !customer) return null;

              return (
                <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="mb-1">{hotel.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <MapPin className="w-4 h-4" />
                            <span>{hotel.city}, {hotel.state}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Guest: {customer.fullName}
                          </div>
                        </div>
                        <Badge variant={getStatusVariant(booking.status)}>
                          {booking.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                        <div>
                          <div className="text-muted-foreground mb-1">Check-in</div>
                          <div>{booking.startDate}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-1">Check-out</div>
                          <div>{booking.endDate}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-1">Room</div>
                          <div>#{room.roomNumber}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-1">Booking ID</div>
                          <div className="font-mono text-xs">{booking.id}</div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button size="sm" onClick={() => setSelectedBooking(booking.id)}>
                          View Details
                        </Button>
                        {booking.status !== 'Converted' && booking.status !== 'Cancelled' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedBooking(booking.id);
                              setShowCancelModal(true);
                            }}
                          >
                            Cancel Booking
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        isOpen={selectedBookingData !== null && !showCancelModal}
        onClose={() => setSelectedBooking(null)}
        title="Booking Details"
        size="md"
      >
        {selectedBookingData && selectedRoom && selectedHotel && selectedCustomer && (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium">{selectedHotel.name}</div>
                <div className="text-sm text-muted-foreground">
                  {selectedHotel.address}, {selectedHotel.city}, {selectedHotel.state}
                </div>
              </div>
              <Badge variant={getStatusVariant(selectedBookingData.status)}>
                {selectedBookingData.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground mb-1">Guest</div>
                <div>{selectedCustomer.fullName}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Booking ID</div>
                <div className="font-mono">{selectedBookingData.id}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Check-in</div>
                <div>{selectedBookingData.startDate}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Check-out</div>
                <div>{selectedBookingData.endDate}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Room</div>
                <div>#{selectedRoom.roomNumber}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Registered</div>
                <div>{selectedBookingData.registrationDate}</div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setSelectedBooking(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Booking"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              Are you sure you want to cancel this booking? This action cannot be undone.
            </div>
          </div>

          {selectedHotel && selectedBookingData && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm font-medium mb-2">{selectedHotel.name}</div>
              <div className="text-sm text-muted-foreground">
                {selectedBookingData.startDate} - {selectedBookingData.endDate}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowCancelModal(false)}
              className="flex-1"
            >
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (selectedBookingData) {
                  await cancelBooking(selectedBookingData.id);
                }
                setShowCancelModal(false);
                setSelectedBooking(null);
              }}
              className="flex-1"
            >
              Cancel Booking
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
