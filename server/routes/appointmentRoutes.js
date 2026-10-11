const express = require('express');
const router = express.Router();
const { createAppointment, getAppointments, updateAppointmentStatus } = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { appointmentSchema } = require('../validators/schemas');

router.route('/')
  .post(protect, validate(appointmentSchema), createAppointment)
  .get(protect, getAppointments);

router.put('/:id/status', protect, updateAppointmentStatus);

module.exports = router;
