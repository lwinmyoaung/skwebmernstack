const mongoose = require('mongoose');

const gameProductSchema = new mongoose.Schema({
  product_id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  diamonds: {
    type: Number,
  },
  region: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  category: String,
  original_price: Number, // Only for admin tracking
}, {
  timestamps: true,
});

// Helper function to get model for specific game and type
const getGameProductModel = (game, type) => {
  const collectionName = `${type}${game}products`; // e.g., adminmlbbproducts, usermlbbproducts
  
  // Check if model already exists to prevent OverwriteModelError
  if (mongoose.models[collectionName]) {
    return mongoose.model(collectionName);
  }
  
  return mongoose.model(collectionName, gameProductSchema, collectionName);
};

module.exports = { getGameProductModel };
