const mongoose = require('mongoose');

const studyPlanSchema = new mongoose.Schema({
  studentId: { type: String, required: true, index: true }, // Using String to store 'STU-xxxx'
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
  generatedStudyPlan: { type: String, required: true },
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['Active', 'Completed', 'Archived'], default: 'Active' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StudyPlan', studyPlanSchema);
