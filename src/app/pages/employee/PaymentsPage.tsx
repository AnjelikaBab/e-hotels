import React, { useState } from 'react';
import { CreditCard, Check } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useHotelStore } from '../../data/hotelStore';

const getLocalDateString = () => {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - timezoneOffset).toISOString().split('T')[0];
};

export const PaymentsPage: React.FC = () => {
  const { payments, rentings, rooms, hotels, customers, recordPayment } = useHotelStore();
  const [selectedRenting, setSelectedRenting] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentDate, setPaymentDate] = useState(getLocalDateString());
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedPayment, setSubmittedPayment] = useState<{ amount: string; method: string } | null>(null);
  
  const activeRentings = rentings.filter(r => new Date(r.endDate) >= new Date());
  
  const renting = selectedRenting ? rentings.find((entry) => entry.id === selectedRenting) ?? null : null;
  const room = renting ? rooms.find((entry) => entry.id === renting.roomId) ?? null : null;
  const hotel = room ? hotels.find((entry) => entry.id === room.hotelId) ?? null : null;
  const customer = renting ? customers.find((entry) => entry.id === renting.customerId) ?? null : null;
  
  const calculateTotal = () => {
    if (!renting || !room) return 0;
    const nights = Math.ceil(
      (new Date(renting.endDate).getTime() - new Date(renting.startDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    return room.price * nights;
  };
  
  const handleSubmitPayment = () => {
    if (!selectedRenting || !paymentAmount) {
      return;
    }

    recordPayment({
      rentingId: selectedRenting,
      amount: Number.parseFloat(paymentAmount),
      paymentMethod: paymentMethod as 'Cash' | 'Credit Card' | 'Debit Card' | 'Wire Transfer',
      paymentDate
    });
    setSubmittedPayment({
      amount: paymentAmount,
      method: paymentMethod
    });
    setShowSuccessModal(true);
    setSelectedRenting('');
    setPaymentAmount('');
    setPaymentMethod('Cash');
    setPaymentDate(getLocalDateString());
  };
  
  return (
    <div className="p-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="mb-2">Payment Entry</h1>
        <p className="text-muted-foreground">
          Record payments for active rentings
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>New Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Select
                label="Select Renting"
                value={selectedRenting}
                onChange={(e) => {
                  setSelectedRenting(e.target.value);
                  const renting = rentings.find((entry) => entry.id === e.target.value);
                  if (renting) {
                    const room = rooms.find((entry) => entry.id === renting.roomId);
                    if (room) {
                      const nights = Math.ceil(
                        (new Date(renting.endDate).getTime() - new Date(renting.startDate).getTime()) / (1000 * 60 * 60 * 24)
                      );
                      setPaymentAmount((room.price * nights).toString());
                    }
                  }
                }}
                options={[
                  { value: '', label: 'Select a renting' },
                  ...activeRentings.map(r => {
                    const customer = customers.find((entry) => entry.id === r.customerId);
                    const room = rooms.find((entry) => entry.id === r.roomId);
                    const hotel = room ? hotels.find((entry) => entry.id === room.hotelId) : null;
                    return {
                      value: r.id,
                      label: `${customer?.fullName} - ${hotel?.name} - Room ${room?.roomNumber}`
                    };
                  })
                ]}
              />
              
              {selectedRenting && renting && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="mb-3">Renting Details</h4>
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
                      <span className="text-muted-foreground">Period</span>
                      <span>{renting.startDate} - {renting.endDate}</span>
                    </div>
                    <div className="border-t border-border pt-2 mt-2">
                      <div className="flex justify-between font-semibold">
                        <span>Total Amount</span>
                        <span className="text-primary">${calculateTotal()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <Input
                label="Payment Amount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="0.00"
              />
              
              <Select
                label="Payment Method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                options={[
                  { value: 'Cash', label: 'Cash' },
                  { value: 'Credit Card', label: 'Credit Card' },
                  { value: 'Debit Card', label: 'Debit Card' },
                  { value: 'Wire Transfer', label: 'Wire Transfer' }
                ]}
              />
              
              <Input
                label="Payment Date"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
              
              <Button
                className="w-full"
                onClick={handleSubmitPayment}
                disabled={!selectedRenting || !paymentAmount}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Record Payment
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Payment History */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No payments recorded</p>
              ) : (
                <div className="space-y-3">
                  {payments.map(payment => {
                    const renting = rentings.find((entry) => entry.id === payment.rentingId);
                    const customer = renting ? customers.find((entry) => entry.id === renting.customerId) : null;
                    
                    return (
                      <div key={payment.id} className="p-3 bg-muted rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-medium mb-1">{customer?.fullName}</div>
                            <div className="text-sm text-muted-foreground">
                              {payment.paymentDate}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-green-600">${payment.amount}</div>
                            <Badge variant="default" className="text-xs mt-1">
                              {payment.paymentMethod}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Payment Recorded"
        size="sm"
      >
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="mb-2">Payment Successfully Recorded</h3>
          <p className="text-muted-foreground mb-2">Amount: ${submittedPayment?.amount ?? '0.00'}</p>
          <p className="text-muted-foreground mb-6">Method: {submittedPayment?.method ?? 'Cash'}</p>
          <Button onClick={() => setShowSuccessModal(false)}>
            Done
          </Button>
        </div>
      </Modal>
    </div>
  );
};
