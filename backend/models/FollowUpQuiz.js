const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  correctAnswer: { type: String, required: true }
});

const followupQuizSchema = new mongoose.Schema({
  quizCode: { type: String, required: true },
  title: { type: String, required: true },
  moduleId: { type: String, required: true, index: true },
  bundleTopic: { type: String, required: true },
  questions: [questionSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FollowupQuiz', followupQuizSchema, 'followup_quizzes');
