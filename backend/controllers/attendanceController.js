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
    const timeArrived = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 2. Check if attendance already marked for today
    let existingAttendance = await Attendance.findOne({
      student: student._id,
      date: todayDate
    });

    if (existingAttendance) {
      // If forceSend is requested or WhatsApp notification wasn't sent yet, send now
      let whatsappSuccess = existingAttendance.whatsappSent;
      if (req.body.forceSend || !whatsappSuccess) {
        if (student.parentMobile) {
          whatsappSuccess = await sendAttendanceWhatsApp(student.parentMobile, student.name, existingAttendance.timeArrived || timeArrived);
          if (whatsappSuccess) {
            existingAttendance.whatsappSent = true;
            await existingAttendance.save();
          }
        }
      }

      return res.status(200).json({
        success: true,
        alreadyMarked: true,
        message: `Attendance for ${student.name} (${student.studentId}) is already marked for today (${existingAttendance.timeArrived || 'Earlier'}). ${whatsappSuccess ? 'WhatsApp notification sent to parent.' : ''}`,
        whatsappSent: existingAttendance.whatsappSent,
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
