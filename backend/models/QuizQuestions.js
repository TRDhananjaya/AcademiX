const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: { type: [String], required: true },
  correctOption: { type: Number, required: true },
  difficulty: { type: String }
});

const quizQuestionsSchema = new mongoose.Schema({
  quizCode: { type: String, required: true },
  title: { type: String, required: true },
  moduleId: { type: String, required: true },
  bundleTopic: { type: String, required: true },
  questions: [questionSchema]
}, { collection: 'Quiz_Questions' });

module.exports = mongoose.model('QuizQuestions', quizQuestionsSchema);
