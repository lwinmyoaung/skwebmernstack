const express = require('express');
const { register, login, getMe, getUsers, deleteUser, updateUserRole } = require('../controllers/auth');
const { protect, optionalProtect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/register', optionalProtect, register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/users', protect, authorize('admin'), getUsers);
router.put('/users/:id/role', protect, authorize('admin'), updateUserRole);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
