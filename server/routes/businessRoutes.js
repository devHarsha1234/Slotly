const express = require('express');
const router = express.Router();
const { getBusinesses, getBusinessById, updateBusiness } = require('../controllers/businessController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/').get(getBusinesses);
router.route('/:id').get(getBusinessById).put(protect, authorize('provider'), updateBusiness);

module.exports = router;
