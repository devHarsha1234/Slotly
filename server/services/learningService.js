const ServiceRecord = require('../models/ServiceRecord');
const Service = require('../models/Service');

const updateServiceExpectedDuration = async (serviceId) => {
  // Fetch last 10 records for this service to calculate rolling average
  const records = await ServiceRecord.find({ service: serviceId })
    .sort({ completedAt: -1 })
    .limit(10);
    
  if (records.length < 3) {
    // Need at least 3 records to adjust average
    return;
  }
  
  // Calculate rolling average
  const totalDuration = records.reduce((sum, record) => sum + record.actualDuration, 0);
  const averageDuration = totalDuration / records.length;
  
  // Weighted average: 70% historical original expected, 30% recent rolling average
  // This keeps it stable but slowly adapts to reality
  const service = await Service.findById(serviceId);
  if (service) {
    const newExpected = Math.round((service.expectedDurationMinutes * 0.7) + (averageDuration * 0.3));
    
    // Only update if it changes by at least 1 minute
    if (newExpected !== service.expectedDurationMinutes && newExpected > 0) {
       service.expectedDurationMinutes = newExpected;
       await service.save();
       console.log(`Service ${serviceId} expected duration updated to ${newExpected} mins`);
    }
  }
};

module.exports = {
  updateServiceExpectedDuration
};
