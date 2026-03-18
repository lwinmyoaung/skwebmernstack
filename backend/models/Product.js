const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  game: {
    type: String,
    required: true,
    enum: ['mlbb', 'pubg', 'mcgg', 'wwm'],
  },
  product_id: {
    type: String,
    required: true,
  },
  category: {
    type: String,
  },
  name: {
    type: String,
    required: true,
  },
  diamonds: {
    type: Number,
  },
  price: {
    type: Number,
    required: true,
  },
  region: {
    type: String,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Product', productSchema);
