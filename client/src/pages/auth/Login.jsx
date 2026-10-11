import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      const res = await api.post('/auth/login', formData);
      login(res.data.data);
      if (res.data.data.role === 'provider') {
        navigate('/provider/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
          Welcome back
        </h2>
        <p className="mt-2 text-sm text-gray-600">Log in to manage your appointments.</p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-xl sm:px-10 border border-gray-200">
          
          {error && <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">{error}</div>}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input required type="email" className="block w-full rounded-md border-gray-300 px-4 py-2 text-gray-900 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm border outline-none transition"
                value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="jane@example.com" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <a href="#" className="text-xs font-semibold text-gray-500 hover:text-gray-900">Forgot password?</a>
              </div>
              <input required type="password" minLength={1} className="block w-full rounded-md border-gray-300 px-4 py-2 text-gray-900 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm border outline-none transition"
                value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
            </div>

            <div className="pt-2">
              <button disabled={loading} type="submit" className="flex w-full justify-center rounded-lg bg-gray-900 px-4 py-3 text-sm font-bold text-white shadow hover:bg-gray-800 transition disabled:opacity-50">
                {loading ? 'Logging in...' : 'Log in'}
              </button>
            </div>
            
            <div className="text-center mt-4 text-sm text-gray-600">
              Don't have an account? <Link to="/register" className="font-semibold text-gray-900 hover:underline">Create one</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
