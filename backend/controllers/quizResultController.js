const QuizResult = require('../models/QuizResult');
const Quiz = require('../models/Quiz');
const mongoose = require('mongoose');

// @desc    Submit a quiz and save result
// @route   POST /api/quiz-results
// @access  Public (for now)
const submitQuiz = async (req, res) => {
  try {
    const { quizId, studentId, studentName, correctAnswers, totalQuestions, percentage, timeTaken, answersDetails } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const result = new QuizResult({
      quizId: quiz.quizCode,
      studentId,
      studentName,
      correctAnswers,
      score: correctAnswers,
      totalQuestions,
      percentage,
      timeTaken,
      status: percentage >= 50 ? 'Pass' : 'Fail',
      answersDetails: answersDetails || []
    });

    const savedResult = await result.save();
    
    // --- START AI STUDY PLAN WORKFLOW LOGIC ---
    try {
      const Module = require('../models/Module');
      const Lesson = require('../models/Lesson');
      const StudyPlan = require('../models/StudyPlan');
      const Notification = require('../models/Notification');
      const User = require('../models/User');

      let currentModule = null;
      if (mongoose.Types.ObjectId.isValid(quiz.moduleId)) {
         currentModule = await Module.findById(quiz.moduleId);
      } else if (typeof quiz.moduleId === 'string' && quiz.moduleId.startsWith('MODULE_')) {
         const parts = quiz.moduleId.split('_');
         if (parts.length >= 3) {
            const modulePrefix = `Module ${parts[1]}.${parts[2]}`;
            currentModule = await Module.findOne({ title: { $regex: `^${modulePrefix}`, $options: 'i' } });
         }
      }

      if (currentModule && currentModule.lessonId) {
        // Find all modules for this lesson
        const lessonModules = await Module.find({ lessonId: currentModule.lessonId });
        const moduleIds = lessonModules.map(m => m._id.toString());
        
        const stringModuleIds = lessonModules.map(m => {
           const match = m.title.match(/Module\s+(\d+)\.(\d+)/i);
           if (match) {
              return `MODULE_${match[1]}_${match[2]}`;
           }
           return null;
        }).filter(Boolean);
        
        // Find all quizzes for these modules
        const lessonQuizzes = await Quiz.find({ 
          $or: [
             { moduleId: { $in: moduleIds } },
             { moduleId: { $in: lessonModules.map(m => m._id) } },
             { moduleId: { $in: stringModuleIds } }
          ]
        });

        if (lessonQuizzes.length > 0) {
          const quizCodes = lessonQuizzes.map(q => q.quizCode);
          
          // Find all results for this student on these quizzes
          const studentResults = await QuizResult.find({
            studentId,
            quizId: { $in: quizCodes }
          });

          // Unique completed quizzes by this student
          const completedQuizCodes = [...new Set(studentResults.map(r => r.quizId))];

          // Check if all quizzes are completed
          if (completedQuizCodes.length === quizCodes.length) {
            // Verify no pending notification or generated study plan already exists
            const existingPlan = await StudyPlan.findOne({
              studentId,
              lessonId: currentModule.lessonId
            });

            const existingNotification = await Notification.findOne({
              relatedStudentId: studentId,
              relatedLessonId: currentModule.lessonId,
              notificationType: 'StudyPlanApproval',
              status: { $in: ['Pending', 'Approved'] }
            });

            if (!existingPlan && !existingNotification) {
              const { generateStudyPlanAsync } = require('../services/studyPlanService');
              
              // Trigger the AI study plan generation in the background!
              // We do not await this, so the quiz submission HTTP request completes immediately.
              generateStudyPlanAsync(studentId, studentName, currentModule.lessonId)
                .catch(err => console.error('Background study plan generation failed:', err));
            }
          }
        }
      }
    } catch (err) {
      console.error('Error triggering study plan workflow:', err);
    }
    // --- END AI STUDY PLAN WORKFLOW LOGIC ---

    res.status(201).json(savedResult);
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ message: 'Server error while submitting quiz' });
  }
};

// @desc    Get paginated, filtered, and sorted results for a specific quiz
// @route   GET /api/quiz-results/quiz/:quizId
// @access  Public (for now)
const getResultsByQuiz = async (req, res) => {
  try {
    const quizId = req.params.quizId;
    
    // The frontend passes the Quiz ObjectId, but the results collection stores the quizCode (e.g., 'Q1.1')
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    const targetQuizCode = quiz.quizCode;

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const search = req.query.search || '';
    const sortField = req.query.sort || 'submittedAt';
    
    // Sort logic (descending by default, can configure differently if needed)
    const sortOrder = -1; 
    let sortOptions = {};
    sortOptions[sortField] = sortOrder;

    // Filter logic
    const query = { quizId: targetQuizCode };
    
    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: "i" } },
        { studentId: { $regex: search, $options: "i" } }
      ];
    }

    const startIndex = (page - 1) * limit;

    const total = await QuizResult.countDocuments(query);
    
    const data = await QuizResult.find(query)
      .sort(sortOptions)
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      total,
      page,
      limit,
      data
    });

  } catch (error) {
    console.error('Error fetching quiz results:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all results for a specific student
// @route   GET /api/quiz-results/student/:studentId
// @access  Public (for now)
const getResultsByStudent = async (req, res) => {
  try {
    const results = await QuizResult.find({ studentId: req.params.studentId }).sort({ submittedAt: -1 });
    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching student results:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all quiz results (recent first)
// @route   GET /api/quiz-results
// @access  Public (for now)
const getAllResults = async (req, res) => {
  try {
    const results = await QuizResult.aggregate([
      { $sort: { submittedAt: -1 } },
      { $limit: 100 },
      { $lookup: {
          from: 'quizzes',
          localField: 'quizId',
          foreignField: 'quizCode',
          as: 'quizData'
      }},
      { $unwind: { path: '$quizData', preserveNullAndEmptyArrays: true } },
      { $addFields: {
          quizTitle: '$quizData.title',
          bundleTopic: '$quizData.bundleTopic'
      }},
      { $project: { quizData: 0 } }
    ]);
    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching all quiz results:', error);
    res.status(500).json({ message: 'Server error while fetching results' });
  }
};

module.exports = {
  submitQuiz,
  getResultsByQuiz,
  getResultsByStudent,
  getAllResults
};
