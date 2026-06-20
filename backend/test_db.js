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
    const db = mongoose.connection.db;
    const lessonsCount = await db.collection('lessons').countDocuments();
    const modulesCount = await db.collection('modules').countDocuments();
    const resourcesCount = await db.collection('resources').countDocuments();

    console.log(`Lessons count: ${lessonsCount}`);
    console.log(`Modules count: ${modulesCount}`);
    console.log(`Resources count: ${resourcesCount}`);

    if (lessonsCount > 0) {
      const sampleLessons = await db.collection('lessons').find({}).limit(2).toArray();
      console.log('Sample Lessons:', JSON.stringify(sampleLessons, null, 2));
    }
    if (modulesCount > 0) {
      const sampleModules = await db.collection('modules').find({}).limit(2).toArray();
      console.log('Sample Modules:', JSON.stringify(sampleModules, null, 2));
    }
    if (resourcesCount > 0) {
      const sampleResources = await db.collection('resources').find({}, { projection: { url: 0 } }).limit(5).toArray();
      console.log('Sample Resources (excluding large URLs):', JSON.stringify(sampleResources, null, 2));
    }
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
