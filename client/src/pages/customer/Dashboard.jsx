import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { format, isToday } from 'date-fns';
import { Calendar, Clock, ArrowRight, Activity, MapPin } from 'lucide-react';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch user's appointments (include 'serving' so active service is not hidden)
        const aptRes = await api.get('/appointments');
        const activeApts = (aptRes.data.data || []).filter((a) =>
          ['scheduled', 'confirmed', 'serving'].includes(a.status)
        );
        activeApts.sort((a, b) => new Date(a.scheduledStart) - new Date(b.scheduledStart));
        setAppointments(activeApts);

        // 2. Fetch authoritative active queue entry for the authenticated customer
        const qRes = await api.get('/queue/customer/active');
        if (qRes.data.data) {
          setQueueData(qRes.data.data);
        } else {
          setQueueData(null);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="animate-pulse space-y-8 max-w-4xl mx-auto">
      <div className="h-10 bg-gray-200 rounded w-1/3"></div>
      <div className="h-40 bg-gray-200 rounded-2xl"></div>
      <div className="h-32 bg-gray-200 rounded-2xl"></div>
    </div>
  );

  const nextApt = appointments[0];
  const upcomingApts = appointments.slice(1);

  return (
    <div className="max-w-4xl mx-auto font-sans">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight">
        Welcome back, {user?.name?.split(' ')[0] || 'there'}
      </h1>
      
      {/* SECTION: NEXT APPOINTMENT / ACTIVE VISIT */}
      {nextApt || queueData ? (
        <div className="mb-10">
          <h2 className="text-sm font-bold tracking-widest text-gray-400 uppercase mb-4">
            {queueData?.entry?.status === 'serving' ? 'Active Service In Progress' : 'Your Next Appointment'}
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {nextApt && (
              <div className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-xl font-bold text-gray-900">{nextApt.service?.name}</h3>
                    <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full capitalize ${
                      nextApt.status === 'serving'
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}>
                      {nextApt.status === 'serving' ? 'Currently Serving' : nextApt.status}
                    </span>
                  </div>
                  <p className="text-gray-500 font-medium flex items-center mb-4">
                    <MapPin className="w-4 h-4 mr-1 text-gray-400" /> {nextApt.business?.name}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm font-semibold text-gray-700">
                    <span className="flex items-center bg-gray-100 px-3 py-1.5 rounded-lg">
                      <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                      {isToday(new Date(nextApt.date)) ? 'Today' : format(new Date(nextApt.date), 'MMM d, yyyy')} · {format(new Date(nextApt.scheduledStart), 'h:mm a')}
                    </span>
                    <span className="flex items-center bg-gray-100 px-3 py-1.5 rounded-lg">
                      <Clock className="w-4 h-4 mr-2 text-gray-500" />
                      Expected {nextApt.expectedDuration} min
                    </span>
                  </div>
                </div>
                <div className="mt-6 sm:mt-0">
                  <Link to="/customer/appointments" className="inline-flex items-center justify-center bg-gray-900 text-white px-5 py-2.5 rounded-lg font-bold text-sm shadow hover:bg-gray-800 transition">
                    Manage <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </div>
            )}
            
            {/* AUTHORITATIVE LIVE QUEUE STATUS FOR LOGGED-IN CUSTOMER */}
            {queueData && (
              <div className="bg-gray-50 border-t border-gray-100 p-6 sm:p-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold tracking-widest text-primary-600 uppercase flex items-center">
                    <Activity className="w-4 h-4 mr-2" /> Your Live Queue
                  </h3>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    queueData.entry.status === 'serving'
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-primary-100 text-primary-800'
                  }`}>
                    {queueData.entry.status === 'serving' ? '● Serving You Now' : 'Live Adaptive Queue'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Card 1: Customer's Own Token & Position */}
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Your Token</p>
                    <p className="text-3xl font-black text-gray-900 tracking-tight">
                      {queueData.entry.token}
                    </p>
                    <p className="text-xs font-semibold text-gray-600 mt-1">
                      {queueData.entry.status === 'serving'
                        ? 'Position: Now Serving'
                        : `Queue Position: #${queueData.position}`}
                    </p>
                  </div>

                  {/* Card 2: Updated ETA / Live Timing */}
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                      {queueData.entry.status === 'serving' ? 'Service Status' : 'Updated ETA'}
                    </p>
                    <p className="text-2xl font-black text-primary-600">
                      {queueData.entry.status === 'serving'
                        ? 'In Progress'
                        : format(new Date(queueData.entry.estimatedStart), 'h:mm a')}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {queueData.entry.status === 'serving'
                        ? 'Being served right now'
                        : `~${queueData.entry.estimatedWaitMinutes}m estimated wait`}
                    </p>
                  </div>

                  {/* Card 3: Now Serving Token (explicitly separate from your token) */}
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Currently Serving</p>
                    <p className="text-2xl font-black text-gray-900">
                      {queueData.servingToken}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {queueData.entry.token === queueData.servingToken
                        ? 'You are at the front!'
                        : 'Current token in service'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center mb-10">
          <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No upcoming appointments</h3>
          <p className="text-gray-500 mb-6">You're all caught up. Ready for your next visit?</p>
          <Link to="/customer/services" className="inline-flex justify-center items-center rounded-lg bg-gray-900 px-6 py-3 text-sm font-bold text-white shadow hover:bg-gray-800 transition">
            Book an appointment
          </Link>
        </div>
      )}

      {/* SECTION: UPCOMING APPOINTMENTS LIST */}
      {upcomingApts.length > 0 && (
        <div className="mb-10">
          <h2 className="text-sm font-bold tracking-widest text-gray-400 uppercase mb-4">Upcoming Appointments</h2>
          <div className="space-y-4">
            {upcomingApts.map((apt) => (
              <div key={apt._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex justify-between items-center hover:shadow transition">
                <div>
                  <h3 className="font-bold text-gray-900">{apt.service?.name}</h3>
                  <p className="text-sm text-gray-500">{apt.business?.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    {format(new Date(apt.date), 'MMM d')} · {format(new Date(apt.scheduledStart), 'h:mm a')}
                  </p>
                  <p className="text-xs font-bold text-gray-400 uppercase mt-1">{apt.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QUICK ACTIONS */}
      <div>
        <h2 className="text-sm font-bold tracking-widest text-gray-400 uppercase mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to="/customer/services" className="bg-white rounded-xl border border-gray-200 p-5 flex items-center hover:border-gray-300 hover:shadow-sm transition">
            <div className="bg-gray-100 p-3 rounded-lg mr-4"><Calendar className="w-6 h-6 text-gray-700" /></div>
            <div>
              <h3 className="font-bold text-gray-900">Book appointment</h3>
              <p className="text-sm text-gray-500">Find businesses & services</p>
            </div>
          </Link>
          <Link to="/customer/queue" className="bg-white rounded-xl border border-gray-200 p-5 flex items-center hover:border-gray-300 hover:shadow-sm transition">
            <div className="bg-gray-100 p-3 rounded-lg mr-4"><Activity className="w-6 h-6 text-gray-700" /></div>
            <div>
              <h3 className="font-bold text-gray-900">View live queue</h3>
              <p className="text-sm text-gray-500">Track your real-time ETA</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
