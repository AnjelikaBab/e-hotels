import React, { useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useHotelStore } from '../../data/hotelStore';
import type { Customer } from '../../data/mockData';
import { useEmployeeAuth } from '../../context/EmployeeAuthContext';

export const DirectRentingPage: React.FC = () => {
  const { customers, hotels, searchAvailableRooms, createDirectRenting, upsertCustomer, rooms } = useHotelStore();
  const { currentEmployee } = useEmployeeAuth();
  const today = new Date().toISOString().split('T')[0];
  const maxCheckInDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];
  const [step, setStep] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    fullName: '',
    address: '',
    idType: 'SSN'
  });
  
  const availableRooms = searchAvailableRooms({ startDate, endDate, minPrice: 0, maxPrice: 1000 }).filter(
    (room) => room.hotelId === currentEmployee?.hotelId
  );
  
  const room = selectedRoom ? rooms.find((entry) => entry.id === selectedRoom) ?? null : null;
  const hotel = room ? hotels.find((entry) => entry.id === room.hotelId) ?? null : null;
  const customer = customers.find(c => c.id === selectedCustomer);
  
  const handleCreateRenting = () => {
    if (!selectedCustomer || !selectedRoom || !currentEmployee || !startDate || !endDate || startDate < today || startDate > maxCheckInDate) {
      return;
    }

    createDirectRenting({
      customerId: selectedCustomer,
      roomId: selectedRoom,
      employeeId: currentEmployee.id,
      startDate,
      endDate
    });
    setShowSuccessModal(true);
    // Reset form
    setStep(1);
    setStartDate('');
    setEndDate('');
    setSelectedRoom(null);
    setSelectedCustomer('');
  };
  
  const handleCreateCustomer = () => {
    const createdCustomer = upsertCustomer({
      fullName: newCustomer.fullName,
      address: newCustomer.address,
      idType: newCustomer.idType as Customer['idType'],
      idNumber: `${newCustomer.idType}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
    });
    setSelectedCustomer(createdCustomer.id);
    setShowNewCustomerModal(false);
    setNewCustomer({ fullName: '', address: '', idType: 'SSN' });
  };
  
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="mb-2">Direct Renting / Walk-In Customer</h1>
        <p className="text-muted-foreground">
          Create a renting for walk-in customers at your assigned hotel without prior booking
        </p>
      </div>
      
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-4">
          {['Select Dates', 'Choose Room', 'Select Customer', 'Confirm'].map((label, idx) => (
            <div key={idx} className="flex items-center">
              <div className={`flex items-center gap-2 ${idx + 1 === step ? 'text-accent' : idx + 1 < step ? 'text-green-600' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  idx + 1 < step ? 'bg-green-600 border-green-600' :
                  idx + 1 === step ? 'border-accent' : 'border-border'
                }`}>
                  {idx + 1 < step ? <Check className="w-4 h-4 text-white" /> : idx + 1}
                </div>
                <span className="text-sm hidden md:inline">{label}</span>
              </div>
              {idx < 3 && <div className="w-12 h-0.5 bg-border mx-2" />}
            </div>
          ))}
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto">
        {/* Step 1: Select Dates */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Select Stay Dates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Check-in Date"
                  type="date"
                  value={startDate}
                  min={today}
                  max={maxCheckInDate}
                  onChange={(e) => {
                    const nextStartDate = e.target.value;
                    setStartDate(nextStartDate);

                    if (endDate && nextStartDate && endDate < nextStartDate) {
                      setEndDate('');
                    }
                  }}
                />
                <Input
                  label="Check-out Date"
                  type="date"
                  value={endDate}
                  min={startDate || today}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <Button
                className="w-full mt-6"
                onClick={() => setStep(2)}
                disabled={!startDate || !endDate || startDate < today || startDate > maxCheckInDate || endDate < startDate}
              >
                Continue
              </Button>
            </CardContent>
          </Card>
        )}
        
        {/* Step 2: Choose Room */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Available Rooms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                {availableRooms.map(room => {
                  const hotel = hotels.find((entry) => entry.id === room.hotelId);
                  if (!hotel) return null;
                  
                  const isSelected = selectedRoom === room.id;
                  
                  return (
                    <div
                      key={room.id}
                      onClick={() => setSelectedRoom(room.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        isSelected ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="mb-1">{hotel.name}</h4>
                          <p className="text-sm text-muted-foreground">Room {room.roomNumber}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-semibold text-primary">${room.price}</div>
                          <div className="text-xs text-muted-foreground">per night</div>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="default" className="text-xs">Capacity: {room.capacity}</Badge>
                        <Badge variant="default" className="text-xs">{room.viewType}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setStep(3)} disabled={!selectedRoom} className="flex-1">
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Step 3: Select Customer */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Select Customer</CardTitle>
                <Button
                  size="sm"
                  onClick={() => setShowNewCustomerModal(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Customer
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Select
                label="Customer"
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                options={[
                  { value: '', label: 'Select a customer' },
                  ...customers.map(c => ({
                    value: c.id,
                    label: `${c.fullName} - ${c.address}`
                  }))
                ]}
              />
              
              {selectedCustomer && customer && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="mb-3">Customer Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name</span>
                      <span>{customer.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Address</span>
                      <span>{customer.address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ID Type</span>
                      <span>{customer.idType}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setStep(4)} disabled={!selectedCustomer} className="flex-1">
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Step 4: Confirm */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Confirm Renting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="mb-3">Renting Summary</h4>
                  <div className="space-y-2 text-sm">
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
                      <span className="text-muted-foreground">Check-in</span>
                      <span>{startDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Check-out</span>
                      <span>{endDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Employee</span>
                      <span>{currentEmployee?.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Role</span>
                      <span>{currentEmployee?.role}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                  This renting will be created by the signed-in employee for rooms in their assigned hotel only.
                </div>
                
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={handleCreateRenting} className="flex-1">
                    Create Renting
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* New Customer Modal */}
      <Modal
        isOpen={showNewCustomerModal}
        onClose={() => setShowNewCustomerModal(false)}
        title="Register New Customer"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={newCustomer.fullName}
            onChange={(e) => setNewCustomer({...newCustomer, fullName: e.target.value})}
          />
          <Input
            label="Address"
            value={newCustomer.address}
            onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
          />
          <div>
            <label className="block mb-2">ID Type</label>
            <div className="space-y-2">
              {['SSN', 'SIN', "Driver's License"].map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="newCustomerIdType"
                    value={type}
                    checked={newCustomer.idType === type}
                    onChange={(e) => setNewCustomer({...newCustomer, idType: e.target.value})}
                    className="w-4 h-4"
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowNewCustomerModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleCreateCustomer} className="flex-1">
              Register Customer
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Renting Created"
        size="sm"
      >
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="mb-2">Renting Successfully Created</h3>
          <p className="text-muted-foreground mb-6">
            The walk-in renting has been recorded.
          </p>
          <Button onClick={() => setShowSuccessModal(false)}>
            Done
          </Button>
        </div>
      </Modal>
    </div>
  );
};
