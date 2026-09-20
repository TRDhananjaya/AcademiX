const mongoose = require('mongoose');
const Student = require('./models/Student');
const User = require('./models/User');
const Prediction = require('./models/Prediction');
const { getNotifications } = require('./controllers/notificationController');

require('dotenv').config({ path: './.env' });
async function test() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/academix');
  
  // Find a student with a predictedScore < 50
  const pred = await Prediction.findOne({ predictedScore: { $lt: 50 }, lessonId: { $nin: ['General', 'Final Exam', 'Final Exam (All Lessons)', '', null] } });
  
  if (!pred) {
    console.log("No underperforming prediction found");
    process.exit();
  }
  console.log("Found prediction for studentId:", pred.studentId);

  const student = await Student.findById(pred.studentId);
  if (!student) {
      console.log("No student document found for that studentId");
      process.exit();
  }
  
  const user = await User.findById(student.userId);
  if (!user) {
    console.log("No user found");
    process.exit();
  }
  console.log("Found user:", user.username);

  const req = { user };
  const res = {
    status: function(s) {
      this.statusCode = s;
      return this;
    },
    json: function(data) {
      console.log('Status:', this.statusCode);
      console.log('Notifications length:', data.length);
      console.log('Sample:', data[0]);
    }
  };

  const start = Date.now();
  await getNotifications(req, res);
  console.log('Time taken 1:', Date.now() - start, 'ms');

  // Let's run it again to check idempotency
  const start2 = Date.now();
  await getNotifications(req, res);
  console.log('Time taken 2:', Date.now() - start2, 'ms');

  process.exit();
}
test();
