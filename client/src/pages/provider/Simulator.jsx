import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { format } from 'date-fns';

const ProviderSimulator = () => {
  const { user } = useAuth();
  const [delay, setDelay] = useState(15);
  const [walkIns, setWalkIns] = useState(1);
  const [simulatedQueue, setSimulatedQueue] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const res = await api.post('/simulator/simulate', {
        businessId: user.businessId,
        delayMinutesToAdd: parseInt(delay),
        walkInsToAdd: parseInt(walkIns)
      });
      setSimulatedQueue(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">What-If Simulator</h1>
      <p className="text-gray-600 mb-8">Test hypothetical scenarios to see how they impact your downstream queue without affecting actual data.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white p-6 rounded-lg shadow border border-gray-200 h-fit">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Scenario Inputs</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Add Delay to Current Service (mins)</label>
              <input type="number" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border py-2 px-3"
                value={delay} onChange={(e) => setDelay(e.target.value)} />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Incoming Walk-ins</label>
              <input type="number" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border py-2 px-3"
                value={walkIns} onChange={(e) => setWalkIns(e.target.value)} />
            </div>

            <button
              onClick={handleSimulate}
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none"
            >
              {loading ? 'Simulating...' : 'Run Simulation'}
            </button>
          </div>
        </div>

        <div className="md:col-span-2">
          {simulatedQueue ? (
            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
               <div className="bg-primary-50 px-6 py-4 border-b border-primary-100">
                 <h3 className="text-lg font-medium text-primary-900">Projected Queue</h3>
               </div>
               <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projected Start</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wait</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {simulatedQueue.map((item, idx) => (
                    <tr key={item._id} className={item.token.startsWith('W-SIM') ? 'bg-yellow-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {item.token}
                        {item.token.startsWith('W-SIM') && <span className="ml-2 text-xs text-yellow-600 font-normal">(Simulated)</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.service?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {format(new Date(item.estimatedStart), 'hh:mm a')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500 font-medium">
                        {item.estimatedWaitMinutes} min
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center text-gray-500">
              Run a simulation to see the projected impact on the queue here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderSimulator;
