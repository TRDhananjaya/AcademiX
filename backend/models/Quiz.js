const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  type: { type: String, default: 'multiple-choice' },
  options: [{ type: String, required: true }],
  correctOption: { type: Number, required: true }
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  bundleTopic: { type: String, required: true },
  instructions: { type: String },
  questions: [questionSchema],
  settings: {
    timeLimit: { type: Number, default: 45 },
    passingScore: { type: Number, default: 50 },
    randomizeQuestions: { type: Boolean, default: false },
    showResultsImmediately: { type: Boolean, default: true },
    allowMultipleAttempts: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quiz', quizSchema);
