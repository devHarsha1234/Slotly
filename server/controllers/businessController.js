const Business = require('../models/Business');
const Service = require('../models/Service');
const Staff = require('../models/Staff');

// @desc    Get all businesses
// @route   GET /api/businesses
// @access  Public
const getBusinesses = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    let query = { status: 'active' };

    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };

    const businesses = await Business.find(query).select('-owner');
    res.json({ success: true, data: businesses });
  } catch (error) {
    next(error);
  }
};

// @desc    Get business by ID (with services and staff)
// @route   GET /api/businesses/:id
// @access  Public
const getBusinessById = async (req, res, next) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) {
      res.status(404);
      throw new Error('Business not found');
    }
    
    const services = await Service.find({ business: business._id, active: true });
    const staff = await Staff.find({ business: business._id, active: true }).populate('services');

    res.json({ 
      success: true, 
      data: {
        business,
        services,
        staff
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update business profile
// @route   PUT /api/businesses/:id
// @access  Private/Provider
const updateBusiness = async (req, res, next) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) {
      res.status(404);
      throw new Error('Business not found');
    }

    if (business.owner.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('User not authorized to update this business');
    }

    const updatedBusiness = await Business.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: updatedBusiness });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBusinesses,
  getBusinessById,
  updateBusiness
};
