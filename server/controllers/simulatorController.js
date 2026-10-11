const QueueEntry = require('../models/QueueEntry');
const Business = require('../models/Business');

// @desc    Run what-if simulator
// @route   POST /api/simulator/simulate
// @access  Private/Provider
const simulateQueue = async (req, res, next) => {
  try {
    const { businessId, staffId, delayMinutesToAdd, walkInsToAdd } = req.body;

    const business = await Business.findById(businessId);
    if (!business || business.owner.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to simulate for this business');
    }

    // Fetch live queue
    const entries = await QueueEntry.find({
      business: businessId,
      staff: staffId,
      status: { $in: ['waiting', 'serving'] }
    }).sort('position').populate('service').lean(); // lean for plain object

    const now = new Date();
    let simulatedEntries = JSON.parse(JSON.stringify(entries)); // Deep copy

    // Apply walk-ins
    for (let i = 0; i < walkInsToAdd; i++) {
      simulatedEntries.push({
        _id: `sim_walkin_${i}`,
        token: `W-SIM${i}`,
        status: 'waiting',
        service: { name: 'Simulated Walk-in', expectedDurationMinutes: 15 },
        position: simulatedEntries.length + 1
      });
    }

    // Apply logic similar to queueService
    let currentStartTime = now;
    
    // Add hypothetical delay to first item if serving or next to serve
    if (simulatedEntries.length > 0 && delayMinutesToAdd) {
        currentStartTime = new Date(currentStartTime.getTime() + delayMinutesToAdd * 60000);
    }

    for (let i = 0; i < simulatedEntries.length; i++) {
      const entry = simulatedEntries[i];
      
      if (entry.status === 'serving') {
        const durationMs = entry.service.expectedDurationMinutes * 60 * 1000;
        const elapsedMs = now.getTime() - new Date(entry.estimatedStart || now).getTime();
        let remainingMs = durationMs - elapsedMs;
        if (remainingMs < 0) remainingMs = 5 * 60 * 1000;
        currentStartTime = new Date(currentStartTime.getTime() + remainingMs);
      } else {
        entry.estimatedStart = currentStartTime;
        const waitMs = currentStartTime.getTime() - now.getTime();
        entry.estimatedWaitMinutes = Math.max(0, Math.round(waitMs / (1000 * 60)));
        const durationMs = entry.service.expectedDurationMinutes * 60 * 1000;
        currentStartTime = new Date(currentStartTime.getTime() + durationMs);
      }
    }

    res.json({
      success: true,
      message: 'Simulation completed',
      data: simulatedEntries
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { simulateQueue };
