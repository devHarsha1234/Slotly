const QueueEntry = require('../models/QueueEntry');
const Business = require('../models/Business');

// @desc    Run what-if simulator
// @route   POST /api/simulator/simulate
// @access  Private/Provider
const simulateQueue = async (req, res, next) => {
  try {
    const { businessId, staffId, delayMinutesToAdd = 0, walkInsToAdd = 0 } = req.body;

    const business = await Business.findById(businessId);
    if (!business || business.owner.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to simulate for this business');
    }

    // Fetch live queue: DO NOT filter by staff if staffId is not provided!
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
      .populate('customer', 'name email phone')
      .populate({
        path: 'appointment',
        select: 'scheduledStart scheduledEnd expectedDuration status source customer',
        populate: { path: 'customer', select: 'name email phone' }
      })
      .populate('staff', 'name role')
      .lean();

    const now = new Date();
    const delayNum = Math.max(0, parseInt(delayMinutesToAdd) || 0);
    const walkInsNum = Math.max(0, parseInt(walkInsToAdd) || 0);

    // If queue is completely empty
    if (!entries || entries.length === 0) {
      return res.json({
        success: true,
        message: 'No downstream queue to simulate. Start a service or add a waiting appointment first.',
        data: {
          hasQueue: false,
          currentQueue: [],
          projectedQueue: [],
          summary: {
            hasQueue: false,
            delayApplied: delayNum,
            walkInsApplied: walkInsNum,
            totalAffected: 0,
            message: 'No downstream queue to simulate. Start a service or add a waiting appointment first.'
          }
        }
      });
    }

    // Deep copy entries for simulation
    let simulatedEntries = JSON.parse(JSON.stringify(entries));

    // Find currently serving entry (if any)
    const servingEntry = simulatedEntries.find(e => e.status === 'serving');
    let currentStartTime = now;
    const delayMs = delayNum * 60 * 1000;

    if (servingEntry) {
      const actualStart = servingEntry.actualStart || servingEntry.estimatedStart || now;
      const expectedDurationMs = (servingEntry.service?.expectedDurationMinutes || 20) * 60 * 1000;
      const elapsedMs = Math.max(0, now.getTime() - new Date(actualStart).getTime());
      
      // The simulated delay extends the currently serving customer's remaining service time
      const projectedTotalDurationMs = expectedDurationMs + delayMs;
      const remainingMs = Math.max(2 * 60 * 1000, projectedTotalDurationMs - elapsedMs);
      const projectedCompletion = new Date(now.getTime() + remainingMs);

      servingEntry.projectedStart = new Date(actualStart);
      servingEntry.projectedEnd = projectedCompletion;
      servingEntry.delayShiftMinutes = delayNum;
      servingEntry.projectedWaitMinutes = 0;
      servingEntry.simulatedStatus = 'serving (delayed)';

      currentStartTime = projectedCompletion;
    } else {
      // If no customer is currently serving, delay affects practitioner availability from now
      currentStartTime = new Date(now.getTime() + delayMs);
    }

    let affectedCount = 0;
    let maxShift = delayNum;

    // Simulate each waiting entry
    for (let i = 0; i < simulatedEntries.length; i++) {
      const entry = simulatedEntries[i];
      if (entry.status === 'serving') continue;

      const scheduled = entry.appointment?.scheduledStart 
        ? new Date(entry.appointment.scheduledStart) 
        : null;

      const baselineETA = new Date(entry.estimatedStart || scheduled || now);
      
      // Projected start is when the practitioner becomes free (or original scheduled time if later)
      const projectedStart = scheduled 
        ? new Date(Math.max(scheduled.getTime(), currentStartTime.getTime()))
        : new Date(currentStartTime.getTime());

      const shiftMinutes = Math.round((projectedStart.getTime() - baselineETA.getTime()) / 60000);
      const waitMinutes = Math.max(0, Math.round((projectedStart.getTime() - now.getTime()) / 60000));

      entry.projectedStart = projectedStart;
      entry.projectedWaitMinutes = waitMinutes;
      entry.delayShiftMinutes = shiftMinutes;
      entry.simulatedStatus = shiftMinutes > 0 ? `delayed (+${shiftMinutes}m)` : 'on time';

      if (shiftMinutes > 0) affectedCount++;
      if (shiftMinutes > maxShift) maxShift = shiftMinutes;

      const durationMs = (entry.service?.expectedDurationMinutes || 20) * 60 * 1000;
      currentStartTime = new Date(projectedStart.getTime() + durationMs);
    }

    // Apply hypothetical walk-ins
    for (let i = 0; i < walkInsNum; i++) {
      const walkInStart = new Date(currentStartTime.getTime());
      const walkInDuration = 15; // 15 mins default
      const walkInWaitMinutes = Math.max(0, Math.round((walkInStart.getTime() - now.getTime()) / 60000));

      simulatedEntries.push({
        _id: `sim_walkin_${i + 1}`,
        token: `W-SIM${i + 1}`,
        status: 'waiting',
        isSimulated: true,
        customer: { name: `Simulated Walk-in #${i + 1}` },
        service: { name: 'Simulated Walk-in Service', expectedDurationMinutes: walkInDuration },
        position: simulatedEntries.length + 1,
        estimatedStart: walkInStart,
        projectedStart: walkInStart,
        estimatedWaitMinutes: walkInWaitMinutes,
        projectedWaitMinutes: walkInWaitMinutes,
        delayShiftMinutes: 0,
        simulatedStatus: 'simulated walk-in'
      });

      currentStartTime = new Date(walkInStart.getTime() + walkInDuration * 60000);
    }

    const summary = {
      hasQueue: true,
      delayApplied: delayNum,
      walkInsApplied: walkInsNum,
      totalAffected: affectedCount,
      maxDelayShift: maxShift,
      currentlyServingToken: servingEntry ? servingEntry.token : null,
      currentlyServingCustomer: servingEntry ? (servingEntry.customer?.name || 'Walk-in Customer') : null,
      totalQueueSize: simulatedEntries.length
    };

    res.json({
      success: true,
      message: 'Simulation completed',
      data: {
        hasQueue: true,
        currentQueue: entries,
        projectedQueue: simulatedEntries,
        summary
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { simulateQueue };
