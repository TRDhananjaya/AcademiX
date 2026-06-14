require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');
const QuizResult = require('./models/QuizResult');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const students = await Student.find({}, 'name email').limit(2);
    const quizzes = await QuizResult.find({}, 'studentId studentName percentage').limit(2);
    console.log('---STUDENTS---');
    console.log(JSON.stringify(students, null, 2));
    console.log('---QUIZZES---');
    console.log(JSON.stringify(quizzes, null, 2));
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
