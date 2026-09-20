const CommonMessage = require('../models/CommonMessage');
const User = require('../models/User');

const seedMessages = [];
const userAvatarCache = new Map();

// @desc    Get all global community messages
// @route   GET /api/common-messages
const getMessages = async (req, res) => {
  try {
    const messages = await CommonMessage.find({}).sort({ timestamp: 1 }).limit(200).lean();

    // Map unique senderIds to their database-saved profile pictures
    const senderIds = [...new Set(messages.map(msg => (msg.senderId || '').toLowerCase()))];
    
    // Check missing senders not in memory cache
    const now = Date.now();
    const missingSenders = senderIds.filter(id => {
      const entry = userAvatarCache.get(id);
      return !entry || (now - entry.timestamp > 120000); // 2 min TTL
    });

    if (missingSenders.length > 0) {
      try {
        const users = await User.aggregate([
          { $match: { username: { $in: missingSenders } } },
          {
            $project: {
              username: 1,
              profilePicture: {
                $cond: [
                  { $gt: [{ $strLenCP: { $ifNull: ['$profilePicture', ''] } }, 80000] },
                  '',
                  '$profilePicture'
                ]
              }
            }
          }
        ]);
        users.forEach(u => {
          if (u.username) {
            userAvatarCache.set(u.username.toLowerCase(), {
              avatar: u.profilePicture || '',
              timestamp: now
            });
          }
        });
      } catch (aggErr) {
        console.warn('Avatar aggregation error:', aggErr.message);
      }
    }

    const enrichedMessages = messages.map(msg => {
      const senderKey = (msg.senderId || '').toLowerCase();
      const cached = userAvatarCache.get(senderKey);
      const msgObj = { ...msg };
      
      if (cached && cached.avatar) {
        msgObj.senderAvatar = cached.avatar;
      } else if (msgObj.senderAvatar && msgObj.senderAvatar.length > 80000) {
        msgObj.senderAvatar = '';
      }
      return msgObj;
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
