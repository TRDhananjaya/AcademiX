const mongoose = require('mongoose');

const followupResultSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: false },
  studentId: { type: String, required: true },
  studentName: { type: String, required: false },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: false },
  percentage: { type: Number, required: true },
  timeTaken: { type: String, required: false },
  status: { type: String, enum: ['Pass', 'Fail'], required: false },
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FollowupResult', followupResultSchema, 'followup_results');
