const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  platform: {
    type: String,
    required: [true, 'Please add a platform name (e.g., Facebook, Telegram, WhatsApp)'],
    trim: true,
  },
  value: {
    type: String,
    required: [true, 'Please add a number or link'],
    trim: true,
  },
  icon: {
    type: String,
    default: 'MessageCircle', // Default lucide-react icon name
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Contact', contactSchema);
