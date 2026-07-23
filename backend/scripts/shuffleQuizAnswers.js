const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const QuizQuestions = require('../models/QuizQuestions');
require('dotenv').config();

function shuffleQuestion(question) {
  if (!question.options || question.options.length <= 1) return false;
  const originalOptions = [...question.options];
  const correctOptionIndex = question.correctOption;

  if (correctOptionIndex < 0 || correctOptionIndex >= originalOptions.length) {
    console.warn(`  [Warning] Invalid correctOption index (${correctOptionIndex}) for question: "${question.text.substring(0, 40)}..."`);
    return false;
  }

  const correctAnswerText = originalOptions[correctOptionIndex];

  // Fisher-Yates Shuffle
  for (let i = originalOptions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [originalOptions[i], originalOptions[j]] = [originalOptions[j], originalOptions[i]];
  }

  const newCorrectOption = originalOptions.indexOf(correctAnswerText);
  if (newCorrectOption !== -1) {
    question.options = originalOptions;
    question.correctOption = newCorrectOption;
    return true;
  } else {
    console.error(`  [Error] Could not find correct answer text after shuffle for question: "${question.text.substring(0, 40)}..."`);
    return false;
  }
}

const runMigration = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/academix';
    console.log('Connecting to database...');
    await mongoose.connect(uri);
    console.log('Connected.');

    // 1. Update Quizzes
    console.log('\n--- Processing Quizzes ---');
    const quizzes = await Quiz.find({});
    let updatedQuizzesCount = 0;
    for (const quiz of quizzes) {
      if (!quiz.questions || quiz.questions.length === 0) continue;
      
      let modified = false;
      for (const question of quiz.questions) {
        const shuf = shuffleQuestion(question);
        if (shuf) modified = true;
      }
      
      if (modified) {
        quiz.markModified('questions');
        await quiz.save();
        updatedQuizzesCount++;
        console.log(`Shuffled options and updated correct indices for Quiz: ${quiz.quizCode} ("${quiz.title}")`);
      }
    }
    console.log(`Updated ${updatedQuizzesCount} quiz documents.`);

    // 2. Update Quiz Questions Bank
    console.log('\n--- Processing Quiz Question Banks ---');
    const bankModules = await QuizQuestions.find({});
    let updatedBanksCount = 0;
    for (const bank of bankModules) {
      if (!bank.questions || bank.questions.length === 0) continue;

      let modified = false;
      for (const question of bank.questions) {
        const shuf = shuffleQuestion(question);
        if (shuf) modified = true;
      }

      if (modified) {
        bank.markModified('questions');
        await bank.save();
        updatedBanksCount++;
        console.log(`Shuffled options and updated correct indices for Question Bank: ${bank.quizCode} ("${bank.title}")`);
      }
    }
    console.log(`Updated ${updatedBanksCount} question bank documents.`);

    console.log('\nMigration completed successfully!');
    mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

runMigration();
