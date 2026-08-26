const mongoose = require('mongoose');
const uri = 'mongodb://root:root@ac-xc33ipv-shard-00-00.6mzunvs.mongodb.net:27017,ac-xc33ipv-shard-00-01.6mzunvs.mongodb.net:27017,ac-xc33ipv-shard-00-02.6mzunvs.mongodb.net:27017/test?ssl=true&replicaSet=atlas-asahlb-shard-0&authSource=admin&retryWrites=true&w=majority';
mongoose.connect(uri)
  .then(async () => {
    const db = mongoose.connection.db;
    
    const results031 = await db.collection('quizz_results').find({ studentId: { $regex: new RegExp('st031', 'i') } }).toArray();
    const results047 = await db.collection('quizz_results').find({ studentId: { $regex: new RegExp('st047', 'i') } }).toArray();

    console.log('--- st031 (Affected) ---');
    console.log(results031.map(r => ({ quizId: r.quizId, correctAnswers: r.correctAnswers, score: r.score, totalQuestions: r.totalQuestions, submittedAt: r.submittedAt })));

    console.log('\n--- st047 (Working) ---');
    console.log(results047.map(r => ({ quizId: r.quizId, correctAnswers: r.correctAnswers, score: r.score, totalQuestions: r.totalQuestions, submittedAt: r.submittedAt })));

    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
