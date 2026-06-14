require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');
const QuizResult = require('./models/QuizResult');
const FollowupResult = require('./models/FollowupResult');

async function showDb() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Get the most recent 3 students
    const students = await Student.find({}, 'studentId name').sort({ createdAt: -1 }).limit(3);
    
    // Get the most recent 5 quiz results
    const quizzes = await QuizResult.find({}).sort({ submittedAt: -1 }).limit(5);
    
    // Get the most recent 5 followup results
    const followups = await FollowupResult.find({}).sort({ submittedAt: -1 }).limit(5);

    console.log('\n--- LATEST STUDENTS ---');
    console.log(JSON.stringify(students, null, 2));

    console.log('\n--- LATEST QUIZ RESULTS ---');
    console.log(JSON.stringify(quizzes, null, 2));

    console.log('\n--- LATEST FOLLOWUP RESULTS ---');
    console.log(JSON.stringify(followups, null, 2));

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

showDb();
