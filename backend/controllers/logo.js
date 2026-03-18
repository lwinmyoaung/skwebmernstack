const Logo = require('../models/Logo');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer setup for logo images
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, '../../frontend/public/uploads/logo');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    cb(null, 'logo-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2000000 }, // 2MB limit for logos
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|webp|svg/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images/SVGs Only!');
    }
  }
}).single('image');

// @desc    Seed default logo
// @route   POST /api/v1/logos/seed
// @access  Private/Admin
exports.seedDefaultLogo = async (req, res, next) => {
  try {
    const existingLogos = await Logo.find();
    if (existingLogos.length > 0) {
      return res.status(400).json({ success: false, message: 'Logos already exist in database' });
    }

    const defaultLogo = await Logo.create({
      name: 'Default Main Logo',
      image: '/adminimages/logo/skincollector.jpg',
      link: '/',
      displayOrder: 1,
      isActive: true
    });

    res.status(201).json({
      success: true,
      data: defaultLogo
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get all active logos
// @route   GET /api/v1/logos
// @access  Public
exports.getLogos = async (req, res, next) => {
  try {
    const logos = await Logo.find({ isActive: true }).sort('displayOrder');
    res.status(200).json({
      success: true,
      count: logos.length,
      data: logos,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get all logos (Admin)
// @route   GET /api/v1/logos/admin
// @access  Private/Admin
exports.getAdminLogos = async (req, res, next) => {
  try {
    const logos = await Logo.find().sort('displayOrder');
    res.status(200).json({
      success: true,
      count: logos.length,
      data: logos,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Create a logo
// @route   POST /api/v1/logos
// @access  Private/Admin
exports.createLogo = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err });
    }

    try {
      const { name, link, displayOrder, isActive } = req.body;
      const image = req.file ? `/uploads/logo/${req.file.filename}` : '';

      if (!image) {
        return res.status(400).json({ success: false, message: 'Please upload a logo image' });
      }

      const logo = await Logo.create({
        name,
        image,
        link,
        displayOrder: displayOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
      });

      res.status(201).json({
        success: true,
        data: logo,
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  });
};

// @desc    Update a logo
// @route   PUT /api/v1/logos/:id
// @access  Private/Admin
exports.updateLogo = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err });
    }

    try {
      let logo = await Logo.findById(req.params.id);

      if (!logo) {
        return res.status(404).json({ success: false, message: 'Logo not found' });
      }

      const { name, link, displayOrder, isActive } = req.body;
      
      const updateData = {
        name: name || logo.name,
        link: link !== undefined ? link : logo.link,
        displayOrder: displayOrder || logo.displayOrder,
        isActive: isActive !== undefined ? isActive : logo.isActive,
      };

      if (req.file) {
        // Delete old image
        const oldImagePath = path.join(__dirname, '../../frontend/public', logo.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
        updateData.image = `/uploads/logo/${req.file.filename}`;
      }

      logo = await Logo.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
      });

      res.status(200).json({
        success: true,
        data: logo,
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  });
};

// @desc    Delete a logo
// @route   DELETE /api/v1/logos/:id
// @access  Private/Admin
exports.deleteLogo = async (req, res, next) => {
  try {
    const logo = await Logo.findById(req.params.id);

    if (!logo) {
      return res.status(404).json({ success: false, message: 'Logo not found' });
    }

    // Delete image file
    const imagePath = path.join(__dirname, '../../frontend/public', logo.image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await logo.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
