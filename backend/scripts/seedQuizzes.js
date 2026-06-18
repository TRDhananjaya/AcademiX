const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
require('dotenv').config();

const modulesData = [
  // First Term
  { code: 'Q1.1', title: 'Introduction to ICT', topic: 'Lesson 1: Information and Communication Technology' },
  { code: 'Q1.2', title: 'Applications of ICT in daily life', topic: 'Lesson 1: Information and Communication Technology' },
  { code: 'Q1.3', title: 'Benefits and challenges of ICT', topic: 'Lesson 1: Information and Communication Technology' },
  { code: 'Q2.1', title: 'Fundamentals of a Computer System 2.1', topic: 'Lesson 2: Fundamentals of a Computer System' },
  { code: 'Q2.2', title: 'Fundamentals of a Computer System 2.2', topic: 'Lesson 2: Fundamentals of a Computer System' },
  { code: 'Q2.3', title: 'Fundamentals of a Computer System 2.3', topic: 'Lesson 2: Fundamentals of a Computer System' },
  { code: 'Q3.1', title: 'Data Representation Methods 3.1', topic: 'Lesson 3: Data Representation Methods in Computer Systems' },
  { code: 'Q3.2', title: 'Data Representation Methods 3.2', topic: 'Lesson 3: Data Representation Methods in Computer Systems' },
  { code: 'Q3.3', title: 'Data Representation Methods 3.3', topic: 'Lesson 3: Data Representation Methods in Computer Systems' },
  // Second Term
  { code: 'Q4.1', title: 'Logic Gates with Boolean Functions 4.1', topic: 'Lesson 4: Logic Gates with Boolean Functions' },
  { code: 'Q4.2', title: 'Logic Gates with Boolean Functions 4.2', topic: 'Lesson 4: Logic Gates with Boolean Functions' },
  { code: 'Q4.3', title: 'Logic Gates with Boolean Functions 4.3', topic: 'Lesson 4: Logic Gates with Boolean Functions' },
  { code: 'Q5.1', title: 'Operating Systems 5.1', topic: 'Lesson 5: Operating Systems' },
  { code: 'Q5.2', title: 'Operating Systems 5.2', topic: 'Lesson 5: Operating Systems' },
  { code: 'Q5.3', title: 'Operating Systems 5.3', topic: 'Lesson 5: Operating Systems' },
  { code: 'Q6.1', title: 'Word Processing 6.1', topic: 'Lesson 6: Word Processing' },
  { code: 'Q6.2', title: 'Word Processing 6.2', topic: 'Lesson 6: Word Processing' },
  { code: 'Q6.3', title: 'Word Processing 6.3', topic: 'Lesson 6: Word Processing' },
  // Third Term
  { code: 'Q7.1', title: 'Electronic Spreadsheet 7.1', topic: 'Lesson 7: Electronic Spreadsheet' },
  { code: 'Q7.2', title: 'Electronic Spreadsheet 7.2', topic: 'Lesson 7: Electronic Spreadsheet' },
  { code: 'Q7.3', title: 'Electronic Spreadsheet 7.3', topic: 'Lesson 7: Electronic Spreadsheet' },
  { code: 'Q8.1', title: 'Electronic Presentations 8.1', topic: 'Lesson 8: Electronic Presentations' },
  { code: 'Q8.2', title: 'Electronic Presentations 8.2', topic: 'Lesson 8: Electronic Presentations' },
  { code: 'Q8.3', title: 'Electronic Presentations 8.3', topic: 'Lesson 8: Electronic Presentations' },
  { code: 'Q9.1', title: 'Database 9.1', topic: 'Lesson 9: Database' },
  { code: 'Q9.2', title: 'Database 9.2', topic: 'Lesson 9: Database' },
  { code: 'Q9.3', title: 'Database 9.3', topic: 'Lesson 9: Database' }
];

const seedDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/academix';
    await mongoose.connect(uri);
    console.log('Connected to DB...');

    // Clear existing quizzes that don't match the new schema
    await Quiz.deleteMany({});
    console.log('Cleared existing quizzes...');

    const quizzesToInsert = modulesData.map(m => ({
      quizCode: m.code,
      title: `Module ${m.code.substring(1)} – ${m.title}`,
      moduleId: `MODULE_${m.code.substring(1).replace('.', '_')}`,
      bundleTopic: m.topic,
      questions: [] // empty for now, or could add dummy questions
    }));

    await Quiz.insertMany(quizzesToInsert);
    console.log('Successfully seeded quizzes!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding DB:', error);
    process.exit(1);
  }
};

seedDB();
