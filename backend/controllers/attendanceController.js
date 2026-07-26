const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const { sendAttendanceWhatsApp } = require('../services/whatsappService');

/**
 * Helper to get normalized date (midnight 00:00:00) for consistent daily attendance querying
 */
const getTodayMidnight = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

// @desc    Mark student attendance & send WhatsApp to parent
// @route   POST /api/attendance/mark
// @access  Private/Public
const markAttendance = async (req, res, next) => {
  try {
    const { studentId, studentDbId } = req.body;

    if (!studentId && !studentDbId) {
      res.status(400);
      throw new Error('Please provide studentId or studentDbId');
    }

    // 1. Find Student by ObjectId or string studentId (e.g. STU-1005)
    let student = null;
    if (studentDbId) {
      student = await Student.findById(studentDbId);
    } else if (studentId) {
      student = await Student.findOne({
        $or: [
          { studentId: studentId.trim().toUpperCase() },
          { studentId: studentId.trim() },
          { _id: studentId.match(/^[0-9a-fA-F]{24}$/) ? studentId : null }
        ].filter(Boolean)
      });
    }

    if (!student) {
      res.status(404);
      throw new Error('Student not found');
    }

    const todayDate = getTodayMidnight();
    const timeArrived = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 2. Check if attendance already marked for today
    let existingAttendance = await Attendance.findOne({
      student: student._id,
      date: todayDate
    });

    if (existingAttendance) {
      return res.status(200).json({
        success: true,
        alreadyMarked: true,
        message: `Attendance for ${student.name} is already marked for today (${existingAttendance.timeArrived || 'Earlier'}).`,
        data: existingAttendance,
        student
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
      message: `Attendance marked successfully for ${student.name}.`,
      whatsappSent: whatsappSuccess,
      parentMobile: student.parentMobile || 'Not Provided',
      data: attendance,
      student
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all attendance records for today
// @route   GET /api/attendance/today
// @access  Private/Public
const getTodayAttendance = async (req, res, next) => {
  try {
    const todayDate = getTodayMidnight();

    const attendanceRecords = await Attendance.find({ date: todayDate })
      .populate('student', 'name studentId email grade parentMobile studentMobile status')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: attendanceRecords.length,
      data: attendanceRecords
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  markAttendance,
  getTodayAttendance
};
