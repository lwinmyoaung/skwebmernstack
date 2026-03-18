const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: false,
  },
  game: {
    type: String,
    required: true,
  },
  product_id: {
    type: String,
    required: true,
  },
  product_name: {
    type: String,
    required: true,
  },
  player_id: {
    type: String,
    required: true,
  },
  nickname: {
    type: String,
  },
  server_id: {
    type: String,
  },
  selling_price: {
    type: Number,
    required: true,
  },
  cost_price: {
    type: Number,
    required: true,
  },
  profit: {
    type: Number,
    required: true,
  },
  payment_method: {
    type: String,
    required: true,
  },
  user_phone: {
    type: String,
    required: true,
  },
  transaction_image: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled', 'rejected'],
    default: 'pending',
  },
  rejection_reason: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Order', orderSchema);
