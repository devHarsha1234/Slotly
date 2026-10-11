import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { format } from 'date-fns';
import { Calendar, User, Clock, CheckCircle2, XCircle, UserX, Filter } from 'lucide-react';

const ProviderAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments');
      setAppointments(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch provider appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    const label = status === 'no_show' ? 'no-show' : status;
    if (!window.confirm(`Mark this appointment as ${label}?`)) return;
    try {
      await api.put(`/appointments/${id}/status`, { status });
      fetchAppointments();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const filtered = appointments.filter(a => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return ['scheduled', 'confirmed'].includes(a.status);
    return a.status === filter;
  });

  if (loading) {
    return (
      <div className="animate-pulse space-y-6 max-w-6xl mx-auto">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-64 bg-gray-200 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Appointments Management</h1>
          <p className="text-gray-500 text-sm mt-1">Review all scheduled, completed, and past customer appointments.</p>
        </div>

        {/* Filter Pills */}
        <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-bold text-gray-600">
          {[
            { id: 'all', label: 'All' },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'completed', label: 'Completed' },
            { id: 'cancelled', label: 'Cancelled' },
            { id: 'no_show', label: 'No-Shows' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition ${
                filter === tab.id 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left">
              <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Service</th>
                  <th className="px-6 py-3.5">Date & Time</th>
                  <th className="px-6 py-3.5">Practitioner</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filtered.map(apt => {
                  const isScheduled = ['scheduled', 'confirmed'].includes(apt.status);
                  return (
                    <tr key={apt._id} className="hover:bg-gray-50/60 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-gray-900">{apt.customer?.name || 'Walk-in'}</div>
                        <div className="text-xs text-gray-500">{apt.customer?.phone || apt.customer?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{apt.service?.name}</div>
                        <div className="text-xs text-gray-500">{apt.expectedDuration} min · ${apt.service?.price}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-gray-900">
                          {format(new Date(apt.scheduledStart), 'MMM d, yyyy')}
                        </div>
                        <div className="text-xs text-primary-700 font-medium">
                          {format(new Date(apt.scheduledStart), 'h:mm a')} - {format(new Date(apt.scheduledEnd), 'h:mm a')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-xs font-medium">
                        {apt.staff?.name || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full capitalize ${
                          apt.status === 'completed'
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : apt.status === 'cancelled'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : apt.status === 'no_show'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {apt.status.replace('_', '-')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                        {isScheduled && (
                          <div className="flex justify-end items-center space-x-2">
                            <button
                              onClick={() => handleStatusUpdate(apt._id, 'no_show')}
                              className="text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-md font-bold transition"
                            >
                              No-show
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(apt._id, 'cancelled')}
                              className="text-red-700 hover:text-red-900 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1 rounded-md font-bold transition"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                        {!isScheduled && (
                          <span className="text-gray-400 italic">No actions</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-gray-500">
            <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="font-bold text-gray-900 text-base">No appointments found</p>
            <p className="text-sm mt-1">
              {filter === 'all' ? 'Your business has no recorded appointments yet.' : `No ${filter} appointments found.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderAppointments;
