const mongoose = require('mongoose');

const commonMessageSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  senderRole: { type: String, enum: ['student', 'teacher'], default: 'student' },
  senderAvatar: { type: String, default: '' },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, index: true }
});

module.exports = mongoose.model('CommonMessage', commonMessageSchema, 'common_messages');
