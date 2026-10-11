const Service = require('../models/Service');
const Business = require('../models/Business');

// @desc    Create a service
// @route   POST /api/services
// @access  Private/Provider
const createService = async (req, res, next) => {
  try {
    const business = await Business.findOne({ owner: req.user._id });
    if (!business) {
      res.status(404);
      throw new Error('Business not found for this provider');
    }

    const service = await Service.create({
      ...req.body,
      business: business._id
    });

    res.status(201).json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
};

// @desc    Get services for logged in provider's business
// @route   GET /api/services
// @access  Private/Provider
const getServices = async (req, res, next) => {
  try {
    const business = await Business.findOne({ owner: req.user._id });
    if (!business) {
      return res.json({ success: true, data: [] });
    }

    const services = await Service.find({ business: business._id });
    res.json({ success: true, data: services });
  } catch (error) {
    next(error);
  }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private/Provider
const updateService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id).populate('business');
    if (!service) {
      res.status(404);
      throw new Error('Service not found');
    }

    if (service.business.owner.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this service');
    }

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: updatedService });
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate service (soft delete)
// @route   DELETE /api/services/:id
// @access  Private/Provider
const deactivateService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id).populate('business');
    if (!service) {
      res.status(404);
      throw new Error('Service not found');
    }

    if (service.business.owner.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete this service');
    }

    service.active = false;
    await service.save();

    res.json({ success: true, message: 'Service deactivated' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createService,
  getServices,
  updateService,
  deactivateService
};
