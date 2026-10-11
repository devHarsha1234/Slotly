const express = require('express');
const router = express.Router();
const { createStaff, getStaff, updateStaff, deactivateStaff } = require('../controllers/staffController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { staffSchema } = require('../validators/schemas');

router.route('/')
  .post(protect, authorize('provider'), validate(staffSchema), createStaff)
  .get(protect, authorize('provider'), getStaff);

router.route('/:id')
  .put(protect, authorize('provider'), validate(staffSchema), updateStaff)
  .delete(protect, authorize('provider'), deactivateStaff);

module.exports = router;
