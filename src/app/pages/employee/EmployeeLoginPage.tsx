import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useHotelStore } from '../../data/hotelStore';
import { useEmployeeAuth } from '../../context/EmployeeAuthContext';

export const EmployeeLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useEmployeeAuth();
  const { employees } = useHotelStore();
  const [employeeId, setEmployeeId] = useState('');
  const [error, setError] = useState('');

  const redirectPath = location.state?.from?.pathname || '/employee';

  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!login(employeeId)) {
      setError('Enter a valid employee ID to access the portal.');
      return;
    }

    setError('');
    navigate(redirectPath, { replace: true });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-muted/40 px-6 py-10">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <CardTitle>Employee Portal Login</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Sign in using your employee ID.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Employee ID"
              placeholder="e.g. emp1"
              value={employeeId}
              onChange={(event) => setEmployeeId(event.target.value)}
              error={error}
              autoComplete="username"
              autoFocus
            />
            <Button type="submit" className="w-full">
              Log In
            </Button>
          </form>

          <div className="mt-6 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            Demo employee IDs: {employees.map((employee) => employee.id).join(', ')}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
