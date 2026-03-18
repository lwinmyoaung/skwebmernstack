const express = require('express');
const { 
  getSlideshows, 
  getAdminSlideshows, 
  createSlideshow, 
  updateSlideshow, 
  deleteSlideshow,
  seedSlideshows
} = require('../controllers/slideshow');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getSlideshows);
router.get('/admin', protect, authorize('admin'), getAdminSlideshows);
router.post('/seed', protect, authorize('admin'), seedSlideshows);
router.post('/', protect, authorize('admin'), createSlideshow);
router.put('/:id', protect, authorize('admin'), updateSlideshow);
router.delete('/:id', protect, authorize('admin'), deleteSlideshow);

module.exports = router;
