const axios = require('axios');
const Setting = require('../models/Setting');
const { getGameProductModel } = require('../models/GameProduct');

const DEFAULT_EXTERNAL_API_BASE = 'http://163.44.196.36:8000';

// Helper to get endpoint based on game and region
const getExternalEndpoint = async (gameId, region) => {
  let baseUrl = DEFAULT_EXTERNAL_API_BASE;
  const mlbbBaseSetting = await Setting.findOne({ key: 'mlbb_api_base_url' });
  if (mlbbBaseSetting && mlbbBaseSetting.value) baseUrl = mlbbBaseSetting.value;

  if (gameId === 'mlbb') {
    switch (region) {
      case 'myanmar': return `${baseUrl}/mlproductsmm`;
      case 'malaysia': return `${baseUrl}/mlproductsmy`;
      case 'philippines': return `${baseUrl}/mlproductsph`;
      case 'singapore': return `${baseUrl}/mlproductssg`;
      case 'indonesia': return `${baseUrl}/mlproductsind`;
      case 'russia': return `${baseUrl}/mlproductsru`;
      default: return `${baseUrl}/mlproductsmm`;
    }
  } else if (gameId === 'pubg') {
    const pubgSetting = await Setting.findOne({ key: 'pubg_api_products_url' });
    return pubgSetting ? pubgSetting.value : `${baseUrl}/products`;
  } else if (gameId === 'mcgg') {
    const mcggSetting = await Setting.findOne({ key: 'mcgg_api_products_url' });
    return mcggSetting ? mcggSetting.value : `${baseUrl}/mcgg/products`;
  } else if (gameId === 'wwm') {
    const wwmSetting = await Setting.findOne({ key: 'wwm_api_products_url' });
    return wwmSetting ? wwmSetting.value : `${baseUrl}/wwm/products`;
  }
  return null;
};

// @desc    Get all products for users from user[game]products collections
// @route   GET /api/v1/products/:gameId
// @access  Public
exports.getProductsByGame = async (req, res, next) => {
  try {
    const { gameId } = req.params;
    const { region } = req.query;

    const UserModel = getGameProductModel(gameId, 'user');
    const products = await UserModel.find({ region: region || 'myanmar', status: 'active' }).sort('price');

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: err.message
    });
  }
};

