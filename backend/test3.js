require('dotenv').config();
const mongoose = require('mongoose');
const { generateStudyPlanAsync } = require('./services/studyPlanService');
const Module = require('./models/Module');

const uri = 'mongodb://root:root@ac-xc33ipv-shard-00-00.6mzunvs.mongodb.net:27017,ac-xc33ipv-shard-00-01.6mzunvs.mongodb.net:27017,ac-xc33ipv-shard-00-02.6mzunvs.mongodb.net:27017/test?ssl=true&replicaSet=atlas-asahlb-shard-0&authSource=admin&retryWrites=true&w=majority';

mongoose.connect(uri).then(async () => {
  console.log('Connected to DB');
  
  const q1Module = await Module.findOne({ title: /Module 1.1/i });
  
  if (q1Module && q1Module.lessonId) {
    console.log('Found Lesson ID:', q1Module.lessonId);
    
    // Simulate generation for ST059
    await generateStudyPlanAsync('st059', 'ST059 Name', q1Module.lessonId);
    console.log('Done!');
  } else {
    console.log('Could not find lesson');
  }
  
  setTimeout(() => mongoose.disconnect(), 15000); // Wait for async completion
}).catch(console.error);
