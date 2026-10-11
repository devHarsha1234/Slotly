import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Clock, DollarSign, Calendar as CalendarIcon, ChevronRight, X, User } from 'lucide-react';
import { format } from 'date-fns';

const CustomerServices = () => {
  const [businesses, setBusinesses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Booking Modal State
  const [bookingData, setBookingData] = useState(null); // { business, service, staffList }
  const [appointmentDate, setAppointmentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [appointmentTime, setAppointmentTime] = useState('10:00');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const res = await api.get('/businesses');
        setBusinesses(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch businesses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBusinesses();
  }, []);

  const openBookingModal = (business, service, staffList = []) => {
    // Default to the next clean hour/minute
    const now = new Date();
    const nextSlot = new Date(now.getTime() + 30 * 60000);
    const timeStr = `${String(nextSlot.getHours()).padStart(2, '0')}:${String(nextSlot.getMinutes()).padStart(2, '0')}`;
    
    setAppointmentDate(format(now, 'yyyy-MM-dd'));
    setAppointmentTime(timeStr);
    setSelectedStaffId(staffList.length > 0 ? staffList[0]._id : '');
    setBookingData({ business, service, staffList });
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!bookingData) return;
    setSubmitting(true);
    try {
      const [hours, minutes] = appointmentTime.split(':').map(Number);
      const scheduledStart = new Date(appointmentDate);
      scheduledStart.setHours(hours, minutes, 0, 0);

      await api.post('/appointments', {
        businessId: bookingData.business._id,
        serviceId: bookingData.service._id,
        staffId: selectedStaffId || undefined,
        date: new Date(appointmentDate).toISOString(),
        scheduledStart: scheduledStart.toISOString()
      });

      setBookingData(null);
      navigate('/customer/dashboard');
    } catch (error) {
      alert(error.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = businesses.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
    (category === '' || b.category === category)
  );

  const categories = [...new Set(businesses.map(b => b.category).filter(Boolean))];

  return (
    <div className="max-w-5xl mx-auto font-sans">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Find a Service</h1>
        <p className="text-gray-500">Discover local businesses, compare services, and book your appointments.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search businesses by name..." 
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 shadow-sm focus:border-gray-900 focus:ring-gray-900 outline-none transition font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="sm:w-64 relative">
          <select 
            className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 shadow-sm focus:border-gray-900 focus:ring-gray-900 outline-none transition font-medium appearance-none bg-white"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-6">
          {[1, 2].map(i => <div key={i} className="h-64 bg-gray-200 rounded-2xl w-full"></div>)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-8">
          {filtered.map(business => (
            <BusinessCard 
              key={business._id} 
              business={business} 
              onSelectService={(service, staff) => openBookingModal(business, service, staff)} 
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
          <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No businesses found</h3>
          <p className="text-gray-500">Try adjusting your search query or category filter.</p>
        </div>
      )}

      {/* BOOKING MODAL */}
      {bookingData && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Book Appointment</h3>
                <p className="text-xs text-gray-500">{bookingData.business.name}</p>
              </div>
              <button onClick={() => setBookingData(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmBooking} className="space-y-4">
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 text-sm">
                <p className="font-extrabold text-gray-900 text-base">{bookingData.service.name}</p>
                <div className="flex items-center space-x-4 text-xs font-semibold text-gray-600 mt-1.5">
                  <span className="flex items-center text-primary-700">
                    <Clock className="w-3.5 h-3.5 mr-1" /> {bookingData.service.expectedDurationMinutes} min
                  </span>
                  <span className="flex items-center text-gray-900">
                    <DollarSign className="w-3.5 h-3.5 mr-0.5" /> {bookingData.service.price}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="date"
                    required
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Time <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="time"
                    required
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {bookingData.staffList?.length > 0 && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Practitioner (Optional)
                  </label>
                  <select 
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Any Available Practitioner</option>
                    {bookingData.staffList.map(st => (
                      <option key={st._id} value={st._id}>{st.name} ({st.role || 'Staff'})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-4 flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setBookingData(null)}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition disabled:opacity-50"
                >
                  {submitting ? 'Confirming...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const BusinessCard = ({ business, onSelectService }) => {
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await api.get(`/businesses/${business._id}`);
        setServices(res.data.data.services || []);
        setStaff(res.data.data.staff || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [business._id]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
      <div className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 bg-gray-50/50">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">{business.name}</h2>
          <div className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-widest">
            <span className="bg-gray-200 text-gray-700 px-2.5 py-1 rounded-md mr-3">{business.category}</span>
            {business.address && (
              <span className="flex items-center mr-3"><MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" /> {business.address}</span>
            )}
            <span className="text-green-600 font-bold">Open</span>
          </div>
        </div>
      </div>
      
      <div className="p-6 sm:p-8">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Available Services</h3>
        {loading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-20 bg-gray-100 rounded-xl w-full"></div>
            <div className="h-20 bg-gray-100 rounded-xl w-full"></div>
          </div>
        ) : services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map(service => (
              <div 
                key={service._id} 
                className="group border border-gray-200 rounded-xl p-5 hover:border-gray-900 transition flex flex-col justify-between h-full bg-white"
              >
                <div className="mb-4">
                  <h4 className="font-extrabold text-gray-900 text-lg mb-1">{service.name}</h4>
                  {service.description && (
                    <p className="text-xs text-gray-500 mb-2">{service.description}</p>
                  )}
                  <div className="flex space-x-4 text-xs font-bold text-gray-600">
                    <span className="flex items-center text-primary-700">
                      <Clock className="w-3.5 h-3.5 mr-1" /> {service.expectedDurationMinutes} min
                    </span>
                    <span className="flex items-center text-gray-900">
                      <DollarSign className="w-3.5 h-3.5 mr-0.5" /> {service.price}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => onSelectService(service, staff)}
                  className="w-full bg-gray-50 text-gray-900 text-sm font-bold py-2.5 rounded-lg group-hover:bg-gray-900 group-hover:text-white transition flex items-center justify-center border border-gray-200 group-hover:border-gray-900 shadow-sm"
                >
                  Book now <ChevronRight className="w-4 h-4 ml-1 opacity-60 group-hover:opacity-100" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm italic">No services listed for this business yet.</p>
        )}
      </div>
    </div>
  );
};

export default CustomerServices;
