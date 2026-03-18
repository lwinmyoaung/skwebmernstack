const HowToUse = require('../models/HowToUse');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer setup for video uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = '../frontend/public/uploads/videos';
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function(req, file, cb) {
    cb(null, 'video-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50000000 }, // 50MB limit
  fileFilter: function(req, file, cb) {
    const filetypes = /mp4|mov|avi|wmv|webm/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Videos Only (mp4, mov, avi, wmv, webm)!');
    }
  }
}).single('video');

// @desc    Get all HowToUse items
// @route   GET /api/v1/how-to-use
// @access  Public
exports.getHowToUse = async (req, res, next) => {
  try {
    const items = await HowToUse.find({ isActive: true }).sort('order');
    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get all HowToUse items (Admin)
// @route   GET /api/v1/how-to-use/admin
// @access  Private/Admin
exports.getAdminHowToUse = async (req, res, next) => {
  try {
    const items = await HowToUse.find().sort('order');
    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Create a HowToUse item
// @route   POST /api/v1/how-to-use
// @access  Private/Admin
exports.createHowToUse = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err });
    }

    try {
      const { title, description, order, isActive, videoUrl: externalUrl } = req.body;
      
      let videoUrl = externalUrl || '';
      if (req.file) {
        videoUrl = `/uploads/videos/${req.file.filename}`;
      }

      if (!videoUrl) {
        return res.status(400).json({ success: false, message: 'Please upload a video or provide a URL' });
      }

      const item = await HowToUse.create({
        title,
        description,
        videoUrl,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
      });

      res.status(201).json({
        success: true,
        data: item,
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  });
};

// @desc    Delete a HowToUse item
// @route   DELETE /api/v1/how-to-use/:id
// @access  Private/Admin
exports.deleteHowToUse = async (req, res, next) => {
  try {
    const item = await HowToUse.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Delete file if it's an uploaded video
    if (item.videoUrl && item.videoUrl.startsWith('/uploads/videos/')) {
      const filePath = path.join(__dirname, '../../frontend/public', item.videoUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await item.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
