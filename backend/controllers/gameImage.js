const GameImage = require('../models/GameImage');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer setup for game images
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, '../../frontend/public/uploads/game-images');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    cb(null, 'game-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images Only!');
    }
  }
}).single('image');

// @desc    Get all game images (Public)
// @route   GET /api/v1/game-images
// @access  Public
exports.getGameImages = async (req, res, next) => {
  try {
    const images = await GameImage.find({ isActive: true }).sort('order');
    res.status(200).json({
      success: true,
      count: images.length,
      data: images,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get all game images (Admin)
// @route   GET /api/v1/game-images/admin
// @access  Private/Admin
exports.getAdminGameImages = async (req, res, next) => {
  try {
    const images = await GameImage.find().sort('order');
    res.status(200).json({
      success: true,
      count: images.length,
      data: images,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Create a game image
// @route   POST /api/v1/game-images
// @access  Private/Admin
exports.createGameImage = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err });
    }

    try {
      const { gameId, order, isActive } = req.body;
      const image = req.file ? `/uploads/game-images/${req.file.filename}` : '';

      if (!image) {
        return res.status(400).json({ success: false, message: 'Please upload an image' });
      }

      if (!gameId) {
        return res.status(400).json({ success: false, message: 'Please select a game' });
      }

      const gameImage = await GameImage.create({
        gameId,
        image,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
      });

      res.status(201).json({
        success: true,
        data: gameImage,
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  });
};

// @desc    Update a game image
// @route   PUT /api/v1/game-images/:id
// @access  Private/Admin
exports.updateGameImage = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err });
    }

    try {
      let gameImage = await GameImage.findById(req.params.id);

      if (!gameImage) {
        return res.status(404).json({ success: false, message: 'Game image not found' });
      }

      const { gameId, order, isActive } = req.body;
      const updateData = {
        gameId: gameId || gameImage.gameId,
        order: order || gameImage.order,
        isActive: isActive !== undefined ? isActive : gameImage.isActive,
      };

      if (req.file) {
        // Delete old image if exists
        if (gameImage.image && gameImage.image.startsWith('/uploads')) {
          try {
            // Remove the leading slash if present for path.join
            const relativePath = gameImage.image.startsWith('/') ? gameImage.image.slice(1) : gameImage.image;
            const oldImagePath = path.join(__dirname, '../../frontend/public', relativePath);
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
            }
          } catch (fileErr) {
            console.error('File deletion error:', fileErr);
            // Continue with update even if old file deletion fails
          }
        }
        updateData.image = `/uploads/game-images/${req.file.filename}`;
      }

      gameImage = await GameImage.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
      });

      res.status(200).json({
        success: true,
        data: gameImage,
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  });
};

// @desc    Delete a game image
// @route   DELETE /api/v1/game-images/:id
// @access  Private/Admin
exports.deleteGameImage = async (req, res, next) => {
  try {
    const gameImage = await GameImage.findById(req.params.id);

    if (!gameImage) {
      return res.status(404).json({ success: false, message: 'Game image not found' });
    }

    // Delete image file if it's in /uploads
    if (gameImage.image && gameImage.image.startsWith('/uploads')) {
      try {
        const relativePath = gameImage.image.startsWith('/') ? gameImage.image.slice(1) : gameImage.image;
        const imagePath = path.join(__dirname, '../../frontend/public', relativePath);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      } catch (fileErr) {
        console.error('File deletion error:', fileErr);
      }
    }

    await GameImage.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Game image deleted successfully',
      data: {},
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Seed default game images
// @route   POST /api/v1/game-images/seed
// @access  Private/Admin
exports.seedGameImages = async (req, res, next) => {
  try {
    const defaults = [
      { gameId: 'mlbb', image: '/uploads/photo/1BcdDv9B90JnlajqQvQaO3PBabTVre9U7A87diA1.jpg', order: 1 },
      { gameId: 'mlbb', image: '/uploads/photo/dmGEycfKf49L9fK6E64aG4CTBDCv9CnPw7eWA5V1.png', order: 2 },
      { gameId: 'mcgg', image: '/uploads/photo/dmGEycfKf49L9fK6E64aG4CTBDCv9CnPw7eWA5V1.png', order: 1 },
      { gameId: 'mcgg', image: '/uploads/photo/1BcdDv9B90JnlajqQvQaO3PBabTVre9U7A87diA1.jpg', order: 2 },
      { gameId: 'pubg', image: '/uploads/photo/mjOPd1akM06euiAdpG1vhTnwREEX8UbAJrez2Phv.jpg', order: 1 },
      { gameId: 'pubg', image: '/uploads/photo/z7SRsbBx9OlAo35d30jtryRHuvPkaAxCeWFeD1vf.jpg', order: 2 },
      { gameId: 'wwm', image: '/uploads/photo/z7SRsbBx9OlAo35d30jtryRHuvPkaAxCeWFeD1vf.jpg', order: 1 },
      { gameId: 'wwm', image: '/uploads/photo/mjOPd1akM06euiAdpG1vhTnwREEX8UbAJrez2Phv.jpg', order: 2 },
      { gameId: 'freefire', image: '/uploads/photo/1BcdDv9B90JnlajqQvQaO3PBabTVre9U7A87diA1.jpg', order: 1 },
      { gameId: 'freefire', image: '/uploads/photo/mjOPd1akM06euiAdpG1vhTnwREEX8UbAJrez2Phv.jpg', order: 2 },
    ];

    const count = await GameImage.countDocuments();
    if (count > 0) {
      return res.status(400).json({ success: false, message: 'Database already has game images. Seeding cancelled.' });
    }

    const gameImages = await GameImage.insertMany(defaults);

    res.status(201).json({
      success: true,
      count: gameImages.length,
      data: gameImages,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
