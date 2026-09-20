const mongoose = require('mongoose');
const Student = require('./models/Student');
require('dotenv').config({ path: './.env' });
async function test() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/academix');
  const start = Date.now();
  const students = await Student.find({}).select('studentId name').limit(31).lean();
  console.log('Student find took:', Date.now() - start, 'ms');
  process.exit();
}
test();
