const mongoose = require('mongoose');

const queueEntrySchema = new mongoose.Schema({
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
  token: {
    type: String,
    required: true
  },
  position: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['waiting', 'serving', 'completed', 'cancelled', 'no_show'],
    default: 'waiting'
  },
  estimatedStart: {
    type: Date,
    required: true
  },
  estimatedWaitMinutes: {
    type: Number,
    required: true
  },
  actualStart: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('QueueEntry', queueEntrySchema);
