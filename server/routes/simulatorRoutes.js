const express = require('express');
const router = express.Router();
const { simulateQueue } = require('../controllers/simulatorController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/simulate', protect, authorize('provider'), simulateQueue);

module.exports = router;
