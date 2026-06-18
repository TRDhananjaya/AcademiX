require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/academix';

mongoose.connect(uri).then(async () => {
  const db = mongoose.connection.db;
  
  const totalRecords = await db.collection('quizz_results').countDocuments();
  console.log(`Total records in quizz_results: ${totalRecords}`);

  // Set quizId to "Q1.1" for all records
  const result = await db.collection('quizz_results').updateMany({}, { $set: { quizId: "Q1.1" } });
  
  console.log(`Updated ${result.modifiedCount} records to have quizId: "Q1.1"`);

  process.exit(0);
}).catch(console.error);
