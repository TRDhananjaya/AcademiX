const express = require('express');
const router = express.Router();
const { roleMiddleware } = require('../middleware/roleMiddleware');
const {
  markAttendance,
  getTodayAttendance,
  getStudentAttendanceHistory
} = require('../controllers/attendanceController');

// Only teachers can mark and view class attendance
router.post('/mark', roleMiddleware('teacher'), markAttendance);
router.get('/today', roleMiddleware('teacher'), getTodayAttendance);
router.get('/history', roleMiddleware('teacher'), getTodayAttendance);

// Both teachers and students can view a student's attendance history
router.get('/student/:studentId', getStudentAttendanceHistory);

module.exports = router;
