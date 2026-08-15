const mongoose = require('mongoose');

const followupResultSchema = new mongoose.Schema({
  quizId: { type: String, required: false },
  lessonId: { type: String, required: false, index: true },
  studentId: { type: String, required: true, index: true },
  studentName: { type: String, required: false },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: false, default: 20 },
  percentage: { type: Number, required: true },
  timeTaken: { type: String, required: false },
  status: { type: String, enum: ['Pass', 'Fail'], required: false },
  answersDetails: [{
    questionText: { type: String },
    selectedOption: { type: Number },
    correctOption: { type: Number },
    isCorrect: { type: Boolean }
  }],
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FollowupResult', followupResultSchema, 'followup_results');

