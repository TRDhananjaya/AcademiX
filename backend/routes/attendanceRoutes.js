const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getTodayAttendance,
  getStudentAttendanceHistory
} = require('../controllers/attendanceController');

router.post('/mark', markAttendance);
router.get('/today', getTodayAttendance);
router.get('/history', getTodayAttendance);
router.get('/student/:studentId', getStudentAttendanceHistory);

module.exports = router;
