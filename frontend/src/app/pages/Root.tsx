import { Outlet } from 'react-router';
import { Header } from '../components/Header';

export function Root() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Outlet />
    </div>
  );
}
