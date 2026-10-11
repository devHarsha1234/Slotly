const Staff = require('../models/Staff');
const Business = require('../models/Business');

// @desc    Add staff
// @route   POST /api/staff
// @access  Private/Provider
const createStaff = async (req, res, next) => {
  try {
    const business = await Business.findOne({ owner: req.user._id });
    if (!business) {
      res.status(404);
      throw new Error('Business not found');
    }

    const staff = await Staff.create({
      ...req.body,
      business: business._id
    });

    res.status(201).json({ success: true, data: staff });
  } catch (error) {
    next(error);
  }
};

// @desc    Get staff
// @route   GET /api/staff
// @access  Private/Provider
const getStaff = async (req, res, next) => {
  try {
    const business = await Business.findOne({ owner: req.user._id });
    if (!business) return res.json({ success: true, data: [] });

    const staff = await Staff.find({ business: business._id }).populate('services');
    res.json({ success: true, data: staff });
  } catch (error) {
    next(error);
  }
};

// @desc    Update staff
// @route   PUT /api/staff/:id
// @access  Private/Provider
const updateStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id).populate('business');
    if (!staff || staff.business.owner.toString() !== req.user._id.toString()) {
      res.status(404);
      throw new Error('Staff not found or not authorized');
    }

    const updatedStaff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('services');
    res.json({ success: true, data: updatedStaff });
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate staff
// @route   DELETE /api/staff/:id
// @access  Private/Provider
const deactivateStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id).populate('business');
    if (!staff || staff.business.owner.toString() !== req.user._id.toString()) {
      res.status(404);
      throw new Error('Staff not found or not authorized');
    }

    staff.active = false;
    await staff.save();
    res.json({ success: true, message: 'Staff deactivated' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createStaff, getStaff, updateStaff, deactivateStaff };
