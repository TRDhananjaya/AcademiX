const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getTodayAttendance
} = require('../controllers/attendanceController');

router.post('/mark', markAttendance);
router.get('/today', getTodayAttendance);

module.exports = router;
