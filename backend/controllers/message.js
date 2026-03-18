const Message = require('../models/Message');

// @desc    Get user messages
// @route   GET /api/v1/messages
// @access  Private
exports.getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({ user: req.user.id }).sort('-createdAt');
    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Mark message as read
// @route   PUT /api/v1/messages/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    const message = await Message.findOne({ _id: req.params.id });

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    // Ensure the message belongs to the user
    if (message.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to access this message' });
    }

    message.is_read = true;
    await message.save();

    res.status(200).json({
      success: true,
      data: message,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Mark all user messages as read
// @route   PUT /api/v1/messages/read-all
// @access  Private
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Message.updateMany(
      { user: req.user.id, is_read: false },
      { is_read: true }
    );

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Delete message
// @route   DELETE /api/v1/messages/:id
// @access  Private
exports.deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findOne({ _id: req.params.id });

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    // Ensure the message belongs to the user
    if (message.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this message' });
    }

    await message.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
