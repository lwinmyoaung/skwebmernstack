const mongoose = require('mongoose');

const howToUseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
  },
  videoUrl: {
    type: String,
    required: [true, 'Please add a video URL'],
  },
  description: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('HowToUse', howToUseSchema);
