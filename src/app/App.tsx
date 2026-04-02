import { RouterProvider } from 'react-router';
import { router } from './routes';
import { EmployeeAuthProvider } from './context/EmployeeAuthContext';
import { HotelStoreProvider } from './data/hotelStore';

export default function App() {
  return (
    <HotelStoreProvider>
      <EmployeeAuthProvider>
        <RouterProvider router={router} />
      </EmployeeAuthProvider>
    </HotelStoreProvider>
  );
}
