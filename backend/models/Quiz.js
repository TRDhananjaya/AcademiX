const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: { type: [String], required: true },
  correctOption: { type: Number, required: true }
});

const quizSchema = new mongoose.Schema({
  quizCode: { type: String, required: true },
  title: { type: String, required: true },
  moduleId: { type: String, required: true, index: true },
  bundleTopic: { type: String, required: true },
  questions: [questionSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quiz', quizSchema);
