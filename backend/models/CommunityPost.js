const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  authorName: { type: String, required: true },
  authorRole: { type: String, enum: ['student', 'teacher'], default: 'student' },
  authorAvatar: { type: String, default: '' },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const communityPostSchema = new mongoose.Schema({
  authorName: { type: String, required: true },
  authorRole: { type: String, enum: ['student', 'teacher'], default: 'student' },
  authorAvatar: { type: String, default: '' },
  title: { type: String, required: true },
  body: { type: String, required: true },
  course: { type: String, default: 'General Academic' },
  tags: [{ type: String }],
  votes: { type: Number, default: 0 },
  upvotedBy: [{ type: String }],
  downvotedBy: [{ type: String }],
  replies: [replySchema],
  isFlagged: { type: Boolean, default: false },
  flagReason: { type: String, default: '' },
  needsTeacherInput: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CommunityPost', communityPostSchema, 'community_posts');
