import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { Compass, Check } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({ 
    name: '', email: '', phone: '', password: '', confirmPassword: '', role: 'customer',
    businessName: '', businessCategory: '' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Real backend preview data for customers
  const [previewBusinesses, setPreviewBusinesses] = useState([]);
  const [previewCategory, setPreviewCategory] = useState('');
  const [selectedPreviewBusiness, setSelectedPreviewBusiness] = useState('');

  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const fetchAvailable = async () => {
      try {
        const res = await api.get('/businesses');
        setPreviewBusinesses(res.data.data || []);
      } catch (err) {
        // Non-blocking
      }
    };
    fetchAvailable();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      const payload = { ...formData };
      if (payload.role === 'customer') {
        delete payload.businessName;
        delete payload.businessCategory;
      }
      delete payload.confirmPassword;
      
      const res = await api.post('/auth/register', payload);
      login(res.data.data);
      if (res.data.data.role === 'provider') {
        navigate('/provider/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const categories = [...new Set(previewBusinesses.map(b => b.category).filter(Boolean))];
  const filteredBusinesses = previewBusinesses.filter(b => 
    !previewCategory || b.category === previewCategory
  );

  return (
    <div className="flex min-h-screen bg-gray-50 flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
          Create your Slotly account
        </h2>
        <p className="mt-2 text-sm text-gray-600">Choose how you'll use Slotly.</p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-2xl sm:px-10 border border-gray-200">
          
          <div className="flex justify-center space-x-4 mb-8 border-b border-gray-100 pb-8">
            <button
              type="button"
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition ${
                formData.role === 'customer' 
                  ? 'bg-gray-900 text-white shadow' 
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
              onClick={() => { 
                setError(''); 
                setFormData({ ...formData, role: 'customer' }); 
              }}
            >
              Customer
            </button>
            <button
              type="button"
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition ${
                formData.role === 'provider' 
                  ? 'bg-gray-900 text-white shadow' 
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
              onClick={() => { 
                setError(''); 
                setFormData({ ...formData, role: 'provider' }); 
              }}
            >
              Service Provider
            </button>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-4">
                Personal & Account Details
              </h3>
              <div className="grid grid-cols-1 gap-y-5 gap-x-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    required 
                    type="text" 
                    className="block w-full rounded-lg border-gray-300 px-3.5 py-2.5 text-gray-900 shadow-sm focus:border-gray-900 focus:ring-gray-900 text-sm border outline-none transition"
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                    placeholder="e.g. Jane Doe" 
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input 
                    required 
                    type="email" 
                    className="block w-full rounded-lg border-gray-300 px-3.5 py-2.5 text-gray-900 shadow-sm focus:border-gray-900 focus:ring-gray-900 text-sm border outline-none transition"
                    value={formData.email} 
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                    placeholder="jane@example.com" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input 
                    required 
                    type="tel" 
                    className="block w-full rounded-lg border-gray-300 px-3.5 py-2.5 text-gray-900 shadow-sm focus:border-gray-900 focus:ring-gray-900 text-sm border outline-none transition"
                    value={formData.phone} 
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                    placeholder="555-0199" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input 
                    required 
                    type="password" 
                    minLength={6} 
                    className="block w-full rounded-lg border-gray-300 px-3.5 py-2.5 text-gray-900 shadow-sm focus:border-gray-900 focus:ring-gray-900 text-sm border outline-none transition"
                    value={formData.password} 
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                    placeholder="••••••••" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input 
                    required 
                    type="password" 
                    minLength={6} 
                    className="block w-full rounded-lg border-gray-300 px-3.5 py-2.5 text-gray-900 shadow-sm focus:border-gray-900 focus:ring-gray-900 text-sm border outline-none transition"
                    value={formData.confirmPassword} 
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} 
                    placeholder="••••••••" 
                  />
                </div>
              </div>
            </div>

            {/* CUSTOMER OPTIONAL DISCOVERY PREVIEW */}
            {formData.role === 'customer' && previewBusinesses.length > 0 && (
              <div className="pt-6 border-t border-gray-100">
                <div className="flex items-center space-x-2 mb-3">
                  <Compass className="w-4 h-4 text-primary-600" />
                  <h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                    Find a Service (Optional Preview)
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50/70 p-4 rounded-xl border border-gray-100">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                      Category
                    </label>
                    <select
                      value={previewCategory}
                      onChange={(e) => {
                        setPreviewCategory(e.target.value);
                        setSelectedPreviewBusiness('');
                      }}
                      className="w-full rounded-lg border border-gray-300 p-2 text-xs bg-white outline-none focus:ring-1 focus:ring-gray-900"
                    >
                      <option value="">All Categories ({previewBusinesses.length} providers)</option>
                      {categories.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                      Business
                    </label>
                    <select
                      value={selectedPreviewBusiness}
                      onChange={(e) => setSelectedPreviewBusiness(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 p-2 text-xs bg-white outline-none focus:ring-1 focus:ring-gray-900"
                    >
                      <option value="">Choose a business</option>
                      {filteredBusinesses.map(b => (
                        <option key={b._id} value={b._id}>{b.name} ({b.category})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* PROVIDER REQUIRED BUSINESS FIELDS */}
            {formData.role === 'provider' && (
              <div className="pt-6 border-t border-gray-100">
                <h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-4">
                  Business Setup Details
                </h3>
                <div className="grid grid-cols-1 gap-y-5 gap-x-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      Business Name <span className="text-red-500">*</span>
                    </label>
                    <input 
                      required 
                      type="text" 
                      className="block w-full rounded-lg border-gray-300 px-3.5 py-2.5 text-gray-900 shadow-sm focus:border-gray-900 focus:ring-gray-900 text-sm border outline-none transition"
                      value={formData.businessName} 
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} 
                      placeholder="e.g. Apex Health Clinic / Metro Barber" 
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      Business Category <span className="text-red-500">*</span>
                    </label>
                    <select 
                      required 
                      className="block w-full rounded-lg border-gray-300 px-3.5 py-2.5 text-gray-900 shadow-sm focus:border-gray-900 focus:ring-gray-900 text-sm border outline-none transition bg-white"
                      value={formData.businessCategory} 
                      onChange={(e) => setFormData({ ...formData, businessCategory: e.target.value })}
                    >
                      <option value="">Select a category</option>
                      <option value="Health">Health & Medical</option>
                      <option value="Beauty">Beauty & Salon</option>
                      <option value="Consulting">Consulting & Advisory</option>
                      <option value="Repair">Repair & Maintenance</option>
                      <option value="Fitness">Fitness & Wellness</option>
                      <option value="Other">Other Services</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4">
              <button 
                disabled={loading} 
                type="submit" 
                className="flex w-full justify-center rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white shadow hover:bg-gray-800 transition disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </div>
            
            <div className="text-center mt-4 text-sm text-gray-600">
              Already have an account? <Link to="/login" className="font-bold text-gray-900 hover:underline">Log in</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
