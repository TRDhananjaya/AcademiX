const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  percentage: { type: Number, required: true },
  timeTaken: { type: String, required: true }, // e.g. "25m 14s"
  status: { type: String, enum: ['Pass', 'Fail'], required: true },
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('QuizResult', quizResultSchema);
