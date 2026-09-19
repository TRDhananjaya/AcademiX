const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const { sendAttendanceWhatsApp } = require('../services/whatsappService');

const TIMEZONE = process.env.TIMEZONE || 'Asia/Colombo';

/**
 * Helper to get normalized date (midnight 00:00:00) for consistent daily attendance querying in local timezone
 */
const getTodayMidnight = () => {
  const colomboDateStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());

  const [year, month, day] = colomboDateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// @desc    Mark student attendance & send WhatsApp to parent
// @route   POST /api/attendance/mark
// @access  Private/Public
const markAttendance = async (req, res, next) => {
  try {
    const { studentId, studentDbId, email } = req.body;

    if (!studentId && !studentDbId && !email) {
      res.status(400);
      throw new Error('Please provide studentId, studentDbId, or email');
    }

    // 1. Find Student by ObjectId, string studentId (e.g. STU-1005), or email
    let student = null;
    if (studentDbId) {
      student = await Student.findById(studentDbId);
    }
    
    if (!student && studentId) {
      const cleanId = String(studentId).trim();
      student = await Student.findOne({
        $or: [
          { studentId: cleanId.toUpperCase() },
          { studentId: cleanId },
          { email: cleanId.toLowerCase() },
          { _id: cleanId.match(/^[0-9a-fA-F]{24}$/) ? cleanId : null }
        ].filter(Boolean)
      });
    }

    if (!student && email) {
      student = await Student.findOne({ email: String(email).trim().toLowerCase() });
    }

    if (!student) {
      res.status(404);
      throw new Error('Student not found');
    }

    const todayDate = getTodayMidnight();
    const timeArrived = new Date().toLocaleTimeString('en-US', {
      timeZone: TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    // 2. Check if attendance already marked for today
    let existingAttendance = await Attendance.findOne({
      student: student._id,
      date: todayDate
    });

    if (existingAttendance) {
      if (req.body.forceSend) {
        let whatsappSuccess = false;
        if (student.parentMobile) {
          whatsappSuccess = await sendAttendanceWhatsApp(student.parentMobile, student.name, existingAttendance.timeArrived || timeArrived);
          if (whatsappSuccess) {
            existingAttendance.whatsappSent = true;
            await existingAttendance.save();
          }
        }
        return res.status(200).json({
          success: true,
          alreadyMarked: true,
          whatsappSent: whatsappSuccess,
          message: whatsappSuccess
            ? `Parent notification sent successfully via WhatsApp to ${student.parentMobile}!`
            : `Could not send WhatsApp notification. Please verify phone number format.`,
          parentMobile: student.parentMobile || 'Not Provided',
          data: existingAttendance,
          student
        });
      }

      return res.status(400).json({
        success: false,
        alreadyMarked: true,
        message: `Attendance for ${student.name} (${student.studentId}) is ALREADY MARKED for today at ${existingAttendance.timeArrived || 'earlier'}. Duplicate scanning is not allowed.`,
        student,
        data: existingAttendance
      });
    }

    // 3. Create Attendance Record
    const attendance = await Attendance.create({
      student: student._id,
      date: todayDate,
      status: 'Present',
      timeArrived,
      markedBy: req.user ? req.user._id : undefined
    });

    // 4. Trigger Parent WhatsApp Notification (Async non-blocking)
    let whatsappSuccess = false;

    if (student.parentMobile) {
      whatsappSuccess = await sendAttendanceWhatsApp(student.parentMobile, student.name, timeArrived);
      if (whatsappSuccess) {
        attendance.whatsappSent = true;
        await attendance.save();
      }
    } else {
      console.warn(`No parent mobile registered for student ${student.name} (${student.studentId})`);
    }

    res.status(201).json({
      success: true,
      alreadyMarked: false,
      message: `Attendance marked successfully for ${student.name} (${student.studentId}).`,
      whatsappSent: whatsappSuccess,
      parentMobile: student.parentMobile || 'Not Provided',
      data: attendance,
      student
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance records for today or a specific date (YYYY-MM-DD)
// @route   GET /api/attendance/today?date=YYYY-MM-DD&studentId=...
// @access  Private/Public
const getTodayAttendance = async (req, res, next) => {
  try {
    let targetDateStart, targetDateEnd;
    let selectedDateStr = req.query.date;

    if (selectedDateStr && /^\d{4}-\d{2}-\d{2}$/.test(selectedDateStr)) {
      const [year, month, day] = selectedDateStr.split('-').map(Number);
      targetDateStart = new Date(year, month - 1, day, 0, 0, 0, 0);
      targetDateEnd = new Date(year, month - 1, day, 23, 59, 59, 999);
    } else {
      const today = getTodayMidnight();
      targetDateStart = today;
      targetDateEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
      selectedDateStr = new Intl.DateTimeFormat('en-CA', {
        timeZone: TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(new Date());
    }

    let filterQuery = {
      $or: [
        { date: { $gte: targetDateStart, $lte: targetDateEnd } },
        { createdAt: { $gte: targetDateStart, $lte: targetDateEnd } }
      ]
    };

    if (req.query.studentId || req.query.student) {
      const searchStr = String(req.query.studentId || req.query.student).trim();
      const studentObj = await Student.findOne({
        $or: [
          { studentId: searchStr.toUpperCase() },
          { studentId: searchStr },
          { email: searchStr.toLowerCase() },
          { _id: searchStr.match(/^[0-9a-fA-F]{24}$/) ? searchStr : null }
        ].filter(Boolean)
      });
      if (studentObj) {
        filterQuery.student = studentObj._id;
      }
    }

    const attendanceRecords = await Attendance.find(filterQuery)
      .populate('student', 'name studentId email grade parentMobile studentMobile status color')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      selectedDate: selectedDateStr,
      count: attendanceRecords.length,
      data: attendanceRecords
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complete attendance history for a specific student
// @route   GET /api/attendance/student/:studentId
// @access  Private/Public
const getStudentAttendanceHistory = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    if (!studentId) {
      res.status(400);
      throw new Error('Please provide a student ID');
    }

    const cleanId = String(studentId).trim();
    const student = await Student.findOne({
      $or: [
        { studentId: cleanId.toUpperCase() },
        { studentId: cleanId },
        { email: cleanId.toLowerCase() },
        { _id: cleanId.match(/^[0-9a-fA-F]{24}$/) ? cleanId : null }
      ].filter(Boolean)
    });

    if (!student) {
      res.status(404);
      throw new Error('Student not found');
    }

    const records = await Attendance.find({ student: student._id })
      .populate('student', 'name studentId email grade parentMobile studentMobile status color')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      student,
      count: records.length,
      data: records
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  markAttendance,
  getTodayAttendance,
  getAttendanceByDate: getTodayAttendance,
  getStudentAttendanceHistory
};


