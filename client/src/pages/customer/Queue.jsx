import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Activity, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';

const CustomerQueue = () => {
  const [activeAppointments, setActiveAppointments] = useState([]);
  const [queues, setQueues] = useState({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchQueueData = async () => {
      try {
        const aptRes = await api.get('/appointments');
        const active = aptRes.data.data.filter(a => ['scheduled', 'confirmed'].includes(a.status));
        setActiveAppointments(active);

        const businessIds = [...new Set(active.map(a => a.business._id))];
        const queueData = {};
        for (const bId of businessIds) {
          const qRes = await api.get(`/queue/${bId}`);
          queueData[bId] = qRes.data.data;
        }
        setQueues(queueData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQueueData();
    const interval = setInterval(fetchQueueData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="animate-pulse space-y-6 max-w-2xl mx-auto">
      <div className="h-8 bg-gray-200 rounded w-1/4"></div>
      <div className="h-64 bg-gray-200 rounded-2xl"></div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center">
          <Activity className="w-8 h-8 mr-3 text-primary-600" />
          Live Queue
        </h1>
        <p className="text-gray-500 mt-2">Real-time status of your upcoming services.</p>
      </div>
      
      {activeAppointments.length > 0 ? (
        <div className="space-y-8">
          {activeAppointments.map(apt => {
            const businessQueue = queues[apt.business._id] || [];
            
            // Note: businessQueue items have appointment populated as an object now
            // so we match q.appointment?._id
            const myEntry = businessQueue.find(q => q.appointment && q.appointment._id === apt._id);
            const servingEntry = businessQueue.find(q => q.status === 'serving');
            
            if (!myEntry) return null;

            const myIndex = businessQueue.findIndex(q => q._id === myEntry._id);
            const position = Math.max(0, myIndex);

            return (
              <div key={apt._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-900 px-6 py-6 sm:px-8 text-white flex flex-col sm:flex-row sm:items-center justify-between">
                  <div className="mb-4 sm:mb-0">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Your Token</p>
                    <p className="text-5xl font-black tracking-tighter">{myEntry.token}</p>
                    <p className="text-sm font-medium text-gray-300 mt-2">{apt.business.name} · {apt.service.name}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-center sm:text-right">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Position</p>
                      <p className="text-2xl font-bold">#{position}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Est Wait</p>
                      <p className="text-2xl font-bold text-primary-400">{myEntry.estimatedWaitMinutes}m</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                   <div className="flex items-center text-sm font-bold text-gray-600">
                     <Clock className="w-4 h-4 mr-2" /> ETA: {format(new Date(myEntry.estimatedStart), 'hh:mm a')}
                   </div>
                   <div className="text-xs font-bold text-gray-400 uppercase">Live Timeline</div>
                </div>

                <div className="p-6 sm:p-8">
                  <div className="relative border-l-2 border-gray-200 ml-4 space-y-8">
                    {businessQueue.map((q, idx) => {
                      const isMe = q._id === myEntry._id;
                      const isServing = q.status === 'serving';
                      // only show a window around 'me' to avoid massive lists
                      if (idx < myIndex - 2 || idx > myIndex + 2) return null;
                      
                      let dotColor = "bg-gray-300";
                      if (isServing) dotColor = "bg-green-500 animate-pulse";
                      if (isMe) dotColor = "bg-primary-600 ring-4 ring-primary-100";

                      return (
                        <div key={q._id} className="relative pl-8">
                          <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full ${dotColor}`}></div>
                          <div className={`flex justify-between items-center ${isMe ? 'bg-primary-50 border border-primary-200 p-4 rounded-xl -mt-3' : ''}`}>
                            <div>
                              <p className={`font-bold text-lg ${isMe ? 'text-primary-900' : 'text-gray-900'}`}>{q.token}</p>
                              <p className={`text-sm font-medium ${isMe ? 'text-primary-700' : 'text-gray-500'}`}>
                                {isServing ? 'Currently Serving' : isMe ? 'YOU' : idx < myIndex ? 'Waiting ahead of you' : 'Waiting behind you'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`text-sm font-bold ${isMe ? 'text-primary-900' : 'text-gray-600'}`}>
                                {isServing ? 'NOW' : format(new Date(q.estimatedStart), 'hh:mm a')}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center text-gray-500">
          <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">No active queue</h3>
          <p className="mt-2 text-sm">Book an appointment to track your live queue position here.</p>
        </div>
      )}
    </div>
  );
};

export default CustomerQueue;
