const express = require('express');
const { getSettings, updateSettings, syncProducts } = require('../controllers/setting');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.route('/')
  .get(getSettings)
  .post(updateSettings);

router.post('/sync', syncProducts);

module.exports = router;
