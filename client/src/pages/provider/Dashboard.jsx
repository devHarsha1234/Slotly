import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { format } from 'date-fns';
import { Clock, CheckCircle, Users, Calendar, AlertTriangle, ArrowRight } from 'lucide-react';

const ProviderDashboard = () => {
  const { user } = useAuth();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get(`/queue/${user.businessId}`);
        setQueue(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.businessId) {
      fetchDashboard();
      const interval = setInterval(fetchDashboard, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  if (loading) return (
    <div className="animate-pulse space-y-8">
      <div className="h-8 bg-gray-200 rounded w-1/4"></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-64 bg-gray-200 rounded-xl"></div>
        <div className="h-64 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  );

  const serving = queue.find(q => q.status === 'serving');
  const waiting = queue.filter(q => q.status === 'waiting');
  
  // Calculate delays
  let delayedCount = 0;
  waiting.forEach(item => {
    if (item.appointment) {
      const delay = Math.round((new Date(item.estimatedStart).getTime() - new Date(item.appointment.scheduledStart).getTime()) / 60000);
      if (delay > 5) delayedCount++;
    }
  });

  return (
    <div className="max-w-7xl mx-auto font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Overview</h1>
          <p className="text-gray-500 mt-1">What's happening in your business right now.</p>
        </div>
        <Link to="/provider/queue" className="hidden sm:inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-bold text-white shadow hover:bg-gray-800 transition">
          Manage Live Queue <ArrowRight className="ml-2 w-4 h-4" />
        </Link>
      </div>
      
      {/* KPI METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center text-gray-500 mb-2">
            <Calendar className="w-4 h-4 mr-2" />
            <span className="text-xs font-bold uppercase tracking-wider">Total Today</span>
          </div>
          <p className="text-3xl font-black text-gray-900">{queue.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center text-blue-600 mb-2">
            <Users className="w-4 h-4 mr-2" />
            <span className="text-xs font-bold uppercase tracking-wider">Waiting</span>
          </div>
          <p className="text-3xl font-black text-gray-900">{waiting.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center text-green-600 mb-2">
            <CheckCircle className="w-4 h-4 mr-2" />
            <span className="text-xs font-bold uppercase tracking-wider">In Service</span>
          </div>
          <p className="text-3xl font-black text-gray-900">{serving ? 1 : 0}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-red-200 shadow-sm bg-red-50/30">
          <div className="flex items-center text-red-600 mb-2">
            <AlertTriangle className="w-4 h-4 mr-2" />
            <span className="text-xs font-bold uppercase tracking-wider">Delayed</span>
          </div>
          <p className="text-3xl font-black text-red-700">{delayedCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CURRENTLY SERVING */}
        <div>
          <h2 className="text-sm font-bold tracking-widest text-gray-400 uppercase mb-4 flex items-center">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
            Currently Serving
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
            {serving ? (
              <div className="p-8 flex flex-col h-full justify-center">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Customer</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        serving.appointment && serving.appointment.source !== 'walk_in'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {serving.appointment && serving.appointment.source !== 'walk_in' ? 'Scheduled Booking' : 'Walk-in'}
                      </span>
                    </div>
                    <p className="text-3xl font-black text-gray-900">
                      {serving.customer?.name || serving.appointment?.customer?.name || (serving.token.startsWith('W-') ? 'Walk-in Customer' : 'Customer')}
                    </p>
                    <p className="text-gray-500 font-medium mt-1">{serving.service?.name}</p>
                  </div>
                  <div className="bg-gray-100 text-gray-800 text-sm px-4 py-2 rounded-lg font-bold">
                    {serving.token}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-auto">
                   <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Started At</p>
                     <p className="text-lg font-bold text-gray-900">{format(new Date(serving.updatedAt), 'hh:mm a')}</p>
                   </div>
                   <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Expected</p>
                     <p className="text-lg font-bold text-gray-900">{serving.service?.expectedDurationMinutes} min</p>
                   </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-400 p-12 flex flex-col items-center justify-center h-full">
                <Users className="w-12 h-12 mb-4 text-gray-200" />
                <p className="font-medium text-gray-500 text-lg">No active service.</p>
                <p className="text-sm mt-1">Start the next customer from the queue.</p>
              </div>
            )}
          </div>
        </div>

        {/* UP NEXT & PLANNED VS ACTUAL */}
        <div>
          <h2 className="text-sm font-bold tracking-widest text-gray-400 uppercase mb-4 flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Up Next
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-full">
            {waiting.length > 0 ? (
              <div className="space-y-4">
                {waiting.slice(0, 4).map((item, idx) => {
                  let delay = 0;
                  if (item.appointment) {
                    delay = Math.round((new Date(item.estimatedStart).getTime() - new Date(item.appointment.scheduledStart).getTime()) / 60000);
                  }
                  
                  const isWalkIn = !item.appointment || item.appointment?.source === 'walk_in' || item.token.startsWith('W-');
                  const customerName = item.customer?.name || item.appointment?.customer?.name || (isWalkIn ? 'Walk-in Customer' : 'Customer');

                  return (
                    <div key={item._id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-300 transition">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-bold text-gray-900">{customerName}</p>
                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              !isWalkIn ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {!isWalkIn ? 'Scheduled' : 'Walk-in'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 font-medium mt-0.5">{item.service?.name}</p>
                        </div>
                        <div className="bg-white border border-gray-200 px-2 py-1 rounded text-xs font-bold text-gray-700">
                          {item.token}
                        </div>
                      </div>
                      
                      {item.appointment ? (
                         <div className="flex justify-between text-xs items-center bg-white p-3 border border-gray-100 rounded-lg">
                            <div className="text-gray-400 font-medium line-through">
                              Plan: {format(new Date(item.appointment.scheduledStart), 'hh:mm a')}
                            </div>
                            <div className="font-bold text-gray-900 flex items-center">
                              {delay > 0 && (
                                <span className="bg-red-50 text-red-700 px-2 py-1 rounded border border-red-100 mr-2">
                                  +{delay}m
                                </span>
                              )}
                              {delay < 0 && (
                                <span className="bg-green-50 text-green-700 px-2 py-1 rounded border border-green-100 mr-2">
                                  {delay}m
                                </span>
                              )}
                              ETA: {format(new Date(item.estimatedStart), 'hh:mm a')}
                            </div>
                         </div>
                      ) : (
                          <div className="flex justify-end mt-2">
                            <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-blue-100">
                              ETA: {format(new Date(item.estimatedStart), 'hh:mm a')}
                            </span>
                          </div>
                      )}
                    </div>
                  );
                })}
                {waiting.length > 4 && (
                  <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest pt-2">+{waiting.length - 4} more in queue</p>
                )}
              </div>
            ) : (
              <div className="text-gray-400 p-12 flex flex-col items-center justify-center h-full text-center">
                <CheckCircle className="w-12 h-12 mb-4 text-gray-200 mx-auto" />
                <p className="font-medium text-gray-500 text-lg">Queue is empty.</p>
                <p className="text-sm mt-1">You are all caught up for now.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;
