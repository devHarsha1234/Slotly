import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { format } from 'date-fns';
import { Bell, Check } from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <Bell className="w-6 h-6 mr-2 text-primary-600" />
        Notifications
      </h1>
      
      {notifications.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 divide-y divide-gray-200">
          {notifications.map(n => (
            <div key={n._id} className={`p-4 ${n.read ? 'bg-white' : 'bg-blue-50'} flex justify-between items-start transition duration-150 ease-in-out`}>
              <div className="flex-1">
                <div className="flex justify-between">
                  <h3 className={`text-sm font-medium ${n.read ? 'text-gray-900' : 'text-primary-800'}`}>
                    {n.title}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {format(new Date(n.createdAt), 'MMM d, h:mm a')}
                  </span>
                </div>
                <p className={`mt-1 text-sm ${n.read ? 'text-gray-500' : 'text-primary-700'}`}>
                  {n.message}
                </p>
              </div>
              {!n.read && (
                <button 
                  onClick={() => markRead(n._id)}
                  className="ml-4 flex-shrink-0 text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center mt-1"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Mark as read
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center text-gray-500">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900">All caught up!</p>
          <p className="mt-2 text-sm">You have no new notifications.</p>
        </div>
      )}
    </div>
  );
};

export default Notifications;
