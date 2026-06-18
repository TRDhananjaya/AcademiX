const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/academix';

mongoose.connect(uri)
  .then(async () => {
    const db = mongoose.connection.db;
    const results = await db.collection('quizz_results').find({}).limit(2).toArray();
    console.log("Sample QuizResults:");
    console.log(JSON.stringify(results, null, 2));
    
    const quizzes = await db.collection('quizzes').find({}).limit(2).toArray();
    console.log("Sample Quizzes:");
    console.log(JSON.stringify(quizzes, null, 2));
    
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
