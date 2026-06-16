import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function MainLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-parchment-50/30">
        <div className="min-h-screen p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
