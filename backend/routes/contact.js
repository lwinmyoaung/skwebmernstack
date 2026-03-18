const express = require('express');
const { 
  getContacts, 
  getAdminContacts, 
  createContact, 
  updateContact, 
  deleteContact 
} = require('../controllers/contact');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getContacts);
router.get('/admin', protect, authorize('admin'), getAdminContacts);
router.post('/', protect, authorize('admin'), createContact);
router.put('/:id', protect, authorize('admin'), updateContact);
router.delete('/:id', protect, authorize('admin'), deleteContact);

module.exports = router;
