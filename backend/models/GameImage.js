const mongoose = require('mongoose');

const gameImageSchema = new mongoose.Schema({
  gameId: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
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

module.exports = mongoose.model('GameImage', gameImageSchema);
