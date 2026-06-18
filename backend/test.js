const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI).then(async () => {
  const FollowupResult = mongoose.connection.collection('followup_results');
  const res1 = await FollowupResult.findOne({quizId: {$exists: true}});
  console.log('FollowupResult with quizId:', res1);
  const FollowupQuiz = mongoose.connection.collection('followup_quizzes');
  const fq = await FollowupQuiz.findOne();
  console.log('FollowupQuiz:', fq);
  process.exit();
}).catch(console.error);
