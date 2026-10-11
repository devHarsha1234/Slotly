import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { format } from 'date-fns';
import { Plus, Play, CheckCircle2, XCircle, UserX, Clock, X } from 'lucide-react';

const ProviderQueue = () => {
  const { user } = useAuth();
  const [queue, setQueue] = useState([]);
  const [services, setServices] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Walk-in modal state
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInServiceId, setWalkInServiceId] = useState('');
  const [walkInStaffId, setWalkInStaffId] = useState('');
  const [walkInSubmitting, setWalkInSubmitting] = useState(false);

  // Complete modal state
  const [completeItem, setCompleteItem] = useState(null);
  const [actualDuration, setActualDuration] = useState('');
  const [completeSubmitting, setCompleteSubmitting] = useState(false);

  const fetchQueue = async () => {
    try {
      if (user?.businessId) {
        const res = await api.get(`/queue/${user.businessId}`);
        setQueue(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch queue:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [servicesRes, staffRes] = await Promise.all([
        api.get('/services').catch(() => ({ data: { data: [] } })),
        api.get('/staff').catch(() => ({ data: { data: [] } }))
      ]);
      setServices(servicesRes.data.data || []);
      setStaffList(staffRes.data.data || []);
      if (servicesRes.data.data?.length > 0) {
        setWalkInServiceId(servicesRes.data.data[0]._id);
      }
    } catch (err) {
      console.error('Failed to fetch metadata:', err);
    }
  };

  useEffect(() => {
    if (user?.businessId) {
      fetchQueue();
      fetchMetadata();
      const interval = setInterval(fetchQueue, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleStart = async (id) => {
    try {
      await api.put(`/queue/${id}/start`);
      fetchQueue();
    } catch (err) {
      alert(err.message || 'Failed to start service');
    }
  };

  const openCompleteModal = (item) => {
    setCompleteItem(item);
    setActualDuration(item.service?.expectedDurationMinutes || 20);
  };

  const submitComplete = async (e) => {
    e.preventDefault();
    if (!completeItem) return;
    setWalkInSubmitting(true);
    try {
      await api.put(`/queue/${completeItem._id}/complete`, {
        actualDurationMinutes: parseInt(actualDuration)
      });
      setCompleteItem(null);
      fetchQueue();
    } catch (err) {
      alert(err.message || 'Failed to complete service');
    } finally {
      setWalkInSubmitting(false);
    }
  };

  const handleStatusUpdate = async (queueId, status) => {
    const label = status === 'no_show' ? 'no-show' : 'cancelled';
    if (!window.confirm(`Are you sure you want to mark this entry as ${label}?`)) return;
    try {
      await api.put(`/queue/${queueId}/status`, { status });
      fetchQueue();
    } catch (err) {
      alert(err.message || `Failed to update status`);
    }
  };

  const submitWalkIn = async (e) => {
    e.preventDefault();
    if (!walkInServiceId) {
      alert('Please select a service');
      return;
    }
    setWalkInSubmitting(true);
    try {
      await api.post('/queue/walk-in', {
        businessId: user.businessId,
        serviceId: walkInServiceId,
        staffId: walkInStaffId || undefined
      });
      setShowWalkInModal(false);
      fetchQueue();
    } catch (err) {
      alert(err.message || 'Failed to add walk-in');
    } finally {
      setWalkInSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 max-w-6xl mx-auto">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-64 bg-gray-200 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Live Queue Management</h1>
          <p className="text-gray-500 text-sm mt-1">Monitor, start, complete, and dynamically adapt today's customer flow.</p>
        </div>
        <button 
          onClick={() => setShowWalkInModal(true)}
          className="inline-flex items-center justify-center bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow hover:bg-gray-800 transition"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Add Walk-in
        </button>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Pos / Token</th>
                <th className="px-6 py-3.5">Customer</th>
                <th className="px-6 py-3.5">Service</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">ETA / Start</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {queue.map((item) => {
                const isServing = item.status === 'serving';
                return (
                  <tr key={item._id} className={isServing ? 'bg-primary-50/40' : 'hover:bg-gray-50/60 transition'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-gray-400">#{item.position}</span>
                        <span className="font-extrabold text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-xs">
                          {item.token}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-gray-900">
                        {item.customer?.name || item.appointment?.customer?.name || (item.token?.startsWith('W-') ? 'Walk-in Customer' : 'Customer')}
                      </div>
                      <div className="text-xs text-gray-400">
                        {item.appointment && item.appointment.source !== 'walk_in' ? 'Scheduled Booking' : 'Walk-in'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      <span className="font-medium text-gray-900">{item.service?.name}</span>
                      <span className="text-xs text-gray-500 ml-1.5">({item.service?.expectedDurationMinutes}m)</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full capitalize ${
                        isServing 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-gray-900">
                        {format(new Date(item.estimatedStart), 'hh:mm a')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {isServing ? 'In service' : `Wait: ~${item.estimatedWaitMinutes}m`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      {item.status === 'waiting' && (
                        <div className="flex justify-end items-center space-x-2">
                          <button 
                            onClick={() => handleStatusUpdate(item._id, 'no_show')}
                            title="Mark No-show"
                            className="inline-flex items-center text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-md transition"
                          >
                            <UserX className="w-3.5 h-3.5 mr-1" /> No-show
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(item._id, 'cancelled')}
                            title="Cancel Entry"
                            className="inline-flex items-center text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1 rounded-md transition"
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" /> Cancel
                          </button>
                          <button 
                            onClick={() => handleStart(item._id)}
                            className="inline-flex items-center text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 px-3 py-1.5 rounded-md shadow-sm transition"
                          >
                            <Play className="w-3.5 h-3.5 mr-1" /> Start
                          </button>
                        </div>
                      )}
                      {isServing && (
                        <button 
                          onClick={() => openCompleteModal(item)}
                          className="inline-flex items-center text-xs font-bold text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-md shadow-sm transition"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Complete
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {queue.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="font-bold text-gray-900 text-base">Live queue is currently empty</p>
            <p className="text-sm mt-1">Bookings and walk-ins will appear here automatically.</p>
          </div>
        )}
      </div>

      {/* WALK-IN MODAL */}
      {showWalkInModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Add Walk-in Customer</h3>
              <button onClick={() => setShowWalkInModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={submitWalkIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Service <span className="text-red-500">*</span>
                </label>
                {services.length > 0 ? (
                  <select 
                    value={walkInServiceId}
                    onChange={(e) => setWalkInServiceId(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {services.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name} ({s.expectedDurationMinutes} min · ${s.price})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-red-600">No services found. Please add a service first.</p>
                )}
              </div>

              {staffList.length > 0 && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Staff Member (Optional)
                  </label>
                  <select 
                    value={walkInStaffId}
                    onChange={(e) => setWalkInStaffId(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Any Available Staff</option>
                    {staffList.map((st) => (
                      <option key={st._id} value={st._id}>{st.name} ({st.role || 'Staff'})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-4 flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setShowWalkInModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={walkInSubmitting || services.length === 0}
                  className="px-4 py-2 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition disabled:opacity-50"
                >
                  {walkInSubmitting ? 'Adding...' : 'Add to Queue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPLETE SERVICE MODAL */}
      {completeItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Complete Service ({completeItem.token})</h3>
              <button onClick={() => setCompleteItem(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={submitComplete} className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm">
                <div className="flex justify-between text-gray-600 mb-1">
                  <span>Customer:</span>
                  <span className="font-bold text-gray-900">
                    {completeItem.customer?.name || completeItem.appointment?.customer?.name || (completeItem.token?.startsWith('W-') ? 'Walk-in Customer' : 'Customer')}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Expected Duration:</span>
                  <span className="font-bold text-gray-900">{completeItem.service?.expectedDurationMinutes} min</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Actual Duration (Minutes)
                </label>
                <input 
                  type="number"
                  min="1"
                  required
                  value={actualDuration}
                  onChange={(e) => setActualDuration(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500 font-bold"
                />
              </div>

              {/* Quick delay presets */}
              <div>
                <span className="text-xs text-gray-500 font-medium">Quick presets for demo/simulation:</span>
                <div className="flex gap-2 mt-1">
                  <button 
                    type="button" 
                    onClick={() => setActualDuration(completeItem.service?.expectedDurationMinutes || 20)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded font-medium"
                  >
                    On-time
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setActualDuration((completeItem.service?.expectedDurationMinutes || 20) + 15)}
                    className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-2 py-1 rounded font-medium"
                  >
                    +15m Delay
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setActualDuration((completeItem.service?.expectedDurationMinutes || 20) + 25)}
                    className="text-xs bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 px-2 py-1 rounded font-medium"
                  >
                    +25m Delay
                  </button>
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setCompleteItem(null)}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={completeSubmitting}
                  className="px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition disabled:opacity-50"
                >
                  {completeSubmitting ? 'Completing...' : 'Complete & Recalculate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderQueue;
