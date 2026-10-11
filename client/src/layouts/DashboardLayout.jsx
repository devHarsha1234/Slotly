import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Settings,
  Clock,
  Briefcase,
  Activity,
  LogOut,
  Bell
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const providerNav = [
    { name: 'Overview', href: '/provider/dashboard', icon: LayoutDashboard },
    { name: 'Live Queue', href: '/provider/queue', icon: Activity },
    { name: 'Appointments', href: '/provider/appointments', icon: Calendar },
    { name: 'Services', href: '/provider/services', icon: Briefcase },
    { name: 'Staff', href: '/provider/staff', icon: Users },
    { name: 'Simulator', href: '/provider/simulator', icon: Clock },
  ];

  const customerNav = [
    { name: 'Overview', href: '/customer/dashboard', icon: LayoutDashboard },
    { name: 'Find Services', href: '/customer/services', icon: Briefcase },
    { name: 'My Appointments', href: '/customer/appointments', icon: Calendar },
    { name: 'Live Queue', href: '/customer/queue', icon: Activity },
    { name: 'Notifications', href: '/customer/notifications', icon: Bell },
  ];

  const navigation = user?.role === 'provider' ? providerNav : customerNav;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex md:flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Link to="/" className="text-2xl font-bold text-primary-600 tracking-tight">Slotly</Link>
        </div>
        <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                  isActive 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </div>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
              {user?.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex w-full items-center px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 md:hidden">
           <Link to="/" className="text-xl font-bold text-primary-600">Slotly</Link>
           <button onClick={logout} className="p-2 text-gray-500">
             <LogOut className="h-5 w-5" />
           </button>
        </header>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
