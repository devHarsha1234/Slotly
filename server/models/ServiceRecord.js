const mongoose = require('mongoose');

const serviceRecordSchema = new mongoose.Schema({
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  expectedDuration: {
    type: Number,
    required: true
  },
  actualDuration: {
    type: Number,
    required: true
  },
  delayMinutes: {
    type: Number,
    required: true
  },
  startedAt: {
    type: Date,
    required: true
  },
  completedAt: {
    type: Date,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('ServiceRecord', serviceRecordSchema);
