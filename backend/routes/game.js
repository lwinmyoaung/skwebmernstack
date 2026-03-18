const express = require('express');
const { 
  getGames, 
  getAdminGames, 
  getGameById,
  updateGame, 
  createGame 
} = require('../controllers/game');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getGames);
router.get('/admin', protect, authorize('admin'), getAdminGames);
router.get('/:gameId', getGameById);
router.post('/', protect, authorize('admin'), createGame);
router.put('/:id', protect, authorize('admin'), updateGame);

module.exports = router;
