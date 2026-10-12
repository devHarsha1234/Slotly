const QueueEntry = require('../models/QueueEntry');
const Appointment = require('../models/Appointment');
const ServiceRecord = require('../models/ServiceRecord');
const Business = require('../models/Business');
const Service = require('../models/Service');
const Staff = require('../models/Staff');
const User = require('../models/User');
const { recalculateQueue } = require('../services/queueService');
const { updateServiceExpectedDuration } = require('../services/learningService');
const { generateUniqueQueueToken } = require('../utils/tokenGenerator');

// @desc    Get active queue entry for the authenticated customer
// @route   GET /api/queue/customer/active
// @access  Private
const getMyActiveQueueEntry = async (req, res, next) => {
  try {
    const customerId = req.user._id;

    // Find all appointment IDs for this customer
    const userAppointments = await Appointment.find({ customer: customerId }).select('_id');
    const appointmentIds = userAppointments.map((a) => a._id);

    // 1. Authoritatively prioritize finding if this customer has a currently 'serving' entry
    let activeEntry = await QueueEntry.findOne({
      $or: [
        { customer: customerId },
        { appointment: { $in: appointmentIds } }
      ],
      status: 'serving'
    })
    .populate('service')
    .populate('business')
    .populate('staff', 'name role')
    .populate('customer', 'name email phone')
    .populate({
      path: 'appointment',
      select: 'scheduledStart scheduledEnd expectedDuration status source customer date',
      populate: { path: 'customer', select: 'name email phone' }
    });

    // 2. If not currently serving, find their next 'waiting' entry (ordered by position ascending)
    if (!activeEntry) {
      activeEntry = await QueueEntry.findOne({
        $or: [
          { customer: customerId },
          { appointment: { $in: appointmentIds } }
        ],
        status: 'waiting'
      })
      .populate('service')
      .populate('business')
      .populate('staff', 'name role')
      .populate('customer', 'name email phone')
      .populate({
        path: 'appointment',
        select: 'scheduledStart scheduledEnd expectedDuration status source customer date',
        populate: { path: 'customer', select: 'name email phone' }
      })
      .sort({ position: 1, estimatedStart: 1 });
    }

    let servingEntry = null;
    if (activeEntry) {
      const bId = activeEntry.business._id || activeEntry.business;
      servingEntry = await QueueEntry.findOne({
        business: bId,
        status: 'serving'
      }).select('token');
    }

    res.json({
      success: true,
      data: activeEntry ? {
        entry: activeEntry,
        position: activeEntry.position,
        servingToken: servingEntry ? servingEntry.token : 'None'
      } : null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get live queue for a business
// @route   GET /api/queue/:businessId
// @access  Public
const getQueue = async (req, res, next) => {
  try {
    const entries = await QueueEntry.find({ 
      business: req.params.businessId,
      status: { $in: ['waiting', 'serving'] }
    })
    .populate('service')
    .populate('customer', 'name email phone')
    .populate({
      path: 'appointment',
      select: 'scheduledStart scheduledEnd expectedDuration status source customer',
      populate: { path: 'customer', select: 'name email phone' }
    })
    .populate('staff', 'name role')
    .sort({ position: 1 });
    
    res.json({ success: true, data: entries });
  } catch (error) {
    next(error);
  }
};

// @desc    Start service for a queue entry
// @route   PUT /api/queue/:id/start
// @access  Private/Provider
const startService = async (req, res, next) => {
  try {
    const entry = await QueueEntry.findById(req.params.id).populate('service').populate('business');
    if (!entry) {
      res.status(404);
      throw new Error('Queue entry not found');
    }

    if (entry.business.owner.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to modify this queue entry');
    }

    entry.status = 'serving';
    entry.actualStart = new Date();
    await entry.save();
    
    if (entry.appointment) {
      await Appointment.findByIdAndUpdate(entry.appointment, { status: 'serving' });
    }

    const businessId = entry.business._id || entry.business;
    await recalculateQueue(businessId, entry.staff);

    res.json({ success: true, data: entry });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete service
// @route   PUT /api/queue/:id/complete
// @access  Private/Provider
const completeService = async (req, res, next) => {
  try {
    const entry = await QueueEntry.findById(req.params.id).populate('service').populate('business');
    if (!entry) {
      res.status(404);
      throw new Error('Queue entry not found');
    }

    if (entry.business.owner.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to modify this queue entry');
    }

    const { actualDurationMinutes: overrideDuration } = req.body;
    const now = new Date();
    const startedAt = entry.actualStart || entry.estimatedStart || now;
    
    const actualDurationMinutes = overrideDuration 
      ? parseInt(overrideDuration) 
      : Math.max(1, Math.round((now.getTime() - new Date(startedAt).getTime()) / 60000));
    
    // Effective completion time is when the service actually finished
    const completedAt = overrideDuration 
      ? new Date(new Date(startedAt).getTime() + actualDurationMinutes * 60000)
      : now;
    
    const expectedDuration = entry.service.expectedDurationMinutes;
    const delay = actualDurationMinutes - expectedDuration;

    entry.status = 'completed';
    await entry.save();

    if (entry.appointment) {
      const appointment = await Appointment.findById(entry.appointment);
      if (appointment) {
        appointment.status = 'completed';
        appointment.actualDuration = actualDurationMinutes;
        await appointment.save();
      }
      
      // Create Service Record
      await ServiceRecord.create({
        appointment: entry.appointment,
        staff: entry.staff,
        service: entry.service._id,
        expectedDuration: expectedDuration,
        actualDuration: actualDurationMinutes,
        delayMinutes: delay,
        startedAt: startedAt,
        completedAt: completedAt
      });
    }

    // Trigger Adaptive Recalculation with effective completion time
    const businessId = entry.business._id || entry.business;
    await recalculateQueue(businessId, entry.staff, completedAt);
    
    // Trigger Service Duration Learning (asynchronously)
    updateServiceExpectedDuration(entry.service._id).catch(console.error);

    res.json({ success: true, message: 'Service completed, downstream recalculated', delay, actualDurationMinutes });
  } catch (error) {
    next(error);
  }
};

// @desc    Add walk-in
// @route   POST /api/queue/walk-in
// @access  Private/Provider
const addWalkIn = async (req, res, next) => {
  try {
    const { businessId, serviceId, staffId } = req.body;
    
    const business = await Business.findById(businessId);
    if (!business || business.owner.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to add walk-in to this business');
    }
    
    const position = await QueueEntry.countDocuments({ business: businessId, staff: staffId, status: { $in: ['waiting', 'serving'] } }) + 1;
    const token = await generateUniqueQueueToken(businessId, 'W');
    
    const entry = await QueueEntry.create({
      business: businessId,
      service: serviceId,
      staff: staffId,
      token,
      position,
      estimatedStart: new Date(),
      estimatedWaitMinutes: 0
    });
    
    await recalculateQueue(businessId, staffId);

    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    next(error);
  }
};

// @desc    Update queue entry status (cancelled, no_show)
// @route   PUT /api/queue/:id/status
// @access  Private/Provider
const updateQueueStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const entry = await QueueEntry.findById(req.params.id).populate('business');
    if (!entry) {
      res.status(404);
      throw new Error('Queue entry not found');
    }

    if (entry.business.owner.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to modify this queue entry');
    }

    entry.status = status;
    await entry.save();

    if (entry.appointment) {
      await Appointment.findByIdAndUpdate(entry.appointment, { status });
    }

    await recalculateQueue(entry.business._id, entry.staff);

    res.json({ success: true, data: entry });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyActiveQueueEntry,
  getQueue,
  startService,
  completeService,
  addWalkIn,
  updateQueueStatus
};
