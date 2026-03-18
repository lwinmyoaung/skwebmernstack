const express = require('express');
const { 
  getProductsByGame, 
  getAdminProducts, 
  updateProduct, 
  deleteProduct, 
  createProduct,
  publishProducts,
  bulkUpdatePrices
} = require('../controllers/product');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/:gameId', getProductsByGame);
router.get('/admin/:gameId', protect, authorize('admin'), getAdminProducts);
router.put('/admin/:gameId/bulk-price', protect, authorize('admin'), bulkUpdatePrices);
router.post('/admin/:gameId/publish', protect, authorize('admin'), publishProducts);
router.post('/:gameId', protect, authorize('admin'), createProduct);
router.put('/:gameId/:id', protect, authorize('admin'), updateProduct);
router.delete('/:gameId/:id', protect, authorize('admin'), deleteProduct);

module.exports = router;
