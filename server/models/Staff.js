const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: String,
  phone: String,
  role: String,
  services: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],
  availability: {
    type: Map,
    of: {
      start: String,
      end: String,
      isAvailable: Boolean
    }
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema);
