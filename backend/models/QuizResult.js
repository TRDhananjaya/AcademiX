const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
  quizId: { type: String, required: true, index: true },
  studentId: { type: String, required: true, index: true },
  studentName: { type: String, required: true, index: true },
  correctAnswers: { type: Number }, // DB has score instead, but keeping this
  score: { type: Number }, // To be safe with existing data
  totalQuestions: { type: Number, required: true },
  percentage: { type: Number, required: true, index: true },
  timeTaken: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now, index: true },
  status: { type: String } // Existing DB data has status, so add it to avoid losing it during saves/updates, even though frontend ignores it
});

module.exports = mongoose.model('QuizResult', quizResultSchema, 'quizz_results');
