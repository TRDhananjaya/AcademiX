const mongoose = require('mongoose');
const uri = 'mongodb://root:root@ac-xc33ipv-shard-00-00.6mzunvs.mongodb.net:27017,ac-xc33ipv-shard-00-01.6mzunvs.mongodb.net:27017,ac-xc33ipv-shard-00-02.6mzunvs.mongodb.net:27017/test?ssl=true&replicaSet=atlas-asahlb-shard-0&authSource=admin&retryWrites=true&w=majority';
mongoose.connect(uri)
  .then(async () => {
    const db = mongoose.connection.db;
    
    // Affected student
    const targetStudentId = 'st031';
    
    // Suppose we check Lesson 1 quizzes
    const quizCodes = ['Q1.1', 'Q1.2', 'Q1.3'];
    
    const studentResults = await db.collection('quizz_results').find({
      studentId: { $regex: new RegExp('^' + targetStudentId + '$', 'i') },
      quizId: { $in: quizCodes }
    }).toArray();
    
    console.log('Results for', targetStudentId, ':', studentResults.length);
    
    const completedQuizCodes = [...new Set(studentResults.map(r => r.quizId))];
    console.log('Unique completed quizzes:', completedQuizCodes);
    
    console.log('Completed Quiz Codes length:', completedQuizCodes.length);
    console.log('Required Quiz Codes length:', quizCodes.length);
    
    if (completedQuizCodes.length === quizCodes.length) {
      console.log('Match! Study plan WOULD be generated.');
    } else {
      console.log('No match! Study plan would NOT be generated.');
    }

    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
