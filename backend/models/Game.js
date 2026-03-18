const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  gameId: {
    type: String,
    required: [true, 'Please add a game ID'],
    unique: true,
  },
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  badge: {
    type: String,
  },
  color: {
    type: String,
    default: 'from-blue-600/20 to-primary/20',
  },
  defaultImage: {
    type: String,
  },
  order: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Game', gameSchema);
