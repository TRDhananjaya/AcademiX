const CommonMessage = require('../models/CommonMessage');
const User = require('../models/User');

const seedMessages = [
  {
    senderId: 'drjenkins',
    senderName: 'Dr. Sarah Jenkins',
    senderRole: 'teacher',
    senderAvatar: 'https://i.pravatar.cc/150?u=drjenkins',
    text: 'Welcome everyone to the AcademiX Common Learning Platform! Feel free to ask questions and share study notes here.',
    timestamp: new Date(Date.now() - 7200000)
  },
  {
    senderId: 'alexchen',
    senderName: 'Alex Chen',
    senderRole: 'student',
    senderAvatar: 'https://i.pravatar.cc/150?u=alexchen',
    text: 'Hello Dr. Jenkins! Does anyone have the formula sheet for thermodynamics chapter 3?',
    timestamp: new Date(Date.now() - 3600000)
  },
  {
    senderId: 'student1',
    senderName: 'John Doe',
    senderRole: 'student',
    senderAvatar: 'https://i.pravatar.cc/150?u=student1',
    text: 'I just uploaded the summary notes in the Shared Resources section Alex!',
    timestamp: new Date(Date.now() - 1800000)
  }
];

// @desc    Get all global community messages
// @route   GET /api/common-messages
const getMessages = async (req, res) => {
  try {
    let count = await CommonMessage.countDocuments();
    if (count === 0) {
      await CommonMessage.insertMany(seedMessages);
    }

    const messages = await CommonMessage.find({}).sort({ timestamp: 1 }).limit(200);

    // Map unique senderIds to their database-saved profile pictures
    const senderIds = [...new Set(messages.map(msg => msg.senderId))];
    const users = await User.find({ username: { $in: senderIds } }, 'username profilePicture');
    const userMap = new Map();
    users.forEach(u => {
      if (u.profilePicture) {
        userMap.set(u.username, u.profilePicture);
      }
    });

    const enrichedMessages = messages.map(msg => {
      const dbProfilePicture = userMap.get(msg.senderId);
      if (dbProfilePicture) {
        const msgObj = msg.toObject();
        msgObj.senderAvatar = dbProfilePicture;
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
    const { text, senderId, senderName, senderRole, senderAvatar } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Message text is required' });
    }

    const user = req.user;
    const sId = senderId || (user ? user.username || user._id.toString() : 'student1');
    const sName = senderName || (user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username : 'Community Member');
    const sRole = senderRole || (user ? user.role : 'student');

    const dbUser = await User.findOne({ username: sId }, 'profilePicture');
    const sAvatar = (dbUser && dbUser.profilePicture) || senderAvatar || `https://i.pravatar.cc/150?u=${encodeURIComponent(sId)}`;

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
