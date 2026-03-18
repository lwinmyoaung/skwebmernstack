const express = require('express');
const { createOrder, getMyOrders, getOrder, getAllOrders, updateOrderStatus, getProfitStats, deleteOldOrders } = require('../controllers/order');
const { protect, optionalProtect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', optionalProtect, createOrder); // Changed to optionalProtect to allow guest orders
router.get('/my-orders', protect, getMyOrders); // Changed from /me to /my-orders for consistency with frontend
router.get('/profit-stats', protect, authorize('admin'), getProfitStats);
router.get('/', protect, authorize('admin'), getAllOrders);
router.get('/:id', protect, getOrder);
router.delete('/old', protect, authorize('admin'), deleteOldOrders);
router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);

module.exports = router;
