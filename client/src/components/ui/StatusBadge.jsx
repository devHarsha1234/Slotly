import React from 'react';

const StatusBadge = ({ status }) => {
  let color = 'bg-gray-100 text-gray-800';
  
  switch(status) {
    case 'scheduled':
    case 'confirmed':
      color = 'bg-blue-100 text-blue-800';
      break;
    case 'waiting':
      color = 'bg-yellow-100 text-yellow-800';
      break;
    case 'serving':
      color = 'bg-indigo-100 text-indigo-800';
      break;
    case 'completed':
      color = 'bg-green-100 text-green-800';
      break;
    case 'cancelled':
    case 'no_show':
      color = 'bg-red-100 text-red-800';
      break;
  }

  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${color}`}>
      {status.replace('_', '-')}
    </span>
  );
};

export default StatusBadge;
