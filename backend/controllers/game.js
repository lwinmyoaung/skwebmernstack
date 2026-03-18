const Game = require('../models/Game');

// @desc    Get all games
// @route   GET /api/v1/games
// @access  Public
exports.getGames = async (req, res, next) => {
  try {
    const games = await Game.find({ isActive: true }).sort('order');
    res.status(200).json({
      success: true,
      count: games.length,
      data: games,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get all games (Admin)
// @route   GET /api/v1/games/admin
// @access  Private/Admin
exports.getAdminGames = async (req, res, next) => {
  try {
    const games = await Game.find().sort('order');
    res.status(200).json({
      success: true,
      count: games.length,
      data: games,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get single game by gameId
// @route   GET /api/v1/games/:gameId
// @access  Public
exports.getGameById = async (req, res, next) => {
  try {
    const game = await Game.findOne({ gameId: req.params.gameId });

    if (!game) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }

    res.status(200).json({
      success: true,
      data: game,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update game status
// @route   PUT /api/v1/games/:id
// @access  Private/Admin
exports.updateGame = async (req, res, next) => {
  try {
    const game = await Game.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!game) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }

    res.status(200).json({
      success: true,
      data: game,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Create game (Internal/Admin)
// @route   POST /api/v1/games
// @access  Private/Admin
exports.createGame = async (req, res, next) => {
  try {
    const game = await Game.create(req.body);
    res.status(201).json({
      success: true,
      data: game,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
