const CommonMessage = require('../models/CommonMessage');
const User = require('../models/User');

const seedMessages = [];

let hasCleanedUpLegacyMessages = false;

// @desc    Get all global community messages
// @route   GET /api/common-messages
const getMessages = async (req, res) => {
  try {
    const messages = await CommonMessage.find({}).sort({ timestamp: 1 }).limit(200).lean();
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching common messages:', error);
    res.status(500).json({ message: 'Server error fetching messages' });
  }
};

// @desc    Send a message to the common platform
// @route   POST /api/common-messages
const sendMessage = async (req, res) => {
  try {
    const { text, senderId, senderName, senderRole } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Message text is required' });
    }

    const user = req.user;
    const sId = senderId || (user ? user.username || user._id.toString() : 'student1');
    const sName = senderName || (user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username : 'Community Member');
    const sRole = senderRole || (user ? user.role : 'student');

    const message = new CommonMessage({
      senderId: sId,
      senderName: sName,
      senderRole: sRole,
      senderAvatar: '',
      text: text.trim(),
      timestamp: new Date()
    });

    const savedMessage = await message.save();
    res.status(201).json(savedMessage);
  } catch (error) {
    console.error('Error sending common message:', error);
    res.status(500).json({ message: 'Server error sending message' });
  }
};

module.exports = {
  getMessages,
  sendMessage
};
