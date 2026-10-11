const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to access this user profile');
    }

    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (user._id.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this user');
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    
    if (req.body.password) {
       user.passwordHash = req.body.password;
    }

    const updatedUser = await user.save();
    const { passwordHash, ...userResponse } = updatedUser.toObject();
    
    res.json({ success: true, data: userResponse });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile
};
