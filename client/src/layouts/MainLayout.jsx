import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogOut } from 'lucide-react';

const MainLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-2xl font-black text-gray-900 tracking-tighter">Slotly.</Link>
              <nav className="hidden md:flex space-x-6">
                <a href="/#how-it-works" className="text-sm font-bold text-gray-500 hover:text-gray-900 transition">How it works</a>
                <a href="/#for-businesses" className="text-sm font-bold text-gray-500 hover:text-gray-900 transition">For businesses</a>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              {!user ? (
                <>
                  <Link to="/login" className="text-sm font-bold text-gray-600 hover:text-gray-900 transition px-3 py-2">Log in</Link>
                  <Link to="/register" className="bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-800 transition shadow-sm">Get started</Link>
                </>
              ) : (
                <>
                  <Link to={user.role === 'provider' ? '/provider/dashboard' : '/customer/dashboard'} className="text-sm font-bold text-gray-600 hover:text-gray-900 transition px-3 py-2">
                    Dashboard
                  </Link>
                  <button onClick={logout} className="text-gray-400 hover:text-red-600 p-2 transition rounded-full hover:bg-red-50">
                    <LogOut className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-grow">
        <Outlet />
      </main>
      
      <footer className="bg-white border-t border-gray-100 py-16 mt-auto">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-sm">
          <div className="text-gray-400 font-medium mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Slotly. Adaptive service flow management.
          </div>
          <div className="flex space-x-6 text-gray-400 font-medium">
            <a href="#" className="hover:text-gray-900 transition">Privacy</a>
            <a href="#" className="hover:text-gray-900 transition">Terms</a>
            <a href="#" className="hover:text-gray-900 transition">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
