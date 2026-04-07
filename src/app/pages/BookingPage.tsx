import React, { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { AlertCircle, Check, ChevronLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { useHotelStore } from '../data/hotelStore';
import type { Customer } from '../data/mockData';

const steps = ['Customer Info', 'Stay Details', 'Review', 'Confirmation'];

export const BookingPage: React.FC = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { rooms, hotels, createBooking, isRoomAvailableForStay, getUnavailableDatesForRoom } = useHotelStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [bookingError, setBookingError] = useState('');
  const [createdBookingId, setCreatedBookingId] = useState('');
  const today = new Date().toISOString().split('T')[0];
  const maxCheckInDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];
  const [bookingData, setBookingData] = useState({
    fullName: '',
    address: '',
    idType: 'SSN',
    idNumber: '',
    startDate: searchParams.get('startDate') ?? '',
    endDate: searchParams.get('endDate') ?? ''
  });

  const updateBookingDate = (key: 'startDate' | 'endDate', value: string) => {
    setBookingData((prev) => {
      const normalizedValue =
        key === 'startDate' && value
          ? value < today
            ? today
            : value > maxCheckInDate
              ? maxCheckInDate
              : value
          : value;
      const next = { ...prev, [key]: normalizedValue };
      setBookingError('');

      if (key === 'startDate' && next.endDate && normalizedValue && next.endDate < normalizedValue) {
        next.endDate = '';
      }

      return next;
    });
  };
  
  const room = rooms.find((entry) => entry.id === (roomId || '')) ?? null;
  const hotel = room ? hotels.find((entry) => entry.id === room.hotelId) ?? null : null;
  
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
  
  const nextStep = () => {
    if (currentStep === 1) {
      if (
        !bookingData.startDate ||
        !bookingData.endDate ||
        bookingData.startDate < today ||
        bookingData.startDate > maxCheckInDate ||
        bookingData.endDate < bookingData.startDate
      ) {
        return;
      }

      if (nights > 30) {
        setBookingError('Maximum stay is 30 days per booking.');
        return;
      }

      if (!isRoomAvailableForStay(room.id, bookingData.startDate, bookingData.endDate)) {
        setBookingError('Those dates are no longer available for this room. Choose another stay.');
        return;
      }
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const confirmBooking = async () => {
    if (
      !bookingData.startDate ||
      !bookingData.endDate ||
      bookingData.startDate < today ||
      bookingData.startDate > maxCheckInDate ||
      bookingData.endDate < bookingData.startDate
    ) {
      return;
    }

    if (nights > 30) {
      setBookingError('Maximum stay is 30 days per booking.');
      setCurrentStep(1);
      return;
    }

    const createdBooking = await createBooking({
      roomId: room.id,
      customer: {
        fullName: bookingData.fullName,
        address: bookingData.address,
        idType: bookingData.idType as Customer['idType'],
        idNumber: bookingData.idNumber
      },
      startDate: bookingData.startDate,
      endDate: bookingData.endDate
    });

    if (!createdBooking) {
      setBookingError('This room was just booked for those dates. Please select a different stay.');
      setCurrentStep(1);
      return;
    }

    setCreatedBookingId(createdBooking.id);
    setCurrentStep(3);
  };
  
  const nights = bookingData.startDate && bookingData.endDate 
    ? Math.ceil((new Date(bookingData.endDate).getTime() - new Date(bookingData.startDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const subtotal = room.price * nights;
  const taxes = Math.round(subtotal * 0.15);
  const total = subtotal + taxes;
  const hasInvalidStayDates = Boolean(
    bookingData.startDate &&
    bookingData.endDate &&
    bookingData.endDate < bookingData.startDate
  );
  const hasPastCheckInDate = Boolean(bookingData.startDate && bookingData.startDate < today);
  const exceedsAdvanceBookingWindow = Boolean(bookingData.startDate && bookingData.startDate > maxCheckInDate);
  const roomParams = new URLSearchParams();
  if (bookingData.startDate) roomParams.set('startDate', bookingData.startDate);
  if (bookingData.endDate) roomParams.set('endDate', bookingData.endDate);
  const roomBackTarget = roomParams.toString()
    ? `/room/${roomId}?${roomParams.toString()}`
    : `/room/${roomId}`;
  const hasCustomerInfo = Boolean(
    bookingData.fullName.trim() &&
    bookingData.address.trim() &&
    bookingData.idNumber.trim()
  );
  const unavailableDates = getUnavailableDatesForRoom(room.id);
  
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(roomBackTarget)}
          className="mb-6"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Room Details
        </Button>
        
        <h1 className="mb-8">Complete Your Booking</h1>
        
        {/* Progress Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => (
              <div key={idx} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 mb-2 transition-colors ${
                    idx < currentStep 
                      ? 'bg-accent border-accent text-accent-foreground' 
                      : idx === currentStep
                      ? 'border-accent text-accent'
                      : 'border-border text-muted-foreground'
                  }`}>
                    {idx < currentStep ? <Check className="w-5 h-5" /> : idx + 1}
                  </div>
                  <div className={`text-sm ${idx === currentStep ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step}
                  </div>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`h-0.5 flex-1 ${idx < currentStep ? 'bg-accent' : 'bg-border'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Steps */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="pt-6">
                {/* Step 1: Customer Information */}
                {currentStep === 0 && (
                  <div className="space-y-4">
                    <h2 className="mb-6">Customer Information</h2>
                    
                    <Input
                      label="Full Name"
                      value={bookingData.fullName}
                      onChange={(e) => setBookingData({...bookingData, fullName: e.target.value})}
                      placeholder="John Smith"
                    />
                    
                    <Input
                      label="Address"
                      value={bookingData.address}
                      onChange={(e) => setBookingData({...bookingData, address: e.target.value})}
                      placeholder="123 Main Street, City, State, ZIP"
                    />
                    
                    <div>
                      <label className="block mb-2">ID Type</label>
                      <div className="space-y-2">
                        {['SSN', 'SIN', "Driver's License"].map((type) => (
                          <label key={type} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="idType"
                              value={type}
                              checked={bookingData.idType === type}
                              onChange={(e) => setBookingData({...bookingData, idType: e.target.value})}
                              className="w-4 h-4 text-accent"
                            />
                            <span>{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <Input
                      label={`${bookingData.idType} Number`}
                      value={bookingData.idNumber}
                      onChange={(e) => setBookingData({...bookingData, idNumber: e.target.value})}
                      placeholder={
                        bookingData.idType === "Driver's License"
                          ? 'Enter license number'
                          : `Enter ${bookingData.idType}`
                      }
                    />
                    
                    <div className="pt-6">
                      <Button onClick={nextStep} className="w-full" disabled={!hasCustomerInfo}>
                        Continue to Stay Details
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Step 2: Stay Details */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <h2 className="mb-6">Stay Details</h2>
                    
                    <Input
                      label="Check-in Date"
                      type="date"
                      value={bookingData.startDate}
                      min={today}
                      max={maxCheckInDate}
                      onChange={(e) => updateBookingDate('startDate', e.target.value)}
                    />
                    
                    <Input
                      label="Check-out Date"
                      type="date"
                      value={bookingData.endDate}
                      min={bookingData.startDate || today}
                      onChange={(e) => updateBookingDate('endDate', e.target.value)}
                    />

                    {exceedsAdvanceBookingWindow && (
                      <p className="text-sm text-destructive">
                        Check-in date cannot be more than 1 year in advance.
                      </p>
                    )}

                    {hasPastCheckInDate && (
                      <p className="text-sm text-destructive">
                        Check-in date cannot be in the past.
                      </p>
                    )}

                    {hasInvalidStayDates && (
                      <p className="text-sm text-destructive">
                        Check-out date must be on or after the check-in date.
                      </p>
                    )}

                    {nights > 30 && (
                      <p className="text-sm text-destructive">
                        Maximum stay is 30 days per booking.
                      </p>
                    )}

                    {bookingError && (
                      <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span>{bookingError}</span>
                      </div>
                    )}

                    {unavailableDates.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Greyed dates are already booked or rented for this room.
                      </p>
                    )}
                    
                    <div className="bg-muted rounded-lg p-4">
                      <div className="text-sm text-muted-foreground mb-1">Registration Date</div>
                      <div className="font-medium">{new Date().toLocaleDateString()}</div>
                    </div>
                    
                    <div className="pt-6 flex gap-3">
                      <Button variant="outline" onClick={prevStep} className="flex-1">
                        Back
                      </Button>
                      <Button onClick={nextStep} className="flex-1" disabled={!bookingData.startDate || !bookingData.endDate || hasPastCheckInDate || exceedsAdvanceBookingWindow || hasInvalidStayDates || nights > 30}>
                        Continue to Review
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Step 3: Review */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h2 className="mb-6">Review Your Booking</h2>

                    {bookingError && (
                      <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span>{bookingError}</span>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="mb-3">Guest Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Name</span>
                          <span>{bookingData.fullName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Address</span>
                          <span>{bookingData.address}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">ID Type</span>
                          <span>{bookingData.idType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{bookingData.idType}</span>
                          <span>{bookingData.idNumber}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="mb-3">Stay Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Hotel</span>
                          <span>{hotel.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Room</span>
                          <span>#{room.roomNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Check-in</span>
                          <span>{bookingData.startDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Check-out</span>
                          <span>{bookingData.endDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Nights</span>
                          <span>{nights}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-6 flex gap-3">
                      <Button variant="outline" onClick={prevStep} className="flex-1">
                        Back
                      </Button>
                      <Button onClick={confirmBooking} className="flex-1" disabled={!bookingData.startDate || !bookingData.endDate || hasPastCheckInDate || exceedsAdvanceBookingWindow || hasInvalidStayDates || nights > 30}>
                        Confirm Booking
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Step 4: Confirmation */}
                {currentStep === 3 && (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Check className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="mb-4">Booking Confirmed!</h2>
                    <p className="text-muted-foreground mb-2">
                      Your booking reference number is:
                    </p>
                    <div className="text-2xl font-semibold text-accent mb-8">
                      {createdBookingId}
                    </div>
                    <p className="text-muted-foreground mb-8">
                      A confirmation email has been sent to your registered email address.
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button onClick={() => navigate('/customer/bookings')}>
                        View My Bookings
                      </Button>
                      <Button variant="outline" onClick={() => navigate('/')}>
                        Back to Home
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Booking Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h4 className="mb-2">{hotel.name}</h4>
                  <p className="text-sm text-muted-foreground">Room {room.roomNumber}</p>
                </div>
                
                <div className="border-t border-border pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price per night</span>
                    <span>${room.price}</span>
                  </div>
                  {nights > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{nights} nights</span>
                        <span>${subtotal}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Taxes & fees</span>
                        <span>${taxes}</span>
                      </div>
                      <div className="border-t border-border pt-3">
                        <div className="flex justify-between">
                          <span className="font-semibold">Total</span>
                          <span className="font-semibold text-primary text-xl">${total}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
