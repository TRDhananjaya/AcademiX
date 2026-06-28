const mongoose = require('mongoose');

const directMessageSchema = new mongoose.Schema({
  conversationId: { type: String, required: true, index: true },
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  senderRole: { type: String, enum: ['student', 'teacher'], default: 'student' },
  senderAvatar: { type: String, default: '' },
  receiverId: { type: String, required: true, index: true },
  receiverName: { type: String, required: true },
  text: { type: String, required: true },
  read: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now, index: true }
});

module.exports = mongoose.model('DirectMessage', directMessageSchema, 'direct_messages');
