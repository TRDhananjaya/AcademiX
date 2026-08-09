const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  lessonId: {
    type: String,
    required: true
  },
  features: {
    Module_1_Score: { type: Number, required: true },
    Module_2_Score: { type: Number, required: true },
    Module_3_Score: { type: Number, required: true },
    Avg_Module_Score: { type: Number, required: true },
    Weak_Module_Count: { type: Number, required: true },
    Priority_Score: { type: Number, required: true },
    Followup_Quiz_Score: { type: Number, required: true },
    Improvement_Percentage: { type: Number, required: true },
    Lesson_Performance: { type: String, required: true },
    Quiz_Difficulty: { type: String, required: true }
  },
  predictedScore: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Prediction', predictionSchema, 'prediction_results');
