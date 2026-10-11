const Appointment = require('../models/Appointment');
const Business = require('../models/Business');
const Service = require('../models/Service');
const QueueEntry = require('../models/QueueEntry');
const Staff = require('../models/Staff');
const { recalculateQueue } = require('../services/queueService');

// @desc    Book an appointment
// @route   POST /api/appointments
// @access  Private/Customer
const createAppointment = async (req, res, next) => {
  try {
    let { businessId, serviceId, staffId, date, scheduledStart } = req.body;

    const service = await Service.findById(serviceId);
    if (!service) {
      res.status(404);
      throw new Error('Service not found');
    }

    // Auto-resolve staff if not explicitly provided
    if (!staffId) {
      const activeStaff = await Staff.findOne({ business: businessId, services: serviceId, active: true })
        || await Staff.findOne({ business: businessId, active: true });
      if (activeStaff) {
        staffId = activeStaff._id;
      }
    }

    const expectedDuration = service.expectedDurationMinutes;
    const startTime = new Date(scheduledStart);
    const endTime = new Date(startTime.getTime() + expectedDuration * 60000);

    const appointment = await Appointment.create({
      customer: req.user._id,
      business: businessId,
      service: serviceId,
      staff: staffId || undefined,
      date: new Date(date),
      scheduledStart: startTime,
      scheduledEnd: endTime,
      expectedDuration
    });

    // Also add to Queue
    const query = { business: businessId, status: { $in: ['waiting', 'serving'] } };
    if (staffId) query.staff = staffId;
    const position = await QueueEntry.countDocuments(query) + 1;
    
    await QueueEntry.create({
      appointment: appointment._id,
      customer: req.user._id,
      business: businessId,
      service: serviceId,
      staff: staffId || undefined,
      token: `A-${Math.floor(100 + Math.random() * 900)}`,
      position,
      estimatedStart: startTime,
      estimatedWaitMinutes: 0
    });

    await recalculateQueue(businessId, staffId);

    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user appointments
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'customer') {
      query.customer = req.user._id;
    } else if (req.user.role === 'provider') {
      const business = await Business.findOne({ owner: req.user._id });
      if (business) {
        query.business = business._id;
      } else {
        return res.json({ success: true, data: [] });
      }
    }

    const appointments = await Appointment.find(query)
      .populate('business')
      .populate('service')
      .populate('staff')
      .sort({ scheduledStart: 1 });
      
    res.json({ success: true, data: appointments });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Private
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      res.status(404);
      throw new Error('Appointment not found');
    }

    if (req.user.role === 'customer' && appointment.customer.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to modify this appointment');
    }

    if (req.user.role === 'provider') {
      const business = await Business.findById(appointment.business);
      if (!business || business.owner.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to modify appointments for this business');
      }
    }

    appointment.status = status;
    await appointment.save();

    // If cancelled or no-show, we should also update queue and recalculate
    if (['cancelled', 'no_show'].includes(status)) {
      const queueEntry = await QueueEntry.findOne({ appointment: appointment._id });
      if (queueEntry) {
        queueEntry.status = status;
        await queueEntry.save();
        await recalculateQueue(queueEntry.business, queueEntry.staff);
      }
    }

    res.json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  updateAppointmentStatus
};
