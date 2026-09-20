const DirectMessage = require('../models/DirectMessage');
const User = require('../models/User');

// Helper to construct consistent conversation ID
const getConversationId = (uid1, uid2) => {
  return [uid1, uid2].sort().join('_');
};

// @desc    Get all active conversations & available contacts
// @route   GET /api/messages/conversations
const getConversations = async (req, res) => {
  try {
    const currentUserId = req.user ? req.user.username || req.user._id.toString() : req.query.currentUserId;
    if (!currentUserId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Fetch all real users except current user from the database (exclude heavy profilePicture Base64 strings)
    const users = await User.find({}, 'firstName lastName username role').lean();
    const contacts = users
      .filter(u => (u.username || u._id.toString()) !== currentUserId)
      .map(u => ({
        id: u.username || u._id.toString(),
        name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username,
        role: u.role || 'student',
        avatar: u.profilePicture || null,
        status: u.role === 'teacher' ? 'Teacher' : 'Student'
      }));

    // Fetch latest message for each contact to show snippet and unread status
    const conversationSummaries = await Promise.all(
      contacts.map(async (contact) => {
        const convId = getConversationId(currentUserId, contact.id);
        const lastMsg = await DirectMessage.findOne({ conversationId: convId }).sort({ timestamp: -1 });
        const unreadCount = await DirectMessage.countDocuments({ conversationId: convId, receiverId: currentUserId, read: false });
        return {
          contact,
          lastMessage: lastMsg ? lastMsg.text : 'No messages yet',
          timestamp: lastMsg ? lastMsg.timestamp : null,
          unreadCount
        };
      })
    );

    res.status(200).json(conversationSummaries);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Server error fetching conversations' });
  }
};


// @desc    Get message thread with a specific user
// @route   GET /api/messages/thread/:otherUserId
const getThread = async (req, res) => {
  try {
    const currentUserId = req.query.currentUserId || (req.user ? req.user.username || req.user._id.toString() : 'student1');
    const { otherUserId } = req.params;

    const convId = getConversationId(currentUserId, otherUserId);
    const messages = await DirectMessage.find({ conversationId: convId }).sort({ timestamp: 1 });

    // Mark messages from otherUserId as read
    await DirectMessage.updateMany(
      { conversationId: convId, receiverId: currentUserId, read: false },
      { $set: { read: true } }
    );

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching thread:', error);
    res.status(500).json({ message: 'Server error fetching thread' });
  }
};

// @desc    Send a direct message
// @route   POST /api/messages/send
const sendMessage = async (req, res) => {
  try {
    const { receiverId, receiverName, text, senderId, senderName, senderRole, senderAvatar } = req.body;
    if (!receiverId || !text) {
      return res.status(400).json({ message: 'Receiver and text are required' });
    }

    const sId = senderId || (req.user ? req.user.username || req.user._id.toString() : null);
    const sName = senderName || (req.user ? `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.username : 'User');
    const sRole = senderRole || (req.user ? req.user.role : 'student');
    if (!sId) {
      return res.status(401).json({ message: 'Authentication required to send messages' });
    }

    const convId = getConversationId(sId, receiverId);

    const message = new DirectMessage({
      conversationId: convId,
      senderId: sId,
      senderName: sName,
      senderRole: sRole,
      senderAvatar: senderAvatar || req.user?.profilePicture || null,
      receiverId,
      receiverName: receiverName || 'Contact',
      text,
      read: false,
      timestamp: new Date()
    });

    const savedMessage = await message.save();
    res.status(201).json(savedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error sending message' });
  }
};

// @desc    Mark thread as read
// @route   POST /api/messages/read/:otherUserId
const markAsRead = async (req, res) => {
  try {
    const currentUserId = req.body.currentUserId || (req.user ? req.user.username || req.user._id.toString() : 'student1');
    const { otherUserId } = req.params;

    const convId = getConversationId(currentUserId, otherUserId);
    await DirectMessage.updateMany(
      { conversationId: convId, receiverId: currentUserId, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking read:', error);
    res.status(500).json({ message: 'Server error marking read' });
  }
};

module.exports = {
  getConversations,
  getThread,
  sendMessage,
  markAsRead
};
