const express = require('express');
const { 
  getHowToUse, 
  getAdminHowToUse, 
  createHowToUse, 
  deleteHowToUse
} = require('../controllers/howToUse');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getHowToUse);
router.get('/admin', protect, authorize('admin'), getAdminHowToUse);
router.post('/', protect, authorize('admin'), createHowToUse);
router.delete('/:id', protect, authorize('admin'), deleteHowToUse);

module.exports = router;
