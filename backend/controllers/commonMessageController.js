const CommonMessage = require('../models/CommonMessage');
const User = require('../models/User');

const seedMessages = [];

let hasCleanedUpLegacyMessages = false;

// @desc    Get all global community messages
// @route   GET /api/common-messages
const getMessages = async (req, res) => {
  try {
    // Only delete legacy dummy seed messages once on startup, not on 3s live polling
    if (!hasCleanedUpLegacyMessages) {
      hasCleanedUpLegacyMessages = true;
      try {
        await CommonMessage.deleteMany({
          $or: [
            { senderId: { $in: ['drjenkins', 'alexchen', 'student1'] } },
            { text: { $regex: "thermodynamics|AcademiX Common Learning Platform|Shared Resources section Alex", $options: 'i' } }
          ]
        });
      } catch (cleanupErr) {
        console.warn('Common messages cleanup error:', cleanupErr.message);
      }
    }

    const messages = await CommonMessage.find({}).sort({ timestamp: 1 }).limit(200);

    // Map unique senderIds to their database-saved profile pictures (normalized to lowercase)
    const senderIds = [...new Set(messages.map(msg => (msg.senderId || '').toLowerCase()))];
    const users = await User.find({ username: { $in: senderIds } }, 'username profilePicture').lean();
    const userMap = new Map();
    users.forEach(u => {
      if (u.username) {
        userMap.set(u.username.toLowerCase(), u.profilePicture || '');
      }
    });

    const enrichedMessages = messages.map(msg => {
      const senderKey = (msg.senderId || '').toLowerCase();
      if (userMap.has(senderKey)) {
        const msgObj = msg.toObject();
        msgObj.senderAvatar = userMap.get(senderKey);
        return msgObj;
      }
      return msg;
    });

    res.status(200).json(enrichedMessages);
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

    const dbUser = await User.findOne({ username: sId.toLowerCase() }, 'profilePicture');
    const sAvatar = (dbUser && dbUser.profilePicture) || '';

    const message = new CommonMessage({
      senderId: sId,
      senderName: sName,
      senderRole: sRole,
      senderAvatar: sAvatar,
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
