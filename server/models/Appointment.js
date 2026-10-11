const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  date: {
    type: Date,
    required: true
  },
  scheduledStart: {
    type: Date,
    required: true
  },
  scheduledEnd: {
    type: Date,
    required: true
  },
  expectedDuration: {
    type: Number,
    required: true
  },
  actualDuration: Number,
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'serving', 'completed', 'cancelled', 'no_show'],
    default: 'scheduled'
  },
  source: {
    type: String,
    enum: ['appointment', 'walk_in'],
    default: 'appointment'
  },
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
