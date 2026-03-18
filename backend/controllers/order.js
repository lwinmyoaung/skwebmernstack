const Order = require('../models/Order');
const User = require('../models/User');
const { getGameProductModel } = require('../models/GameProduct');
const { buyProduct } = require('./gameService');
const Message = require('../models/Message');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer setup for transaction images
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, '../../frontend/public/uploads/transactions');
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    cb(null, 'transaction-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images Only!');
    }
  }
}).single('transactionImage');

const { protect, authorize } = require('../middleware/auth');

// @desc    Get profit stats
// @route   GET /api/v1/orders/profit-stats
// @access  Private/Admin
exports.getProfitStats = async (req, res, next) => {
  try {
    const { period } = req.query; // 'monthly' or 'yearly'
    const now = new Date();
    let startDate;

    if (period === 'yearly') {
      startDate = new Date(now.getFullYear(), 0, 1); // Start of current year
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1); // Start of current month
    }

    const stats = await Order.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: period === 'yearly' 
            ? { month: { $month: "$createdAt" } }
            : { day: { $dayOfMonth: "$createdAt" } },
          totalRevenue: { $sum: "$selling_price" },
          totalCost: { $sum: "$cost_price" },
          totalProfit: { $sum: "$profit" },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Get overall totals for the period
    const totals = await Order.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$selling_price" },
          totalCost: { $sum: "$cost_price" },
          totalProfit: { $sum: "$profit" },
          orderCount: { $sum: 1 }
        }
      }
    ]);

    // Get profit by game
    const gameStats = await Order.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: "$game",
          profit: { $sum: "$profit" },
          orders: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      period,
      data: stats,
      totals: totals[0] || { totalRevenue: 0, totalCost: 0, totalProfit: 0, orderCount: 0 },
      gameStats
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create an order
// @route   POST /api/v1/orders
// @access  Public
exports.createOrder = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ success: false, message: err });
    }

    try {
      console.log('Order submission received:', req.body);
      console.log('File received:', req.file);
      const { productId, playerId, serverId, gameId, paymentMethod, userPhone, nickname } = req.body;
      const transactionImage = req.file ? `/uploads/transactions/${req.file.filename}` : '';

      if (!productId || !playerId || !gameId || !userPhone || !transactionImage) {
        console.log('Validation failed:', { productId, playerId, gameId, userPhone, transactionImage });
        return res.status(400).json({ success: false, message: 'Please provide all required fields (including payment screenshot)' });
      }

      // Use the authenticated user from middleware (optional)
      let user = req.user;

      // MANDATORY: Ensure user account exists for the provided phone number
      if (userPhone) {
        const sanitizedPhone = userPhone.replace(/\D/g, '');
        console.log('--- START USER LINKING ---');
        console.log('Phone:', userPhone, 'Sanitized:', sanitizedPhone);
        
        try {
          // 1. Try to find existing user
          user = await User.findOne({ phone: sanitizedPhone });
          
          if (user) {
            console.log('Found existing user:', user._id, 'Name:', user.name);
            // Update name if it's currently generic and a nickname was provided
            if (nickname && nickname.trim() && (user.name === user.phone || user.name === 'Guest User' || user.name === 'Anonymous User')) {
              user.name = nickname.trim();
              await user.save();
              console.log('Updated user name to:', user.name);
            }
          } else {
            console.log('No user found, creating new account...');
            // 2. Create new user if not found
            user = await User.create({
              name: (nickname || userPhone).trim() || 'Guest User',
              phone: sanitizedPhone,
              password: sanitizedPhone, // Default password is their phone number
              role: 'user',
              email: undefined
            });
            console.log('NEW USER CREATED SUCCESSFULLY:', user._id);
          }
        } catch (userErr) {
          console.error('DATABASE ERROR during user management:', userErr);
          
          // Handle potential race condition (another process created the user between find and create)
          if (userErr.code === 11000) {
            console.log('Race condition: user was created elsewhere, fetching...');
            user = await User.findOne({ phone: sanitizedPhone });
          }
          
          if (!user) {
            console.error('COULD NOT LINK OR CREATE USER:', userErr.message);
            throw new Error(`Account Linking Failed: ${userErr.message}`);
          }
        }
        console.log('--- END USER LINKING ---');
      }

      if (!user) {
        console.error('CRITICAL: No user found/created for order!');
        throw new Error('Could not determine user for this order. Please provide a valid phone number.');
      }

      // 2. Get Product Info
      const UserModel = getGameProductModel(gameId, 'user');
      const product = await UserModel.findOne({ product_id: productId });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      // 3. Create Order
      const orderData = {
        user_phone: userPhone,
        game: gameId,
        product_id: product.product_id,
        product_name: product.name,
        player_id: playerId,
        nickname: nickname,
        server_id: serverId,
        selling_price: product.price,
        cost_price: product.original_price || (product.price * 0.9),
        profit: product.price - (product.original_price || (product.price * 0.9)),
        payment_method: paymentMethod || 'KPay',
        transaction_image: transactionImage,
        status: 'pending',
      };

      // If user is logged in, attach their ID
      if (user) {
        orderData.user = user._id;
      }

      const order = await Order.create(orderData);

      // Emit newOrder to admins
      if (req.io) {
        req.io.to('admin').emit('newOrder', order);
      }

      // Generate token for auto-login/tracking if guest
      let token;
      if (!req.user && user) {
        token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
          expiresIn: '2d',
        });

        // Store token in DB (user session tracking)
        user.currentSessionToken = token;
        await user.save();

        // Set cookie for 2 days
        const options = {
          expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        };
        
        res.cookie('token', token, options);
      }

      res.status(201).json({
        success: true,
        token, // Return token for guest orders
        user: user ? {
          id: user._id,
          name: user.name,
          phone: user.phone,
          role: user.role
        } : null,
        data: order,
      });
    } catch (error) {
      console.error('Order creation error:', error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  });
};

