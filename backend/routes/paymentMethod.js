const express = require('express');
const {
  getPaymentMethods,
  getAdminPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
} = require('../controllers/paymentMethod');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getPaymentMethods);

// Admin routes
router.use(protect);
router.use(authorize('admin'));

router.get('/admin', getAdminPaymentMethods);
router.post('/', createPaymentMethod);
router.put('/:id', updatePaymentMethod);
router.delete('/:id', deletePaymentMethod);

module.exports = router;
