const express = require('express');
const { 
  getGameImages, 
  getAdminGameImages, 
  createGameImage, 
  updateGameImage, 
  deleteGameImage,
  seedGameImages
} = require('../controllers/gameImage');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getGameImages);
router.get('/admin', protect, authorize('admin'), getAdminGameImages);
router.post('/seed', protect, authorize('admin'), seedGameImages);
router.post('/', protect, authorize('admin'), createGameImage);
router.put('/:id', protect, authorize('admin'), updateGameImage);
router.delete('/:id', protect, authorize('admin'), deleteGameImage);

module.exports = router;
