const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
  },
  image: {
    type: String,
    required: [true, 'Please add an image path'],
  },
  phone_number: {
    type: String,
    required: [true, 'Please add a phone number'],
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);
