const express = require('express');
const router = express.Router();
const { getMyActiveQueueEntry, getQueue, startService, completeService, addWalkIn, updateQueueStatus } = require('../controllers/queueController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/customer/active', protect, getMyActiveQueueEntry);
router.get('/:businessId', getQueue);
router.post('/walk-in', protect, authorize('provider'), addWalkIn);
router.put('/:id/start', protect, authorize('provider'), startService);
router.put('/:id/complete', protect, authorize('provider'), completeService);
router.put('/:id/status', protect, authorize('provider'), updateQueueStatus);

module.exports = router;
