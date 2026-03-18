const express = require('express');
const { getMessages, markAsRead, markAllAsRead, deleteMessage } = require('../controllers/message');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(protect, getMessages);

router.route('/read-all')
  .put(protect, markAllAsRead);

router.route('/:id/read')
  .put(protect, markAsRead);

router.route('/:id')
  .delete(protect, deleteMessage);

module.exports = router;
