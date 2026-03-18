const express = require('express');
const {
  getLogos,
  getAdminLogos,
  createLogo,
  updateLogo,
  deleteLogo,
  seedDefaultLogo
} = require('../controllers/logo');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getLogos);

// Protected Admin routes
router.post('/seed', protect, authorize('admin'), seedDefaultLogo);
router.get('/admin', protect, authorize('admin'), getAdminLogos);
router.post('/', protect, authorize('admin'), createLogo);
router.put('/:id', protect, authorize('admin'), updateLogo);
router.delete('/:id', protect, authorize('admin'), deleteLogo);

module.exports = router;
