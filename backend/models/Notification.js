const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  recipientRole: { type: String, enum: ['student', 'teacher', 'admin'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  notificationType: { type: String, required: true },
  relatedLessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
  relatedStudentId: { type: String }, // Can be studentId string or ObjectId, let's keep it String for STU-xxxx compatibility
  isRead: { type: Boolean, default: false },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'N/A'], default: 'N/A' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
