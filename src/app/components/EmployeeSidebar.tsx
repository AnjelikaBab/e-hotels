import React from 'react';
import { Link, useLocation } from 'react-router';
import { 
  LayoutDashboard, 
  Users, 
  UserCog, 
  Building2, 
  DoorOpen, 
  CreditCard,
  Link2,
  Archive,
  BarChart3
} from 'lucide-react';
import { useEmployeeAuth } from '../context/EmployeeAuthContext';

const menuItems = [
  { path: '/employee', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/employee/convert-booking', icon: Link2, label: 'Convert Booking' },
  { path: '/employee/direct-renting', icon: DoorOpen, label: 'Direct Renting' },
  { path: '/employee/payments', icon: CreditCard, label: 'Payments' },
  { path: '/employee/customers', icon: Users, label: 'Customers' },
  { path: '/employee/employees', icon: UserCog, label: 'Employees' },
  { path: '/employee/hotels', icon: Building2, label: 'Hotels' },
  { path: '/employee/rooms', icon: DoorOpen, label: 'Rooms' },
  { path: '/employee/chains', icon: Building2, label: 'Hotel Chains' },
  { path: '/employee/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/employee/archive', icon: Archive, label: 'Archive' }
];

export const EmployeeSidebar: React.FC = () => {
  const location = useLocation();
  const { currentEmployee } = useEmployeeAuth();
  
  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground min-h-screen border-r border-sidebar-border">
      <div className="p-6">
        {currentEmployee && (
          <div className="mb-6 rounded-lg bg-sidebar-accent px-4 py-3">
            <div className="text-sm font-medium">{currentEmployee.fullName}</div>
            <div className="text-xs text-sidebar-foreground/70 mt-1">
              {currentEmployee.role} • {currentEmployee.id}
            </div>
          </div>
        )}
        <h2 className="text-lg font-semibold mb-6">Management</h2>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                    : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};
