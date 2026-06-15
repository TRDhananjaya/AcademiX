const mongoose = require('mongoose');

const analyticsRecordSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  lessonNumber: { type: Number, required: true },
  quizNumber: { type: Number, required: true },
  quizId: { type: String, required: true }, // e.g., "Q1.1"
  score: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  timeTaken: { type: String, required: true }, // e.g., "03:25"
  submissionDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AnalyticsRecord', analyticsRecordSchema);