// @desc    Get products for admin from admin[game]products collections
// @route   GET /api/v1/products/admin/:gameId
// @access  Private/Admin
exports.getAdminProducts = async (req, res, next) => {
  try {
    const { gameId } = req.params;
    const { region } = req.query;

    const AdminModel = getGameProductModel(gameId, 'admin');
    const query = region ? { region } : {};
    const dbProducts = await AdminModel.find(query).sort('price');
    
    // Get Live Data for comparison
    let liveProducts = [];
    const endpoint = await getExternalEndpoint(gameId, region || 'myanmar');
    if (endpoint) {
      try {
        const response = await axios.get(endpoint);
        let rawData = response.data;
        if (gameId === 'mlbb') liveProducts = rawData.products || [];
        else if (gameId === 'pubg') liveProducts = [...(rawData.UC || []), ...(rawData.Other || []), ...(rawData.BP || [])];
        else if (gameId === 'mcgg') liveProducts = [...(rawData.Diamonds || []), ...(rawData.Topup || []), ...(rawData.Weekly || []), ...(rawData.Other || [])];
        else if (gameId === 'wwm') liveProducts = rawData.data || [];
      } catch (e) {
        console.error('Live API fetch failed for admin view');
      }
    }
    
    const combined = dbProducts.map(dp => {
      const lp = liveProducts.find(p => p.product_id === dp.product_id);
      return {
        ...dp._doc,
        live_price: lp ? (lp.price || lp.price_value || 0) : null,
        live_name: lp ? lp.name : null
      };
    });

    res.status(200).json({
      success: true,
      count: combined.length,
      data: combined,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Bulk update product prices for a game category
// @route   PUT /api/v1/products/admin/:gameId/bulk-price
// @access  Private/Admin
exports.bulkUpdatePrices = async (req, res, next) => {
  try {
    const { gameId } = req.params;
    const { percentage, region } = req.body;

    if (percentage === undefined || isNaN(percentage)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid percentage value' });
    }

    // Calculate multiplier from percentage (e.g., 10% -> 1.1, -5% -> 0.95)
    const multiplier = 1 + (percentage / 100);

    const AdminModel = getGameProductModel(gameId, 'admin');
    const UserModel = getGameProductModel(gameId, 'user');
    
    const query = region ? { region } : {};

    // Multiply both price and selling_price to keep them in sync
    await AdminModel.updateMany(query, { $mul: { price: multiplier, selling_price: multiplier } });
    await UserModel.updateMany(query, { $mul: { price: multiplier, selling_price: multiplier } });

    res.status(200).json({
      success: true,
      message: `Successfully updated prices for ${gameId} by ${percentage}%`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update admin product AND sync to user collection
// @route   PUT /api/v1/products/:gameId/:id
// @access  Private/Admin
exports.updateProduct = async (req, res, next) => {
  try {
    const { gameId, id } = req.params;
    const AdminModel = getGameProductModel(gameId, 'admin');
    const UserModel = getGameProductModel(gameId, 'user');

    const adminProduct = await AdminModel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!adminProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Sync to user table
    await UserModel.findOneAndUpdate(
      { product_id: adminProduct.product_id, region: adminProduct.region },
      {
        name: adminProduct.name,
        price: adminProduct.price,
        diamonds: adminProduct.diamonds,
        region: adminProduct.region,
        status: adminProduct.status,
        category: adminProduct.category
      },
      { upsert: true }
    );

    res.status(200).json({
      success: true,
      data: adminProduct,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Publish all products for a region from admin to user collection
// @route   POST /api/v1/products/admin/:gameId/publish
// @access  Private/Admin
exports.publishProducts = async (req, res, next) => {
  try {
    const { gameId } = req.params;
    const { region } = req.body;

    if (!region) {
      return res.status(400).json({ success: false, message: 'Region is required' });
    }

    const AdminModel = getGameProductModel(gameId, 'admin');
    const UserModel = getGameProductModel(gameId, 'user');

    const adminProducts = await AdminModel.find({ region });

    if (adminProducts.length === 0) {
      return res.status(200).json({
        success: true,
        message: `No products found in admin table for ${gameId} in region ${region}. Nothing to publish.`,
      });
    }

    const bulkOps = adminProducts.map(p => ({
      updateOne: {
        filter: { product_id: p.product_id, region: p.region },
        update: {
          $set: {
            name: p.name,
            price: p.price,
            diamonds: p.diamonds,
            status: p.status,
            category: p.category,
          },
        },
        upsert: true,
      },
    }));

    await UserModel.bulkWrite(bulkOps);

    res.status(200).json({
      success: true,
      message: `${adminProducts.length} products for ${region} have been published to the live user view.`,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: 'Failed to publish products',
      error: err.message,
    });
  }
};

// @desc    Delete product from both admin and user collections
// @route   DELETE /api/v1/products/:gameId/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res, next) => {
  try {
    const { gameId, id } = req.params;
    const AdminModel = getGameProductModel(gameId, 'admin');
    const UserModel = getGameProductModel(gameId, 'user');

    const product = await AdminModel.findById(id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    await UserModel.deleteOne({ product_id: product.product_id, region: product.region });
    await product.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Create a product in both collections
// @route   POST /api/v1/products/:gameId
// @access  Private/Admin
exports.createProduct = async (req, res, next) => {
  try {
    const { gameId } = req.params;
    const AdminModel = getGameProductModel(gameId, 'admin');
    const UserModel = getGameProductModel(gameId, 'user');

    const product = await AdminModel.create(req.body);
    await UserModel.create(req.body);

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
