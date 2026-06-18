const QuizResult = require('../models/QuizResult');
const Quiz = require('../models/Quiz');
const mongoose = require('mongoose');

// @desc    Submit a quiz and save result
// @route   POST /api/quiz-results
// @access  Public (for now)
const submitQuiz = async (req, res) => {
  try {
    const { quizId, studentId, studentName, correctAnswers, totalQuestions, percentage, timeTaken } = req.body;

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
      status: percentage >= 50 ? 'Pass' : 'Fail'
    });

    const savedResult = await result.save();
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

module.exports = {
  submitQuiz,
  getResultsByQuiz,
  getResultsByStudent
};
