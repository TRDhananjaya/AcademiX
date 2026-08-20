const mongoose = require('mongoose');
const uri = 'mongodb://root:root@ac-xc33ipv-shard-00-00.6mzunvs.mongodb.net:27017,ac-xc33ipv-shard-00-01.6mzunvs.mongodb.net:27017,ac-xc33ipv-shard-00-02.6mzunvs.mongodb.net:27017/test?ssl=true&replicaSet=atlas-asahlb-shard-0&authSource=admin&retryWrites=true&w=majority';
mongoose.connect(uri)
  .then(async () => {
    const db = mongoose.connection.db;
    const lessonId = '6a33c6b4d67ba7d81f63916b'; // Lesson 1
    const targetStudentId = 'st031';
    
    const quizCodes = ['Q1.1', 'Q1.2', 'Q1.3'];
    
    const studentResults = await db.collection('quizz_results').find({
      studentId: { $regex: new RegExp('^' + targetStudentId + '$', 'i') },
      quizId: { $in: quizCodes }
    }).toArray();

    console.log('Found results for st031:', studentResults.length);
    console.log('Scores in results:', studentResults.map(r => ({ quizId: r.quizId, score: r.score, correctAnswers: r.correctAnswers, totalQuestions: r.totalQuestions })));

    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
