const PaymentMethod = require('../models/PaymentMethod');
const multer = require('multer');
const path = require('path');

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: '../frontend/public/uploads/paymentmethods',
  filename: function(req, file, cb) {
    cb(null, 'payment-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // Increased to 5MB
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images Only!');
    }
  }
}).single('image');

// @desc    Get all payment methods
// @route   GET /api/v1/payment-methods
// @access  Public
exports.getPaymentMethods = async (req, res, next) => {
  try {
    const methods = await PaymentMethod.find({ status: 'active' });
    res.status(200).json({ success: true, count: methods.length, data: methods });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get all payment methods (admin)
// @route   GET /api/v1/payment-methods/admin
// @access  Private/Admin
exports.getAdminPaymentMethods = async (req, res, next) => {
  try {
    const methods = await PaymentMethod.find();
    res.status(200).json({ success: true, count: methods.length, data: methods });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Create payment method
// @route   POST /api/v1/payment-methods
// @access  Private/Admin
exports.createPaymentMethod = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err });
    }
    
    const { name, phone_number, status } = req.body;
    const image = req.file ? `/uploads/paymentmethods/${req.file.filename}` : '';

    if (!name || !phone_number || !image) {
      return res.status(400).json({ success: false, message: 'Please provide all fields and an image.' });
    }

    try {
      const method = await PaymentMethod.create({ name, phone_number, status, image });
      res.status(201).json({ success: true, data: method });
    } catch (dbErr) {
      res.status(400).json({ success: false, message: dbErr.message });
    }
  });
};

// @desc    Update payment method
// @route   PUT /api/v1/payment-methods/:id
// @access  Private/Admin
exports.updatePaymentMethod = async (req, res, next) => {
  try {
    const method = await PaymentMethod.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!method) {
      return res.status(404).json({ success: false, message: 'Payment method not found' });
    }
    res.status(200).json({ success: true, data: method });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Delete payment method
// @route   DELETE /api/v1/payment-methods/:id
// @access  Private/Admin
exports.deletePaymentMethod = async (req, res, next) => {
  try {
    const method = await PaymentMethod.findByIdAndDelete(req.params.id);
    if (!method) {
      return res.status(404).json({ success: false, message: 'Payment method not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
