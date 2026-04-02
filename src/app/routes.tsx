import { createBrowserRouter } from 'react-router';
import { Navigate, Outlet, useLocation } from 'react-router';
import { Navigation } from './components/Navigation';
import { EmployeeSidebar } from './components/EmployeeSidebar';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { RoomDetailsPage } from './pages/RoomDetailsPage';
import { BookingPage } from './pages/BookingPage';
import { CustomerBookingsPage } from './pages/CustomerBookingsPage';
import { EmployeeDashboard } from './pages/employee/EmployeeDashboard';
import { ConvertBookingPage } from './pages/employee/ConvertBookingPage';
import { DirectRentingPage } from './pages/employee/DirectRentingPage';
import { PaymentsPage } from './pages/employee/PaymentsPage';
import { CustomersPage } from './pages/employee/CustomersPage';
import { EmployeesManagementPage } from './pages/employee/EmployeesManagementPage';
import { HotelsPage } from './pages/employee/HotelsPage';
import { RoomsPage } from './pages/employee/RoomsPage';
import { HotelChainsPage } from './pages/employee/HotelChainsPage';
import { AnalyticsPage } from './pages/employee/AnalyticsPage';
import { ArchivePage } from './pages/employee/ArchivePage';
import { EmployeeLoginPage } from './pages/employee/EmployeeLoginPage';
import { useEmployeeAuth } from './context/EmployeeAuthContext';

// Root layout for customer-facing pages
function CustomerLayout() {
  return (
    <div>
      <Navigation />
      <Outlet />
    </div>
  );
}

// Root layout for employee portal
function EmployeeLayout() {
  const location = useLocation();
  const { isAuthenticated } = useEmployeeAuth();

  if (!isAuthenticated) {
    return <Navigate to="/employee/login" replace state={{ from: location }} />;
  }

  return (
    <div>
      <Navigation />
      <div className="flex min-w-0">
        <EmployeeSidebar />
        <div className="flex-1 min-w-0 overflow-x-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: CustomerLayout,
    children: [
      { index: true, Component: HomePage },
      { path: 'search', Component: SearchPage },
      { path: 'room/:roomId', Component: RoomDetailsPage },
      { path: 'booking/:roomId', Component: BookingPage },
      { path: 'customer/bookings', Component: CustomerBookingsPage }
    ]
  },
  {
    path: '/employee',
    children: [
      { path: 'login', element: <><Navigation /><EmployeeLoginPage /></> },
      {
        Component: EmployeeLayout,
        children: [
          { index: true, Component: EmployeeDashboard },
          { path: 'convert-booking', Component: ConvertBookingPage },
          { path: 'direct-renting', Component: DirectRentingPage },
          { path: 'payments', Component: PaymentsPage },
          { path: 'customers', Component: CustomersPage },
          { path: 'employees', Component: EmployeesManagementPage },
          { path: 'hotels', Component: HotelsPage },
          { path: 'rooms', Component: RoomsPage },
          { path: 'chains', Component: HotelChainsPage },
          { path: 'analytics', Component: AnalyticsPage },
          { path: 'archive', Component: ArchivePage }
        ]
      }
    ]
  }
]);
