import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Landing from './pages/public/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ProviderDashboard from './pages/provider/Dashboard';
import CustomerDashboard from './pages/customer/Dashboard';
import ProviderQueue from './pages/provider/Queue';
import ProviderSimulator from './pages/provider/Simulator';
import ProviderServices from './pages/provider/Services';
import ProviderStaff from './pages/provider/Staff';
import ProviderAppointments from './pages/provider/Appointments';
import CustomerServices from './pages/customer/Services';
import CustomerAppointments from './pages/customer/Appointments';
import CustomerNotifications from './pages/customer/Notifications';
import CustomerQueue from './pages/customer/Queue';

// Private Route Component
const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  if (!user) return <Navigate to="/login" />;
  
  if (role && user.role !== role) {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          <Route element={<DashboardLayout />}>
            <Route path="/provider/dashboard" element={
              <PrivateRoute role="provider"><ProviderDashboard /></PrivateRoute>
            } />
            <Route path="/provider/queue" element={
              <PrivateRoute role="provider"><ProviderQueue /></PrivateRoute>
            } />
            <Route path="/provider/simulator" element={
              <PrivateRoute role="provider"><ProviderSimulator /></PrivateRoute>
            } />
            <Route path="/provider/services" element={
              <PrivateRoute role="provider"><ProviderServices /></PrivateRoute>
            } />
            <Route path="/provider/appointments" element={
              <PrivateRoute role="provider"><ProviderAppointments /></PrivateRoute>
            } />
            <Route path="/provider/staff" element={
              <PrivateRoute role="provider"><ProviderStaff /></PrivateRoute> 
            } />
            
            <Route path="/customer/dashboard" element={
              <PrivateRoute role="customer"><CustomerDashboard /></PrivateRoute>
            } />
            <Route path="/customer/services" element={
              <PrivateRoute role="customer"><CustomerServices /></PrivateRoute>
            } />
            <Route path="/customer/appointments" element={
              <PrivateRoute role="customer"><CustomerAppointments /></PrivateRoute>
            } />
            <Route path="/customer/queue" element={
              <PrivateRoute role="customer"><CustomerQueue /></PrivateRoute>
            } />
            <Route path="/customer/notifications" element={
              <PrivateRoute role="customer"><CustomerNotifications /></PrivateRoute>
            } />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
