const DirectMessage = require('../models/DirectMessage');
const User = require('../models/User');

// Seed messages for initial demonstration if collection is empty
const seedMessages = [
  {
    conversationId: 'drjenkins_student1',
    senderId: 'drjenkins',
    senderName: 'Dr. Sarah Jenkins',
    senderRole: 'teacher',
    senderAvatar: 'https://i.pravatar.cc/150?u=drjenkins',
    receiverId: 'student1',
    receiverName: 'John Doe',
    text: 'Hello John! I noticed your recent question about calculus derivatives. Did you review chapter 4?',
    read: true,
    timestamp: new Date(Date.now() - 7200000)
  },
  {
    conversationId: 'drjenkins_student1',
    senderId: 'student1',
    senderName: 'John Doe',
    senderRole: 'student',
    senderAvatar: 'https://i.pravatar.cc/150?u=student1',
    receiverId: 'drjenkins',
    receiverName: 'Dr. Sarah Jenkins',
    text: 'Yes Dr. Jenkins! Thank you for checking in. I had a quick question regarding example 4.2 on page 95.',
    read: true,
    timestamp: new Date(Date.now() - 3600000)
  },
  {
    conversationId: 'drjenkins_student1',
    senderId: 'drjenkins',
    senderName: 'Dr. Sarah Jenkins',
    senderRole: 'teacher',
    senderAvatar: 'https://i.pravatar.cc/150?u=drjenkins',
    receiverId: 'student1',
    receiverName: 'John Doe',
    text: 'Feel free to post your solution draft here and I will review it before office hours today! 📚',
    read: false,
    timestamp: new Date(Date.now() - 1800000)
  }
];

// Helper to construct consistent conversation ID
const getConversationId = (uid1, uid2) => {
  return [uid1, uid2].sort().join('_');
};

// @desc    Get all active conversations & available contacts
// @route   GET /api/messages/conversations
const getConversations = async (req, res) => {
  try {
    const currentUserId = req.query.currentUserId || (req.user ? req.user.username || req.user._id.toString() : 'student1');
    
    let count = await DirectMessage.countDocuments();
    if (count === 0) {
      await DirectMessage.insertMany(seedMessages);
    }

    // Default contact list for quick messaging
    const defaultContacts = [
      { id: 'drjenkins', name: 'Dr. Sarah Jenkins', role: 'teacher', avatar: 'https://i.pravatar.cc/150?u=drjenkins', status: 'Online • Advanced Calculus' },
      { id: 'proffrank', name: 'Prof. Frank Alan', role: 'teacher', avatar: 'https://i.pravatar.cc/150?u=proffrank', status: 'Online • Physics 202' },
      { id: 'student1', name: 'John Doe', role: 'student', avatar: 'https://i.pravatar.cc/150?u=student1', status: 'Student • Math 301' },
      { id: 'alexchen', name: 'Alex Chen', role: 'student', avatar: 'https://i.pravatar.cc/150?u=alexchen', status: 'Student • Physics 202' }
    ];

    // Filter out self from contacts list
    const contacts = defaultContacts.filter(c => c.id !== currentUserId);

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

    const sId = senderId || (req.user ? req.user.username || req.user._id.toString() : 'student1');
    const sName = senderName || (req.user ? `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.username : 'User');
    const sRole = senderRole || (req.user ? req.user.role : 'student');

    const convId = getConversationId(sId, receiverId);

    const message = new DirectMessage({
      conversationId: convId,
      senderId: sId,
      senderName: sName,
      senderRole: sRole,
      senderAvatar: senderAvatar || `https://i.pravatar.cc/150?u=${encodeURIComponent(sId)}`,
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
