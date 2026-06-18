const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const fs = require('fs');
const path = require('path');
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

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

const loadQuestions = () => {
  const csvPath = path.join(__dirname, '../../Module_1_1_Questions.csv');
  const questions = [];
  if (fs.existsSync(csvPath)) {
    const content = fs.readFileSync(csvPath, 'utf8');
    const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
    for (let i = 1; i < lines.length; i++) {
      const fields = parseCsvLine(lines[i]);
      if (fields.length >= 6) {
        const questionText = fields[0];
        const options = [fields[1], fields[2], fields[3], fields[4]];
        const correctLetter = fields[5].toUpperCase();
        const correctOption = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 }[correctLetter] ?? 0;
        questions.push({
          text: questionText,
          options,
          correctOption
        });
      }
    }
    console.log(`Loaded ${questions.length} questions from CSV`);
  } else {
    console.log(`CSV file not found at ${csvPath}`);
  }
  return questions;
};

const seedDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/academix';
    await mongoose.connect(uri);
    console.log('Connected to DB...');

    // Clear existing quizzes that don't match the new schema
    await Quiz.deleteMany({});
    console.log('Cleared existing quizzes...');

    const m1_1_questions = loadQuestions();

    const quizzesToInsert = modulesData.map(m => ({
      quizCode: m.code,
      title: `Module ${m.code.substring(1)} – ${m.title}`,
      moduleId: `MODULE_${m.code.substring(1).replace('.', '_')}`,
      bundleTopic: m.topic,
      questions: m.code === 'Q1.1' ? m1_1_questions : []
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
