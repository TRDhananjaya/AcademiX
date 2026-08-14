const QuizResult = require('../models/QuizResult');
const Quiz = require('../models/Quiz');
const mongoose = require('mongoose');
const xlsx = require('xlsx');
const Student = require('../models/Student');
const Lesson = require('../models/Lesson');
const Module = require('../models/Module');
const FollowupResult = require('../models/FollowupResult');
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
          const targetStudentId = (studentId || '').trim();
          const studentResults = await QuizResult.find({
            studentId: { $regex: new RegExp(`^${targetStudentId}$`, 'i') },
            quizId: { $in: quizCodes }
          });

          // Unique completed quizzes by this student
          const completedQuizCodes = [...new Set(studentResults.map(r => r.quizId))];

          // Check if all quizzes are completed
          if (completedQuizCodes.length === quizCodes.length) {
            // Verify no pending notification or generated study plan already exists
            const existingPlan = await StudyPlan.findOne({
              studentId: { $regex: new RegExp(`^${targetStudentId}$`, 'i') },
              lessonId: currentModule.lessonId
            });

            const existingNotification = await Notification.findOne({
              relatedStudentId: { $regex: new RegExp(`^${targetStudentId}$`, 'i') },
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
    const targetStudentId = (req.params.studentId || '').trim();
    const results = await QuizResult.find({
      studentId: { $regex: new RegExp(`^${targetStudentId}$`, 'i') }
    }).sort({ submittedAt: -1 });
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

// @desc    Export quiz results to Excel
// @route   GET /api/quiz-results/export-excel
// @access  Public (for now)
const exportQuizResultsExcel = async (req, res) => {
  try {
    const students = await Student.find({ status: 'Active' }).select('studentId name');
    const lessons = await Lesson.find().sort({ lessonNumber: 1 });
    const modules = await Module.find().sort({ title: 1 });
    const quizzes = await Quiz.find();
    
    // Process results into easy lookup
    const allQuizResults = await QuizResult.find().sort({ submittedAt: 1 }); // Ascending to keep latest
    const allFollowupResults = await FollowupResult.find().sort({ submittedAt: 1 });
    
    const studentQuizMap = {};
    for (const r of allQuizResults) {
      const sId = r.studentId ? r.studentId.toLowerCase() : '';
      if (!studentQuizMap[sId]) studentQuizMap[sId] = {};
      studentQuizMap[sId][r.quizId] = r.percentage !== undefined ? r.percentage : r.score;
    }
    
    const FollowupQuiz = mongoose.models.FollowupQuiz || require('../models/FollowUpQuiz');
    const followupQuizzes = await FollowupQuiz.find();
    
    const studentFollowupResultMap = {};
    for (const r of allFollowupResults) {
      const sId = r.studentId ? r.studentId.toLowerCase() : '';
      studentFollowupResultMap[sId] = r.percentage !== undefined ? r.percentage : r.score;
    }

    const moduleToCodeMap = {};
    for (const m of modules) {
        const match = m.title.match(/Module\s+(\d+)\.(\d+)/i);
        if (match) {
            moduleToCodeMap[m._id.toString()] = `MODULE_${match[1]}_${match[2]}`;
        }
    }

    const excelData = [];
    
    for (const student of students) {
      const sId = student.studentId.toLowerCase();
      
      for (const lesson of lessons) {
        const lessonModules = modules.filter(m => m.lessonId && m.lessonId.toString() === lesson._id.toString());
        lessonModules.sort((a, b) => a.title.localeCompare(b.title));
        
        let quiz1Score = null;
        let quiz2Score = null;
        let quiz3Score = null;
        let scores = [];
        
        if (lessonModules.length > 0) {
          const modStrId = moduleToCodeMap[lessonModules[0]._id.toString()];
          const q1 = quizzes.find(q => q.moduleId === lessonModules[0]._id.toString() || q.moduleId === modStrId);
          if (q1 && studentQuizMap[sId] && studentQuizMap[sId][q1.quizCode] !== undefined) {
            quiz1Score = studentQuizMap[sId][q1.quizCode];
            scores.push(quiz1Score);
          }
        }
        if (lessonModules.length > 1) {
          const modStrId = moduleToCodeMap[lessonModules[1]._id.toString()];
          const q2 = quizzes.find(q => q.moduleId === lessonModules[1]._id.toString() || q.moduleId === modStrId);
          if (q2 && studentQuizMap[sId] && studentQuizMap[sId][q2.quizCode] !== undefined) {
            quiz2Score = studentQuizMap[sId][q2.quizCode];
            scores.push(quiz2Score);
          }
        }
        if (lessonModules.length > 2) {
          const modStrId = moduleToCodeMap[lessonModules[2]._id.toString()];
          const q3 = quizzes.find(q => q.moduleId === lessonModules[2]._id.toString() || q.moduleId === modStrId);
          if (q3 && studentQuizMap[sId] && studentQuizMap[sId][q3.quizCode] !== undefined) {
            quiz3Score = studentQuizMap[sId][q3.quizCode];
            scores.push(quiz3Score);
          }
        }
        
        // Calculate Average
        let avgScore = null;
        if (scores.length > 0) {
          avgScore = parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2));
        }
        
        // Followup score
        let followupScore = null;
        const studentFq = followupQuizzes.find(fq => 
            fq.moduleId === lesson._id.toString() && 
            fq.quizCode && fq.quizCode.toLowerCase().includes(sId)
        );
        
        if (studentFq && studentFollowupResultMap[sId] !== undefined) {
           followupScore = studentFollowupResultMap[sId];
        } else if (scores.length > 0 && studentFollowupResultMap[sId] !== undefined) {
           followupScore = studentFollowupResultMap[sId];
        }
        
        if (quiz1Score !== null || quiz2Score !== null || quiz3Score !== null || followupScore !== null) {
          excelData.push({
            'Student_ID': student.studentId,
            'Student_Name': student.name,
            'Lesson_ID': `L${lesson.lessonNumber < 10 ? '0' + lesson.lessonNumber : lesson.lessonNumber}`,
            'Lesson_Name': lesson.title,
            'Quiz_1_Score': quiz1Score !== null ? quiz1Score : '',
            'Quiz_2_Score': quiz2Score !== null ? quiz2Score : '',
            'Quiz_3_Score': quiz3Score !== null ? quiz3Score : '',
            'Avg_Quiz_Score': avgScore !== null ? avgScore : '',
            'Followup_Quiz_Score': followupScore !== null ? followupScore : ''
          });
          if (followupScore !== null) delete studentFollowupResultMap[sId]; // Prevent duplicate mapping
        }
      }
    }
    
    excelData.sort((a, b) => {
      if (a.Lesson_ID !== b.Lesson_ID) return a.Lesson_ID.localeCompare(b.Lesson_ID);
      return a.Student_ID.localeCompare(b.Student_ID);
    });
    
    const wb = xlsx.utils.book_new();
    // Use json_to_sheet directly to convert the array of objects
    const ws = xlsx.utils.json_to_sheet(excelData, {
      header: [
        'Student_ID', 'Student_Name', 'Lesson_ID', 'Lesson_Name',
        'Quiz_1_Score', 'Quiz_2_Score', 'Quiz_3_Score', 
        'Avg_Quiz_Score', 'Followup_Quiz_Score'
      ]
    });
    xlsx.utils.book_append_sheet(wb, ws, "Quiz Results");
    
    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Disposition', 'attachment; filename="Quiz_Results.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.status(200).send(buffer);
  } catch (error) {
    console.error('Error generating Excel export:', error);
    res.status(500).json({ message: 'Server error while generating Excel export' });
  }
};

module.exports = {
  submitQuiz,
  getResultsByQuiz,
  getResultsByStudent,
  getAllResults,
  exportQuizResultsExcel
};
