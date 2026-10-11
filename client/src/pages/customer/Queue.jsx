import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Activity, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';

const CustomerQueue = () => {
  const [activeQueueData, setActiveQueueData] = useState(null);
  const [businessQueue, setBusinessQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchQueueData = async () => {
      try {
        // 1. Fetch authoritative active queue entry for the authenticated customer
        const res = await api.get('/queue/customer/active');
        const activeData = res.data.data;
        setActiveQueueData(activeData);

        // 2. If the customer has an active queue entry, fetch the business's full live queue
        if (activeData?.entry?.business) {
          const businessId = activeData.entry.business._id || activeData.entry.business;
          const bQueueRes = await api.get(`/queue/${businessId}`);
          setBusinessQueue(bQueueRes.data.data || []);
        } else {
          setBusinessQueue([]);
        }
      } catch (err) {
        console.error('Failed to load live queue:', err);
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

  const myEntry = activeQueueData?.entry;
  const position = activeQueueData?.position;

  return (
    <div className="max-w-2xl mx-auto font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center">
          <Activity className="w-8 h-8 mr-3 text-primary-600" />
          Live Queue
        </h1>
        <p className="text-gray-500 mt-2">Real-time status of your current queue position and ETA.</p>
      </div>
      
      {myEntry ? (
        <div className="space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header: Token & Position */}
            <div className="bg-gray-900 px-6 py-6 sm:px-8 text-white flex flex-col sm:flex-row sm:items-center justify-between">
              <div className="mb-4 sm:mb-0">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Your Token</p>
                <p className="text-5xl font-black tracking-tighter">{myEntry.token}</p>
                <p className="text-sm font-medium text-gray-300 mt-2">
                  {myEntry.business?.name} · {myEntry.service?.name}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center sm:text-right">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Position</p>
                  <p className="text-2xl font-bold">
                    {myEntry.status === 'serving' ? 'Serving' : `#${position}`}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Est Wait</p>
                  <p className="text-2xl font-bold text-primary-400">
                    {myEntry.status === 'serving' ? '0m' : `~${myEntry.estimatedWaitMinutes}m`}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Sub-Header: Timing & Status */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center text-sm font-bold text-gray-700">
                <Clock className="w-4 h-4 mr-2 text-gray-500" />
                {myEntry.status === 'serving'
                  ? 'Currently in service'
                  : `Estimated Start: ${format(new Date(myEntry.estimatedStart), 'hh:mm a')}`}
              </div>
              <div className="text-xs font-bold text-gray-400 uppercase">
                {myEntry.status === 'serving' ? '● Active' : 'Live Timeline'}
              </div>
            </div>

            {/* Timeline: Context window around this customer */}
            <div className="p-6 sm:p-8">
              <div className="relative border-l-2 border-gray-200 ml-4 space-y-8">
                {businessQueue.map((q) => {
                  const isMe = q._id === myEntry._id || 
                               (q.customer && (q.customer._id === user?._id || q.customer === user?._id)) ||
                               (q.appointment?.customer && (q.appointment.customer._id === user?._id || q.appointment.customer === user?._id));
                  const isServing = q.status === 'serving';

                  let dotColor = 'bg-gray-300';
                  if (isServing) dotColor = 'bg-green-500 animate-pulse';
                  if (isMe) dotColor = 'bg-primary-600 ring-4 ring-primary-100';

                  return (
                    <div key={q._id} className="relative pl-8">
                      <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full ${dotColor}`}></div>
                      <div className={`flex justify-between items-center ${isMe ? 'bg-primary-50 border border-primary-200 p-4 rounded-xl -mt-3' : ''}`}>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className={`font-bold text-lg ${isMe ? 'text-primary-900' : 'text-gray-900'}`}>
                              {q.token}
                            </p>
                            {isMe && (
                              <span className="text-[10px] font-extrabold uppercase bg-primary-200 text-primary-900 px-2 py-0.5 rounded">
                                YOU
                              </span>
                            )}
                          </div>
                          <p className={`text-sm font-medium ${isMe ? 'text-primary-700' : 'text-gray-500'}`}>
                            {isServing
                              ? 'Currently Serving'
                              : isMe
                              ? 'Your Position'
                              : q.position < (position || 999)
                              ? 'Ahead of you'
                              : 'Behind you'}
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
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center text-gray-500">
          <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">No active queue</h3>
          <p className="mt-2 text-sm">You do not have any services waiting or in progress.</p>
        </div>
      )}
    </div>
  );
};

export default CustomerQueue;
