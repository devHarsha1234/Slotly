const QueueEntry = require('../models/QueueEntry');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');

// Core adaptive algorithm: Recalculate downstream queue entries
const recalculateQueue = async (businessId, staffId, referenceStartTime) => {
  // 1. Get all waiting/serving entries, ordered by position
  const query = {
    business: businessId,
    status: { $in: ['waiting', 'serving'] }
  };
  if (staffId) {
    query.staff = staffId;
  }
  const entries = await QueueEntry.find(query)
    .sort('position')
    .populate('service')
    .populate('appointment');

  if (!entries || entries.length === 0) return;

  const now = new Date();
  
  // Baseline available time is either the reference completion time (from a service that just completed) or now
  let currentStartTime = referenceStartTime && new Date(referenceStartTime) > now
    ? new Date(referenceStartTime)
    : now;
  
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    
    if (entry.status === 'serving') {
      const durationMs = entry.service.expectedDurationMinutes * 60 * 1000;
      const actualStart = entry.actualStart || entry.estimatedStart || now;
      const elapsedMs = now.getTime() - new Date(actualStart).getTime();
      let remainingMs = durationMs - elapsedMs;
      if (remainingMs < 0) remainingMs = 5 * 60 * 1000; // If overdue, expect at least 5 more mins
      
      currentStartTime = new Date(now.getTime() + remainingMs);
    } else {
      // It's waiting
      const oldETA = entry.estimatedStart;
      
      // Compute new estimated start time:
      // If the entry has a scheduled appointment time, it cannot start before that scheduled time
      // unless the practitioner was delayed past the scheduled time.
      const scheduledTime = entry.appointment?.scheduledStart 
        ? new Date(entry.appointment.scheduledStart) 
        : null;
      
      if (scheduledTime) {
        // Adapted ETA is the later of when the practitioner is free or scheduled time
        entry.estimatedStart = new Date(Math.max(scheduledTime.getTime(), currentStartTime.getTime()));
      } else {
        // Walk-in starts as soon as practitioner is free
        entry.estimatedStart = new Date(currentStartTime.getTime());
      }
      
      const waitMs = entry.estimatedStart.getTime() - now.getTime();
      entry.estimatedWaitMinutes = Math.max(0, Math.round(waitMs / (1000 * 60)));
      await entry.save();
      
      // If ETA changed by > 10 mins and it has a customer, notify
      if (oldETA && entry.customer) {
        const diffMins = Math.abs((entry.estimatedStart.getTime() - new Date(oldETA).getTime()) / 60000);
        if (diffMins > 10) {
          const recent = await Notification.findOne({
            recipient: entry.customer,
            relatedAppointment: entry.appointment?._id || entry.appointment,
            createdAt: { $gte: new Date(Date.now() - 30 * 60000) }
          });
          if (!recent) {
            const isLate = entry.estimatedStart > new Date(oldETA);
            const delayAmount = Math.round(diffMins);
            await Notification.create({
              recipient: entry.customer,
              type: 'ETA_UPDATE',
              title: isLate ? 'Delay Notification' : 'Schedule Update',
              message: isLate 
                ? `Your appointment is delayed by approximately ${delayAmount} min. Your new estimated start is ${entry.estimatedStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
                : `Your estimated start time has moved earlier to ${entry.estimatedStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
              relatedAppointment: entry.appointment?._id || entry.appointment
            });
          }
        }
      }
      
      // Calculate start time for the *next* entry in the queue
      const durationMs = entry.service.expectedDurationMinutes * 60 * 1000;
      currentStartTime = new Date(entry.estimatedStart.getTime() + durationMs);
    }
  }
};

module.exports = {
  recalculateQueue
};
