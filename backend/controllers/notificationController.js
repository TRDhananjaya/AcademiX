const Notification = require('../models/Notification');
const StudyPlan = require('../models/StudyPlan');
const QuizResult = require('../models/QuizResult');
const Quiz = require('../models/Quiz');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Student = require('../models/Student');
const Prediction = require('../models/Prediction');
const mongoose = require('mongoose');

const syncUnderperformanceNotifications = async (user) => {
  if (user.role !== 'student') return;
  
  try {
    const student = await Student.findOne({ userId: user._id });
    if (!student) return;

    const latestPredictions = await Prediction.aggregate([
      { $match: { studentId: student._id, lessonId: { $nin: ['General', 'Final Exam', 'Final Exam (All Lessons)', '', null] } } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: { studentId: "$studentId", lessonId: "$lessonId" }, latestPrediction: { $first: "$$ROOT" } } },
      { $replaceRoot: { newRoot: "$latestPrediction" } },
      { $match: { predictedScore: { $lt: 50 } } }
    ]);

    if (latestPredictions.length === 0) return;

    const allLessons = await Lesson.find({}).select('title lessonNumber _id').lean().catch(() => []);
    const lessonMap = {};
    for (const l of allLessons) {
      const formatted = l.title.toLowerCase().startsWith('lesson') ? l.title : `Lesson ${l.lessonNumber} - ${l.title}`;
      lessonMap[l.lessonNumber] = formatted;
      if (l._id) lessonMap[l._id.toString()] = formatted;
    }

    const defaultLessonNames = {
        1: "Information and Communication Technology",
        2: "Fundamentals of a Computer System",
        3: "Data Representation Methods in Computer Systems",
        4: "Logic Gates with Boolean Functions",
        5: "Operating Systems",
        6: "Word Processing",
        7: "Electronic Spreadsheet",
        8: "Electronic Presentations",
        9: "Database"
    };

    for (const pred of latestPredictions) {
      let num = parseInt(pred.lessonId, 10);
      if (isNaN(num)) {
          const match = pred.lessonId?.toString().match(/^[QL](\d+)/i);
          if (match) num = parseInt(match[1], 10);
      }
      
      let lName = `Lesson ${pred.lessonId}`;
      let relatedLessonId = null;

      if (!isNaN(num) && lessonMap[num]) {
          lName = lessonMap[num];
          const lObj = allLessons.find(l => l.lessonNumber === num);
          if (lObj) relatedLessonId = lObj._id;
      } else if (pred.lessonId && lessonMap[pred.lessonId.toString()]) {
          lName = lessonMap[pred.lessonId.toString()];
          if (mongoose.Types.ObjectId.isValid(pred.lessonId.toString())) {
             relatedLessonId = pred.lessonId;
          }
      } else if (!isNaN(num) && defaultLessonNames[num]) {
          lName = `Lesson ${num} - ${defaultLessonNames[num]}`;
      }

      const syncKey = `UNDERPERFORMANCE:${student.studentId}:${pred.lessonId}`;
      const exists = await Notification.findOne({
        recipientId: user._id,
        notificationType: 'Underperformance Alert',
        relatedStudentId: syncKey
      });

      if (!exists) {
        await Notification.create({
          recipientId: user._id,
          recipientRole: 'student',
          title: '🔴 Academic Performance Alert',
          message: `Your predicted performance for "${lName}" is below the expected 50% threshold. Predicted Score: ${Number(pred.predictedScore).toFixed(2)}%`,
          notificationType: 'Underperformance Alert',
          relatedLessonId: relatedLessonId,
          relatedStudentId: syncKey,
          isRead: false
        });
      }
    }
  } catch (error) {
    console.error('Error syncing underperformance notifications:', error);
  }
};

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    if (req.user && req.user.role === 'student') {
        await syncUnderperformanceNotifications(req.user);
    }
    const notifications = await Notification.find({ recipientId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error while fetching notifications' });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    // Verify ownership
    if (notification.recipientId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    notification.isRead = true;
    await notification.save();
    res.status(200).json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getNotifications,
  markAsRead
};