// @desc    Update order status (Admin only)
// @route   PUT /api/v1/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    
    if (!['completed', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status update',
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // If status is being set to completed, perform real buy
    if (status === 'completed' && order.status !== 'completed') {
      const buyResult = await buyProduct(order);
      if (!buyResult.success) {
        return res.status(500).json({
          success: false,
          message: `Provider error: ${buyResult.message}. Order status not updated.`,
        });
      }
    }

    order.status = status;
    if (status === 'rejected') {
      order.rejection_reason = rejectionReason;
    } else {
      order.rejection_reason = undefined;
    }

    await order.save();

    // Create a message for the user if they have an account
    if (order.user) {
      const title = status === 'completed' ? 'Order Successful' : 'Order Rejected';
      const content = status === 'completed' 
        ? `Your premium top-up for ${order.product_name} in ${order.game} has been successfully delivered to your game account (ID: ${order.player_id}).`
        : `Your order for ${order.product_name} was rejected. Reason: ${rejectionReason || "Please contact support."}`;
      
      try {
        const message = await Message.create({
          user: order.user,
          order: order._id,
          title,
          content,
          type: status === 'completed' ? 'success' : 'error'
        });

        // Emit to user personal room
        if (req.io) {
          req.io.to(order.user.toString()).emit('orderUpdated', {
            orderId: order._id,
            status: status,
            title,
            content,
            messageId: message._id
          });
        }
      } catch (msgErr) {
        console.error('Error creating notification message:', msgErr.message);
      }
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Delete old orders (completed or rejected)
// @route   DELETE /api/v1/orders/old
// @access  Private/Admin
exports.deleteOldOrders = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const date = new Date();
    date.setDate(date.getDate() - parseInt(days));

    // Find orders to be deleted to get their image paths
    const ordersToDelete = await Order.find({
      status: { $in: ['completed', 'rejected'] },
      createdAt: { $lt: date }
    });

    let deletedCount = 0;
    let imagesDeleted = 0;

    for (const order of ordersToDelete) {
      // 1. Delete the physical image file if it exists
      if (order.transaction_image) {
        // Extract filename from URL (e.g., /uploads/transactions/image.jpg -> image.jpg)
        const filename = order.transaction_image.split('/').pop();
        const filePath = path.join(__dirname, '../../frontend/public/uploads/transactions', filename);
        
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            imagesDeleted++;
          }
        } catch (fileErr) {
          console.error(`Failed to delete image for order ${order._id}:`, fileErr.message);
        }
      }

      // 2. Delete the order record
      await Order.findByIdAndDelete(order._id);
      deletedCount++;
    }

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${deletedCount} old orders and ${imagesDeleted} transaction images.`,
      count: deletedCount,
      imagesDeleted
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Get all orders for the logged-in user
// @route   GET /api/v1/orders/me
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Get single order for the logged-in user
// @route   GET /api/v1/orders/:id
// @access  Private
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Ensure the order belongs to the user or user is admin
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to access this order' });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/v1/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort('-createdAt');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
