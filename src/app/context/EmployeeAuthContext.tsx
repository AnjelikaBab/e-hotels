import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Employee } from '../data/mockData';
import { useHotelStore } from '../data/hotelStore';

interface EmployeeAuthContextValue {
  currentEmployee: Employee | null;
  isAuthenticated: boolean;
  login: (employeeId: string) => boolean;
  logout: () => void;
}

const STORAGE_KEY = 'employeePortalEmployeeId';

const EmployeeAuthContext = createContext<EmployeeAuthContextValue | undefined>(undefined);

export function EmployeeAuthProvider({ children }: { children: React.ReactNode }) {
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const { employees } = useHotelStore();

  useEffect(() => {
    const storedEmployeeId = window.localStorage.getItem(STORAGE_KEY);
    if (!storedEmployeeId) return;

    const storedEmployee = employees.find((employee) => employee.id === storedEmployeeId) ?? null;
    if (storedEmployee) {
      setCurrentEmployee(storedEmployee);
      return;
    }

    window.localStorage.removeItem(STORAGE_KEY);
  }, [employees]);

  const value = useMemo<EmployeeAuthContextValue>(() => ({
    currentEmployee,
    isAuthenticated: currentEmployee !== null,
    login: (employeeId: string) => {
      const normalizedEmployeeId = employeeId.trim().toLowerCase();
      const employee = employees.find((entry) => entry.id.toLowerCase() === normalizedEmployeeId) ?? null;

      if (!employee) {
        return false;
      }

      setCurrentEmployee(employee);
      window.localStorage.setItem(STORAGE_KEY, employee.id);
      return true;
    },
    logout: () => {
      setCurrentEmployee(null);
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }), [currentEmployee, employees]);

  return (
    <EmployeeAuthContext.Provider value={value}>
      {children}
    </EmployeeAuthContext.Provider>
  );
}

export function useEmployeeAuth() {
  const context = useContext(EmployeeAuthContext);

  if (!context) {
    throw new Error('useEmployeeAuth must be used within an EmployeeAuthProvider');
  }

  return context;
}
