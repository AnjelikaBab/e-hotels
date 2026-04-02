import type { FC } from 'react';
import { Link, useLocation } from 'react-router';
import { Hotel, User, LogIn, LogOut } from 'lucide-react';
import { Button, buttonVariants } from './ui/Button';
import { useEmployeeAuth } from '../context/EmployeeAuthContext';

export const Navigation: FC = () => {
  const location = useLocation();
  const isEmployeePortal = location.pathname.startsWith('/employee');
  const { currentEmployee, isAuthenticated, logout } = useEmployeeAuth();
  
  return (
    <nav className="bg-primary text-primary-foreground shadow-lg">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Hotel className="w-8 h-8 text-accent" />
            <span className="text-xl font-semibold">e-Hotels</span>
          </Link>
          
          <div className="flex items-center gap-6">
            {!isEmployeePortal ? (
              <>
                <Link to="/search" className={buttonVariants({ variant: 'primary', size: 'sm' })}>
                  Search Rooms
                </Link>
                <Link to="/customer/bookings" className="hover:text-accent transition-colors">
                  My Bookings
                </Link>
                <Link
                  to={isAuthenticated ? '/employee' : '/employee/login'}
                  className="inline-flex items-center justify-center rounded-lg bg-secondary px-3 py-1.5 text-sm text-secondary-foreground transition-all duration-200 hover:bg-secondary/80"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Employee Portal
                </Link>
              </>
            ) : (
              <>
                <Link to="/" className="hover:text-accent transition-colors">
                  Customer Site
                </Link>
                <div className="flex items-center gap-2 ml-4">
                  <User className="w-5 h-5" />
                  <span>{currentEmployee ? `${currentEmployee.fullName} (${currentEmployee.id})` : 'Employee Portal'}</span>
                </div>
                {isAuthenticated && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Log Out
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
