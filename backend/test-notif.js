const mongoose = require('mongoose');
const User = require('./models/User');
const Student = require('./models/Student');
const Prediction = require('./models/Prediction');
const Notification = require('./models/Notification');
const { getNotifications } = require('./controllers/notificationController');

require('dotenv').config({ path: './.env' });

async function verifyNotificationText() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/academix');
  
  // Find a student with a predictedScore < 50
  const pred = await Prediction.findOne({ predictedScore: { $lt: 50 }, lessonId: { $nin: ['General', 'Final Exam', 'Final Exam (All Lessons)', '', null] } });
  
  if (!pred) {
    console.log("No underperforming prediction found");
    process.exit();
  }

  const student = await Student.findById(pred.studentId);
  const user = await User.findById(student.userId);

  // Clear existing notification for this specific lesson to force recreation
  const syncKey = `UNDERPERFORMANCE:${student.studentId}:${pred.lessonId}`;
  await Notification.deleteOne({ relatedStudentId: syncKey });

  const req = { user };
  const res = {
    status: function(s) { return this; },
    json: function(data) {
      const notif = data.find(n => n.relatedStudentId === syncKey);
      if (notif) {
        console.log("=== NOTIFICATION VERIFICATION ===");
        console.log("Title:", notif.title);
        console.log("Message:\n" + notif.message);
        console.log("=================================");
      } else {
        console.log("Notification not generated!");
      }
    }
  };

  await getNotifications(req, res);
  process.exit();
}

verifyNotificationText();
