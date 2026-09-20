const http = require('http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const QuizResult = require('../models/QuizResult');
const User = require('../models/User');

async function testDeleteRoute() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const user = await User.findOne({ username: 'st001' });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

  // Create dummy result to test deletion
  const dummy = new QuizResult({
    quizId: 'TEST_Q999',
    studentId: 'st999',
    studentName: 'Test Student',
    correctAnswers: 15,
    score: 15,
    totalQuestions: 20,
    percentage: 75,
    timeTaken: '0m 30s',
    status: 'Pass'
  });

  const saved = await dummy.save();
  console.log('Created test quiz result ID:', saved._id.toString());

  // Make HTTP DELETE request to /api/quiz-results/:id
  const req = http.request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/quiz-results/${saved._id.toString()}`,
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', async () => {
      console.log('HTTP Status:', res.statusCode);
      console.log('Response:', body);

      // Verify deletion in MongoDB
      const check = await QuizResult.findById(saved._id);
      console.log('MongoDB check after delete (should be null):', check);
      await mongoose.disconnect();
    });
  });

  req.end();
}

testDeleteRoute().catch(err => console.error(err));
