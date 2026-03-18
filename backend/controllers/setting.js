const Setting = require('../models/Setting');
const axios = require('axios');
const { getGameProductModel } = require('../models/GameProduct');

// @desc    Get all settings
// @route   GET /api/v1/settings
// @access  Private/Admin
exports.getSettings = async (req, res, next) => {
  try {
    const settings = await Setting.find();
    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Update settings
// @route   POST /api/v1/settings
// @access  Private/Admin
exports.updateSettings = async (req, res, next) => {
  try {
    const { settings } = req.body;

    for (const key in settings) {
      await Setting.findOneAndUpdate(
        { key },
        { value: settings[key] },
        { upsert: true, new: true }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Sync products from external API to admin[game]products collections
// @route   POST /api/v1/settings/sync
// @access  Private/Admin
exports.syncProducts = async (req, res, next) => {
  try {
    const mlbbBaseUrlSetting = await Setting.findOne({ key: 'mlbb_api_base_url' });
    const baseUrl = mlbbBaseUrlSetting ? mlbbBaseUrlSetting.value : 'http://163.44.196.36:8000';
    
    const endpoints = [
      { game: 'mlbb', url: `${baseUrl}/mlproductsmm`, region: 'myanmar' },
      { game: 'mlbb', url: `${baseUrl}/mlproductsmy`, region: 'malaysia' },
      { game: 'mlbb', url: `${baseUrl}/mlproductsph`, region: 'philippines' },
      { game: 'mlbb', url: `${baseUrl}/mlproductssg`, region: 'singapore' },
      { game: 'mlbb', url: `${baseUrl}/mlproductsind`, region: 'indonesia' },
      { game: 'mlbb', url: `${baseUrl}/mlproductsru`, region: 'russia' },
      { game: 'pubg', url: `${baseUrl}/products`, region: 'myanmar' },
      { game: 'mcgg', url: `${baseUrl}/mcgg/products`, region: 'myanmar' },
      { game: 'wwm', url: `${baseUrl}/wwm/products`, region: 'myanmar' },
    ];

    let totalSynced = 0;

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(endpoint.url);
        let rawData = response.data;
        let products = [];

        if (endpoint.game === 'mlbb') products = rawData.products || [];
        else if (endpoint.game === 'pubg') products = [...(rawData.UC || []), ...(rawData.Other || []), ...(rawData.BP || [])];
        else if (endpoint.game === 'mcgg') products = [...(rawData.Diamonds || []), ...(rawData.Topup || []), ...(rawData.Weekly || []), ...(rawData.Other || [])];
        else if (endpoint.game === 'wwm') products = rawData.data || [];

        const AdminModel = getGameProductModel(endpoint.game, 'admin');

        for (const p of products) {
          const apiPrice = p.price || p.price_value || 0;
          await AdminModel.findOneAndUpdate(
            { product_id: p.product_id, region: endpoint.region },
            {
              name: p.name || (p.diamonds ? `${p.diamonds} Diamonds` : (p.uc ? `${p.uc} UC` : 'Product')),
              price: apiPrice,
              original_price: apiPrice,
              diamonds: p.diamonds || p.uc || 0,
              region: endpoint.region,
              category: p.currency_code || 'MMK',
              status: 'active'
            },
            { upsert: true }
          );
          totalSynced++;
        }
      } catch (err) {
        console.error(`Failed to sync ${endpoint.game} for ${endpoint.region}: ${err.message}`);
      }
    }

    res.status(200).json({
      success: true,
      message: `Sync completed. ${totalSynced} products processed across all admin tables.`,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Sync failed',
      error: err.message
    });
  }
};
