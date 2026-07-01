const StudyPlan = require('../models/StudyPlan');
const Student = require('../models/Student');
const User = require('../models/User');

// @desc    Get study plans for the logged-in student
// @route   GET /api/study-plans
// @access  Private
const getStudyPlans = async (req, res) => {
  try {
    // If the logged in user is a student, we might need to find their Student record first
    let studentIdToQuery = null;
    if (req.user.role === 'student') {
      const student = await Student.findOne({ email: req.user.email });
      if (student) {
        studentIdToQuery = student.studentId;
      }
    }
    
    // Fallback: maybe they query by passing studentId in query string?
    if (!studentIdToQuery && req.query.studentId) {
      studentIdToQuery = req.query.studentId;
    }

    if (!studentIdToQuery) {
      return res.status(400).json({ message: 'Could not determine student ID for study plans' });
    }

    const studyPlans = await StudyPlan.find({ studentId: studentIdToQuery })
      .populate('lessonId', 'title description')
      .sort({ createdAt: -1 });

    res.status(200).json(studyPlans);
  } catch (error) {
    console.error('Error fetching study plans:', error);
    res.status(500).json({ message: 'Server error while fetching study plans' });
  }
};

module.exports = {
  getStudyPlans
};
