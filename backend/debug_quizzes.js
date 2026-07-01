const mongoose = require('mongoose');
const uri = 'mongodb://root:root@ac-xc33ipv-shard-00-00.6mzunvs.mongodb.net:27017,ac-xc33ipv-shard-00-01.6mzunvs.mongodb.net:27017,ac-xc33ipv-shard-00-02.6mzunvs.mongodb.net:27017/test?ssl=true&replicaSet=atlas-asahlb-shard-0&authSource=admin&retryWrites=true&w=majority';
mongoose.connect(uri).then(async () => {
  const db = mongoose.connection.db;
  
  // Find ST059 completed quizzes
  const results = await db.collection('quizz_results').find({ studentId: 'st059' }).toArray();
  const completed = [...new Set(results.map(r => r.quizId))];
  console.log('ST059 Completed:', completed);
  
  // Find all quizzes in DB
  const allQuizzes = await db.collection('quizzes').find({}).toArray();
  console.log('Total Quizzes in DB:', allQuizzes.length);
  
  // Find the lesson for Q1.1
  const q1 = allQuizzes.find(q => q.quizCode === 'Q1.1');
  if(!q1) return console.log('Q1.1 not found');
  
  const mod = await db.collection('modules').findOne({ _id: q1.moduleId });
  if(!mod) return console.log('Module for Q1.1 not found');
  console.log('Module for Q1.1 belongs to Lesson:', mod.lessonId);
  
  const lessonModules = await db.collection('modules').find({ lessonId: mod.lessonId }).toArray();
  const modIds = lessonModules.map(m => m._id.toString());
  const modIdsObj = lessonModules.map(m => m._id);
  
  const lessonQuizzes = allQuizzes.filter(q => {
    const qm = (q.moduleId || '').toString();
    return modIds.includes(qm) || modIdsObj.some(id => id.equals(q.moduleId));
  });
  
  console.log('Lesson Quizzes:', lessonQuizzes.map(q => q.quizCode));
  console.log('Length:', lessonQuizzes.length, 'vs Completed:', completed.length);
  
  mongoose.disconnect();
}).catch(console.error);
