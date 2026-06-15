const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
  quizId: { type: String, required: true },
  studentId: { type: String, required: true },
  studentName: { type: String },
  score: { type: Number, required: true },
  timeTaken: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('QuizResult', quizResultSchema, 'quizz_results');
