const mongoose = require('mongoose');
const Prediction = require('./models/Prediction');
require('dotenv').config({ path: './.env' });
async function test() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/academix');
  const count = await Prediction.countDocuments({ lessonId: { $nin: ['General', 'Final Exam', 'Final Exam (All Lessons)', '', null] } });
  console.log('Total Lesson-wise:', count);
  process.exit();
}
test();
