const express = require('express');
const router = express.Router();
const { roleMiddleware } = require('../middleware/roleMiddleware');
const {
  markAttendance,
  getTodayAttendance,
  getStudentAttendanceHistory
} = require('../controllers/attendanceController');

// Teachers can mark attendance
router.post('/mark', roleMiddleware('teacher'), markAttendance);

// Both teachers and students can check today's attendance
router.get('/today', getTodayAttendance);
router.get('/history', roleMiddleware('teacher'), getTodayAttendance);

// Both teachers and students can view a student's attendance history
router.get('/student/:studentId', getStudentAttendanceHistory);

module.exports = router;
