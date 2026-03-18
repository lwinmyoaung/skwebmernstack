const Slideshow = require('../models/Slideshow');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer setup for slideshow images
const storage = multer.diskStorage({
  destination: '../frontend/public/uploads/slideshow',
  filename: function(req, file, cb) {
    cb(null, 'slide-' + Date.now() + path.extname(file.originalname));
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

// @desc    Get all slideshows
// @route   GET /api/v1/slideshows
// @access  Public
exports.getSlideshows = async (req, res, next) => {
  try {
    const slideshows = await Slideshow.find({ isActive: true }).sort('order');
    res.status(200).json({
      success: true,
      count: slideshows.length,
      data: slideshows,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get all slideshows (Admin)
// @route   GET /api/v1/slideshows/admin
// @access  Private/Admin
exports.getAdminSlideshows = async (req, res, next) => {
  try {
    const slideshows = await Slideshow.find().sort('order');
    res.status(200).json({
      success: true,
      count: slideshows.length,
      data: slideshows,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Create a slideshow
// @route   POST /api/v1/slideshows
// @access  Private/Admin
exports.createSlideshow = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err });
    }

    try {
      const { title, link, order, isActive } = req.body;
      const image = req.file ? `/uploads/slideshow/${req.file.filename}` : '';

      if (!image) {
        return res.status(400).json({ success: false, message: 'Please upload an image' });
      }

      const slideshow = await Slideshow.create({
        image,
        title,
        link,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
      });

      res.status(201).json({
        success: true,
        data: slideshow,
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  });
};

// @desc    Update a slideshow
// @route   PUT /api/v1/slideshows/:id
// @access  Private/Admin
exports.updateSlideshow = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err });
    }

    try {
      let slideshow = await Slideshow.findById(req.params.id);

      if (!slideshow) {
        return res.status(404).json({ success: false, message: 'Slideshow not found' });
      }

      const { title, link, order, isActive } = req.body;
      const updateData = {
        title,
        link,
        order: order || slideshow.order,
        isActive: isActive !== undefined ? isActive : slideshow.isActive,
      };

      if (req.file) {
        // Delete old image if exists
        const oldImagePath = path.join(__dirname, '../../frontend/public', slideshow.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
        updateData.image = `/uploads/slideshow/${req.file.filename}`;
      }

      slideshow = await Slideshow.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
      });

      res.status(200).json({
        success: true,
        data: slideshow,
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  });
};

// @desc    Seed default slideshows
// @route   POST /api/v1/slideshows/seed
// @access  Private/Admin
exports.seedSlideshows = async (req, res, next) => {
  try {
    const defaults = [
      { image: '/uploads/ads/slides/BamR8QemjnTKb0V3S6Ki1CeMgJcR52rmevzDJuDX.png', title: 'Level Up Your Gaming', order: 1 },
      { image: '/uploads/ads/slides/OOQ8ifGjUv1VKxq4sWPsAJcU8qfrRvhrEzDs1C11.jpg', title: 'Premium Digital Store', order: 2 },
      { image: '/uploads/ads/slides/yjspOcki7jMtVj1omqxhFZlI6RZH8Iq3tNEOyjZI.jpg', title: 'Official Gaming Partner', order: 3 },
    ];

    // Check if any of these already exist to avoid duplicates (optional)
    // For simplicity, we'll just add them if the table is empty or specifically requested
    
    const count = await Slideshow.countDocuments();
    if (count > 0) {
      return res.status(400).json({ success: false, message: 'Database already has slides. Seeding cancelled.' });
    }

    const slideshows = await Slideshow.insertMany(defaults);

    res.status(201).json({
      success: true,
      count: slideshows.length,
      data: slideshows,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Delete a slideshow
// @route   DELETE /api/v1/slideshows/:id
// @access  Private/Admin
exports.deleteSlideshow = async (req, res, next) => {
  try {
    const slideshow = await Slideshow.findById(req.params.id);

    if (!slideshow) {
      return res.status(404).json({ success: false, message: 'Slideshow not found' });
    }

    // Delete image file if it's not a default image
    if (slideshow.image.startsWith('/uploads')) {
      const imagePath = path.join(__dirname, '../../frontend/public', slideshow.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await slideshow.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
