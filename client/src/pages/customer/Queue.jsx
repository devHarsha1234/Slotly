import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Activity, Clock, CheckCircle2, Sparkles } from 'lucide-react';
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
  const isCurrentlyServing = myEntry?.status === 'serving';

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
            {isCurrentlyServing ? (
              <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 px-6 py-6 sm:px-8 text-white flex flex-col sm:flex-row sm:items-center justify-between border-b border-emerald-800">
                <div className="mb-4 sm:mb-0">
                  <div className="inline-flex items-center space-x-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase mb-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-1"></span>
                    <span>Currently Serving You</span>
                  </div>
                  <p className="text-xs font-bold text-emerald-300/70 uppercase tracking-widest mb-1">Your Token</p>
                  <p className="text-5xl font-black tracking-tighter text-white">{myEntry.token}</p>
                  <p className="text-sm font-medium text-emerald-200 mt-2">
                    {myEntry.business?.name} · {myEntry.service?.name}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center sm:text-right">
                  <div>
                    <p className="text-xs font-bold text-emerald-300/70 uppercase tracking-widest mb-1">Status</p>
                    <p className="text-2xl font-black text-emerald-300">In Service</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-300/70 uppercase tracking-widest mb-1">Est Wait</p>
                    <p className="text-2xl font-black text-emerald-400">0m</p>
                  </div>
                </div>
              </div>
            ) : (
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
                    <p className="text-2xl font-bold">#{position}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Est Wait</p>
                    <p className="text-2xl font-bold text-primary-400">~{myEntry.estimatedWaitMinutes}m</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Sub-Header: Timing & Status */}
            <div className={`px-6 py-4 border-b flex items-center justify-between ${
              isCurrentlyServing ? 'bg-emerald-50/70 border-emerald-100 text-emerald-900' : 'bg-gray-50 border-gray-100 text-gray-700'
            }`}>
              <div className="flex items-center text-sm font-bold">
                {isCurrentlyServing ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
                    <span>Your turn! The provider is attending to your service now.</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 mr-2 text-gray-500" />
                    <span>Estimated Start: {format(new Date(myEntry.estimatedStart), 'hh:mm a')}</span>
                  </>
                )}
              </div>
              <div className={`text-xs font-black uppercase tracking-wider ${isCurrentlyServing ? 'text-emerald-700' : 'text-gray-400'}`}>
                {isCurrentlyServing ? '● Active' : 'Live Timeline'}
              </div>
            </div>

            {/* Timeline: Complete Live Status */}
            <div className="p-6 sm:p-8">
              <div className="relative border-l-2 border-gray-200 ml-4 space-y-8">
                {businessQueue.map((q) => {
                  // STRICT matching: only the active queue entry belongs to this customer
                  const isMe = q._id === myEntry._id;
                  const isServing = q.status === 'serving';

                  let dotColor = 'bg-gray-300';
                  if (isServing && isMe) {
                    dotColor = 'bg-emerald-500 ring-4 ring-emerald-200 animate-pulse';
                  } else if (isServing && !isMe) {
                    dotColor = 'bg-green-500 animate-pulse';
                  } else if (isMe && !isServing) {
                    dotColor = 'bg-primary-600 ring-4 ring-primary-100';
                  }

                  return (
                    <div key={q._id} className="relative pl-8">
                      <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full ${dotColor}`}></div>
                      
                      <div className={`flex justify-between items-center ${
                        isServing && isMe 
                          ? 'bg-emerald-50 border border-emerald-300 p-4 rounded-xl -mt-3 shadow-sm'
                          : isMe 
                          ? 'bg-primary-50 border border-primary-200 p-4 rounded-xl -mt-3 shadow-sm'
                          : isServing
                          ? 'bg-gray-50 border border-gray-200 p-3 rounded-xl'
                          : ''
                      }`}>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className={`font-black text-lg ${
                              isServing && isMe 
                                ? 'text-emerald-950'
                                : isMe 
                                ? 'text-primary-900' 
                                : isServing
                                ? 'text-gray-900'
                                : 'text-gray-800'
                            }`}>
                              {q.token}
                            </p>
                            
                            {/* Unambiguous, single-customer badge tags */}
                            {isServing && isMe && (
                              <span className="text-[10px] font-black uppercase bg-emerald-600 text-white px-2 py-0.5 rounded shadow-sm">
                                YOU · CURRENTLY SERVING
                              </span>
                            )}
                            {!isServing && isMe && (
                              <span className="text-[10px] font-black uppercase bg-primary-600 text-white px-2 py-0.5 rounded shadow-sm">
                                YOU
                              </span>
                            )}
                            {isServing && !isMe && (
                              <span className="text-[10px] font-extrabold uppercase bg-green-100 text-green-800 border border-green-200 px-2 py-0.5 rounded">
                                NOW SERVING
                              </span>
                            )}
                          </div>
                          
                          <p className={`text-sm font-medium ${
                            isServing && isMe 
                              ? 'text-emerald-800 font-semibold'
                              : isMe 
                              ? 'text-primary-700 font-semibold' 
                              : 'text-gray-500'
                          }`}>
                            {isServing && isMe
                              ? 'Your turn! You are currently being served.'
                              : isServing && !isMe
                              ? 'Currently serving at front of queue'
                              : isMe
                              ? `Your Position (Queue #${q.position})`
                              : q.position < (position || 999)
                              ? 'Ahead of you in line'
                              : 'Behind you in line'}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <p className={`text-sm font-bold ${
                            isServing && isMe
                              ? 'text-emerald-900'
                              : isMe 
                              ? 'text-primary-900' 
                              : isServing
                              ? 'text-green-700 font-black'
                              : 'text-gray-600'
                          }`}>
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
