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
        const aptRes = await api.get('/appointments');
        const activeApts = aptRes.data.data.filter(a => ['scheduled', 'confirmed'].includes(a.status));
        // Sort to get the nearest one
        activeApts.sort((a, b) => new Date(a.scheduledStart) - new Date(b.scheduledStart));
        setAppointments(activeApts);

        // If there's a next appointment today, try fetching its queue
        if (activeApts.length > 0 && isToday(new Date(activeApts[0].date))) {
          const nextApt = activeApts[0];
          const qRes = await api.get(`/queue/${nextApt.business._id}`);
          const qList = qRes.data.data;
          const myEntry = qList.find(q => q.appointment && q.appointment._id === nextApt._id);
          const servingEntry = qList.find(q => q.status === 'serving');
          
          if (myEntry) {
            const position = Math.max(0, qList.findIndex(q => q._id === myEntry._id));
            setQueueData({
              entry: myEntry,
              position,
              servingToken: servingEntry ? servingEntry.token : 'None'
            });
          }
        }
      } catch (err) {
        console.error(err);
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
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight">Good morning, {user?.name?.split(' ')[0]}</h1>
      
      {nextApt ? (
        <div className="mb-10">
          <h2 className="text-sm font-bold tracking-widest text-gray-400 uppercase mb-4">Your Next Appointment</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{nextApt.service?.name}</h3>
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
            
            {queueData && (
              <div className="bg-gray-50 border-t border-gray-100 p-6 sm:p-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold tracking-widest text-primary-600 uppercase flex items-center">
                    <Activity className="w-4 h-4 mr-2" /> Your Live Queue
                  </h3>
                  <span className="text-xs font-bold bg-primary-100 text-primary-800 px-2 py-1 rounded">Live</span>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Position</p>
                    <p className="text-2xl font-black text-gray-900">#{queueData.position}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Est Wait</p>
                    <p className="text-2xl font-black text-primary-600">{queueData.entry.estimatedWaitMinutes}m</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Serving</p>
                    <p className="text-2xl font-black text-gray-900">{queueData.servingToken}</p>
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

      {upcomingApts.length > 0 && (
        <div className="mb-10">
          <h2 className="text-sm font-bold tracking-widest text-gray-400 uppercase mb-4">Upcoming Appointments</h2>
          <div className="space-y-4">
            {upcomingApts.map(apt => (
              <div key={apt._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex justify-between items-center hover:shadow transition">
                <div>
                  <h3 className="font-bold text-gray-900">{apt.service?.name}</h3>
                  <p className="text-sm text-gray-500">{apt.business?.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{format(new Date(apt.date), 'MMM d')} · {format(new Date(apt.scheduledStart), 'h:mm a')}</p>
                  <p className="text-xs font-bold text-gray-400 uppercase mt-1">{apt.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
