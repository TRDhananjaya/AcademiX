const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/academix').then(async () => {
  const db = mongoose.connection.db;
  
  const totalRecords = await db.collection('quizz_results').countDocuments();
  console.log(`Total records in quizz_results: ${totalRecords}`);

  const distinctQuizIds = await db.collection('quizz_results').distinct('quizId');
  console.log(`Distinct quizIds in quizz_results:`, distinctQuizIds);

  for (const qid of distinctQuizIds) {
    const count = await db.collection('quizz_results').countDocuments({ quizId: qid });
    console.log(`Records for quizId ${qid}: ${count}`);
  }

  // Find records with NO quizId
  const noQuizIdCount = await db.collection('quizz_results').countDocuments({ quizId: { $exists: false } });
  console.log(`Records with no quizId: ${noQuizIdCount}`);

  process.exit(0);
}).catch(console.error);
