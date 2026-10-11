import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, XCircle, ArrowRight } from 'lucide-react';

const CustomerAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments');
      setAppointments(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await api.put(`/appointments/${id}/status`, { status: 'cancelled' });
      fetchAppointments();
    } catch (error) {
      alert(error.message || 'Failed to cancel appointment');
    }
  };

  const filtered = appointments.filter((apt) => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return ['scheduled', 'confirmed', 'serving'].includes(apt.status);
    if (filter === 'active') return apt.status === 'serving';
    return apt.status === filter;
  });

  if (loading) {
    return (
      <div className="animate-pulse space-y-6 max-w-4xl mx-auto">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Appointments</h1>
          <p className="text-gray-500 text-sm mt-1">View, track, and manage all your scheduled bookings.</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-bold text-gray-600">
          {[
            { id: 'all', label: 'All' },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'completed', label: 'Completed' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition ${
                filter === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((apt) => {
            const isUpcoming = ['scheduled', 'confirmed'].includes(apt.status);
            return (
              <div
                key={apt._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:border-gray-300 transition gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-extrabold text-xl text-gray-900">{apt.service?.name}</h3>
                    <span
                      className={`px-2.5 py-0.5 text-xs font-bold rounded-full capitalize ${
                        apt.status === 'completed'
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : apt.status === 'cancelled'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : apt.status === 'serving'
                          ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-gray-600 flex items-center">
                    <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                    {apt.business?.name}
                  </p>

                  <div className="flex flex-wrap gap-3 text-xs font-bold text-gray-600 pt-1">
                    <span className="flex items-center bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-md">
                      <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                      {format(new Date(apt.date), 'EEE, MMM d, yyyy')}
                    </span>
                    <span className="flex items-center bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-md text-primary-700">
                      <Clock className="w-3.5 h-3.5 mr-1.5 text-primary-500" />
                      {format(new Date(apt.scheduledStart), 'hh:mm a')} ({apt.expectedDuration}m)
                    </span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-0 border-gray-100">
                  {isUpcoming && (
                    <div className="flex items-center space-x-2">
                      <Link
                        to="/customer/queue"
                        className="inline-flex items-center text-xs font-bold bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-200 px-3 py-1.5 rounded-lg transition"
                      >
                        Track Queue <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Link>
                      <button
                        onClick={() => handleCancel(apt._id)}
                        className="inline-flex items-center text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg transition"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" /> Cancel
                      </button>
                    </div>
                  )}
                  {!isUpcoming && (
                    <span className="text-xs text-gray-400 italic">No pending actions</span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900 mb-1">No appointments found</h3>
            <p className="text-sm text-gray-500 mb-6">
              {filter === 'all'
                ? "You haven't booked any appointments yet."
                : `You have no ${filter} appointments.`}
            </p>
            <Link
              to="/customer/services"
              className="inline-flex items-center justify-center bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow hover:bg-gray-800 transition"
            >
              Browse and Book Services
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerAppointments;
