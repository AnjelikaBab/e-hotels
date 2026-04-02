import React from 'react';
import { useNavigate } from 'react-router';
import { 
  Calendar, 
  DoorOpen, 
  Clock, 
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useHotelStore } from '../../data/hotelStore';
import { useEmployeeAuth } from '../../context/EmployeeAuthContext';

const getLocalDateString = () => {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - timezoneOffset).toISOString().split('T')[0];
};

export const EmployeeDashboard: React.FC = () => {
  const { currentEmployee } = useEmployeeAuth();
  const { bookings, rentings, rooms, hotels, customers } = useHotelStore();
  
  const today = getLocalDateString();
  const todayBookings = bookings.filter(b => b.startDate === today && b.status === 'Confirmed');
  const activeRentings = rentings.filter(r => new Date(r.endDate) >= new Date());
  const pendingBookings = bookings.filter(b => b.status === 'Pending');
  const roomIssues = rooms.filter(r => r.problems && r.problems.length > 0);
  
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="mb-2">Employee Dashboard</h1>
        <p className="text-muted-foreground">
          {currentEmployee
            ? `Signed in as ${currentEmployee.fullName} (${currentEmployee.id}). Here's your hotel operations overview.`
            : "Welcome back! Here's your hotel operations overview"}
        </p>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Today's Arrivals</p>
                <p className="text-3xl font-semibold">{todayBookings.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Rentings</p>
                <p className="text-3xl font-semibold">{activeRentings.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DoorOpen className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pending Bookings</p>
                <p className="text-3xl font-semibold">{pendingBookings.length}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Room Issues</p>
                <p className="text-3xl font-semibold">{roomIssues.length}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Arrivals */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Check-ins</CardTitle>
          </CardHeader>
          <CardContent>
            {todayBookings.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No arrivals scheduled for today</p>
            ) : (
              <div className="space-y-3">
                {todayBookings.slice(0, 5).map(booking => {
                  const room = rooms.find((entry) => entry.id === booking.roomId);
                  const hotel = room ? hotels.find((entry) => entry.id === room.hotelId) : null;
                  const customer = customers.find((entry) => entry.id === booking.customerId);
                  
                  if (!room || !hotel || !customer) return null;
                  
                  return (
                    <div key={booking.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <div className="font-medium mb-1">{customer.fullName}</div>
                        <div className="text-sm text-muted-foreground">
                          {hotel.name} - Room {room.roomNumber}
                        </div>
                      </div>
                      <Badge variant="success">Arriving</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Room Issues */}
        <Card>
          <CardHeader>
            <CardTitle>Room Issues & Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            {roomIssues.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No room issues reported</p>
            ) : (
              <div className="space-y-3">
                {roomIssues.map(room => {
                  const hotel = hotels.find((entry) => entry.id === room.hotelId);
                  if (!hotel) return null;
                  
                  return (
                    <div key={room.id} className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium text-red-900 mb-1">
                          {hotel.name} - Room {room.roomNumber}
                        </div>
                        <div className="text-sm text-red-700">{room.problems}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Active Rentings */}
        <Card>
          <CardHeader>
            <CardTitle>Active Rentings</CardTitle>
          </CardHeader>
          <CardContent>
            {activeRentings.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No active rentings</p>
            ) : (
              <div className="space-y-3">
                {activeRentings.slice(0, 5).map(renting => {
                  const room = rooms.find((entry) => entry.id === renting.roomId);
                  const hotel = room ? hotels.find((entry) => entry.id === room.hotelId) : null;
                  const customer = customers.find((entry) => entry.id === renting.customerId);
                  
                  if (!room || !hotel || !customer) return null;
                  
                  return (
                    <div key={renting.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <div className="font-medium mb-1">{customer.fullName}</div>
                        <div className="text-sm text-muted-foreground">
                          {hotel.name} - Room {room.roomNumber}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Until {renting.endDate}
                        </div>
                      </div>
                      <Badge variant="info">Active</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Pending Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingBookings.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No pending bookings</p>
            ) : (
              <div className="space-y-3">
                {pendingBookings.slice(0, 5).map(booking => {
                  const room = rooms.find((entry) => entry.id === booking.roomId);
                  const hotel = room ? hotels.find((entry) => entry.id === room.hotelId) : null;
                  const customer = customers.find((entry) => entry.id === booking.customerId);
                  
                  if (!room || !hotel || !customer) return null;
                  
                  return (
                    <div key={booking.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <div className="font-medium mb-1">{customer.fullName}</div>
                        <div className="text-sm text-muted-foreground">
                          {booking.startDate} - {booking.endDate}
                        </div>
                      </div>
                      <Badge variant="warning">Pending</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
