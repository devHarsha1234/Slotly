import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { format } from 'date-fns';
import { 
  Play, 
  ArrowRight, 
  AlertTriangle, 
  Clock, 
  Users, 
  ShieldCheck, 
  Sparkles, 
  Activity, 
  Info,
  UserPlus
} from 'lucide-react';

const ProviderSimulator = () => {
  const { user } = useAuth();
  const [delay, setDelay] = useState(25);
  const [walkIns, setWalkIns] = useState(1);
  const [simulationResult, setSimulationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSimulate = async () => {
    if (!user?.businessId) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/simulator/simulate', {
        businessId: user.businessId,
        delayMinutesToAdd: parseInt(delay) || 0,
        walkInsToAdd: parseInt(walkIns) || 0
      });
      setSimulationResult(res.data.data);
    } catch (err) {
      console.error('Simulation error:', err);
      setError(err.message || 'Failed to run simulation');
    } finally {
      setLoading(false);
    }
  };

  const projectedQueue = simulationResult?.projectedQueue || 
    (Array.isArray(simulationResult) ? simulationResult : []);
  const summary = simulationResult?.summary || {};
  const hasQueue = simulationResult ? (simulationResult.hasQueue !== false && projectedQueue.length > 0) : null;

  return (
    <div className="max-w-6xl mx-auto font-sans">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 text-xs font-bold text-primary-700 uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4 text-primary-600" />
          <span>Operational What-If Analysis</span>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">What-If Queue Simulator</h1>
        <p className="text-gray-500 text-sm mt-1">
          Hypothetically test service delays and incoming walk-ins to project cascading downstream queue impacts in real-time without modifying live database state.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center">
          <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Scenario Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-5 flex items-center">
              <Clock className="w-4 h-4 mr-2 text-gray-600" />
              Scenario Controls
            </h2>

            <div className="space-y-6">
              {/* Delay control */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Add Delay to Current Service
                  </label>
                  <span className="text-sm font-black text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md border border-primary-200">
                    +{delay}m
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setDelay(Math.max(0, parseInt(delay) - 5))}
                    className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 font-black text-gray-700 flex items-center justify-center text-lg transition"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    className="flex-1 rounded-lg border border-gray-300 text-center py-2 px-3 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-primary-500"
                    value={delay}
                    onChange={(e) => setDelay(Math.max(0, parseInt(e.target.value) || 0))}
                  />
                  <button
                    type="button"
                    onClick={() => setDelay(parseInt(delay) + 5)}
                    className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 font-black text-gray-700 flex items-center justify-center text-lg transition"
                  >
                    +
                  </button>
                </div>
                {/* Delay presets */}
                <div className="flex gap-2 mt-2.5">
                  {[10, 15, 25, 40].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDelay(mins)}
                      className={`text-xs px-2.5 py-1 rounded-md font-bold transition ${
                        delay === mins
                          ? 'bg-primary-600 text-white shadow-sm'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                      }`}
                    >
                      +{mins}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Walk-in control */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Hypothetical Walk-ins
                  </label>
                  <span className="text-sm font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    +{walkIns}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setWalkIns(Math.max(0, parseInt(walkIns) - 1))}
                    className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 font-black text-gray-700 flex items-center justify-center text-lg transition"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    className="flex-1 rounded-lg border border-gray-300 text-center py-2 px-3 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-primary-500"
                    value={walkIns}
                    onChange={(e) => setWalkIns(Math.max(0, parseInt(e.target.value) || 0))}
                  />
                  <button
                    type="button"
                    onClick={() => setWalkIns(parseInt(walkIns) + 1)}
                    className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 font-black text-gray-700 flex items-center justify-center text-lg transition"
                  >
                    +
                  </button>
                </div>
                {/* Walk-in presets */}
                <div className="flex gap-2 mt-2.5">
                  {[0, 1, 2, 3].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setWalkIns(num)}
                      className={`text-xs px-2.5 py-1 rounded-md font-bold transition ${
                        walkIns === num
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                      }`}
                    >
                      {num} {num === 1 ? 'Walk-in' : 'Walk-ins'}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSimulate}
                disabled={loading}
                className="w-full flex items-center justify-center py-3 px-4 rounded-xl text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 shadow-md transition disabled:opacity-50"
              >
                <Play className="w-4 h-4 mr-2" />
                {loading ? 'Calculating Projected Impact...' : 'Run Simulation'}
              </button>
            </div>
          </div>

          {/* Academic Isolation Guarantee */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 text-xs text-blue-900 flex items-start space-x-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-1">In-Memory Sandbox Guarantee</p>
              <p className="text-blue-700 leading-relaxed">
                Calculations are computed purely on a cloned memory state. No database updates are committed and no actual customer notifications are triggered.
              </p>
            </div>
          </div>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-8 space-y-6">
          {simulationResult && hasQueue === false && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <Info className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Downstream Queue to Simulate</h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
                There are currently no active or waiting appointments in your live queue. Start an appointment or book a scheduled slot first to simulate downstream delays.
              </p>
              <Link
                to="/provider/queue"
                className="inline-flex items-center justify-center bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow hover:bg-gray-800 transition"
              >
                <Activity className="w-4 h-4 mr-2" /> Open Live Queue
              </Link>
            </div>
          )}

          {simulationResult && hasQueue === true && (
            <div className="space-y-6">
              {/* Summary Metrics Bar */}
              <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center space-x-2 text-xs font-bold text-primary-400 uppercase tracking-widest mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Projected Impact Summary</span>
                  </div>
                  <h3 className="text-xl font-black">
                    +{summary.delayApplied}m Delay Shifted {summary.totalAffected} Appointments
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {summary.currentlyServingToken 
                      ? `Applied to ${summary.currentlyServingToken} (${summary.currentlyServingCustomer || 'Active Service'})`
                      : 'Applied across waiting queue backlog'}
                    {summary.walkInsApplied > 0 ? ` + ${summary.walkInsApplied} simulated walk-in(s)` : ''}
                  </p>
                </div>

                <div className="flex space-x-4">
                  <div className="text-right">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Max Delay Shift</p>
                    <p className="text-2xl font-black text-red-400">+{summary.maxDelayShift}m</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Queue Size</p>
                    <p className="text-2xl font-black text-white">{summary.totalQueueSize}</p>
                  </div>
                </div>
              </div>

              {/* Projected Queue List */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600">
                    Projected Service Timeline
                  </h3>
                  <span className="text-xs font-bold text-gray-500">
                    {projectedQueue.length} Entities Simulated
                  </span>
                </div>

                <div className="divide-y divide-gray-100">
                  {projectedQueue.map((item, idx) => {
                    const isServing = item.status === 'serving';
                    const isSimulatedWalkIn = item.isSimulated || item.token.startsWith('W-SIM');
                    const customerName = item.customer?.name || (isSimulatedWalkIn ? 'Simulated Walk-in' : 'Customer');
                    const scheduledStart = item.appointment?.scheduledStart 
                      ? new Date(item.appointment.scheduledStart) 
                      : null;
                    const baselineTime = scheduledStart || new Date(item.estimatedStart || Date.now());
                    const projectedTime = new Date(item.projectedStart || item.estimatedStart);
                    const shiftMinutes = item.delayShiftMinutes || 0;

                    return (
                      <div 
                        key={item._id || idx} 
                        className={`p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition ${
                          isServing 
                            ? 'bg-primary-50/40' 
                            : isSimulatedWalkIn 
                            ? 'bg-amber-50/40' 
                            : 'hover:bg-gray-50/60'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2.5">
                            <span className="text-xs font-bold text-gray-400">#{item.position || idx + 1}</span>
                            <span className="font-extrabold text-xs px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-900 border border-gray-200">
                              {item.token}
                            </span>
                            <span className="font-extrabold text-gray-900 text-base">
                              {customerName}
                            </span>
                            {isServing && (
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-200">
                                Serving (Delayed)
                              </span>
                            )}
                            {isSimulatedWalkIn && (
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center">
                                <UserPlus className="w-3 h-3 mr-1" /> Simulated Walk-in
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-gray-500 font-medium">
                            {item.service?.name || 'General Consultation'} · Expected {item.service?.expectedDurationMinutes || 15}m
                          </p>
                        </div>

                        {/* Projected Impact Comparison */}
                        <div className="flex items-center space-x-4 bg-white p-3 rounded-xl border border-gray-200 shadow-xs">
                          <div className="text-right">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                              {scheduledStart ? 'Planned' : 'Current'}
                            </p>
                            <p className="text-xs font-bold text-gray-500 line-through">
                              {format(baselineTime, 'hh:mm a')}
                            </p>
                          </div>

                          <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />

                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-primary-600">
                              Projected ETA
                            </p>
                            <p className="text-sm font-black text-gray-900">
                              {format(projectedTime, 'hh:mm a')}
                            </p>
                          </div>

                          {shiftMinutes > 0 && (
                            <span className="bg-red-50 text-red-700 text-xs font-extrabold px-2.5 py-1 rounded-lg border border-red-200">
                              +{shiftMinutes}m
                            </span>
                          )}
                          {shiftMinutes === 0 && !isSimulatedWalkIn && (
                            <span className="bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded-lg border border-green-200">
                              On Time
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {!simulationResult && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
              <Clock className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">Simulator Ready</h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
                Adjust delay and walk-in values on the left panel and click <strong>Run Simulation</strong> to compute the projected downstream queue impact.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderSimulator;
