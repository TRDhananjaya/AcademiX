const reportService = require('../services/reportService');
const { generateCsv } = require('../utils/csvExporter');
const QuizResult = require('../models/QuizResult');
const mongoose = require('mongoose');

// @desc    Get Quiz Analytics
// @route   GET /api/reports/quiz/:quizId/analytics
// @access  Public
const getQuizAnalytics = async (req, res) => {
  try {
    const data = await reportService.getQuizAnalytics(req.params.quizId);
    res.status(200).json(data);
  } catch (error) {
    console.error('Error in getQuizAnalytics:', error);
    res.status(500).json({ message: 'Server error retrieving analytics' });
  }
};

// @desc    Get Student Performance Graph Data
// @route   GET /api/reports/quiz/:quizId/performance
// @access  Public
const getStudentPerformanceGraph = async (req, res) => {
  try {
    const data = await reportService.getStudentPerformanceGraph(req.params.quizId);
    res.status(200).json(data);
  } catch (error) {
    console.error('Error in getStudentPerformanceGraph:', error);
    res.status(500).json({ message: 'Server error retrieving performance graph data' });
  }
};

// @desc    Get Grade Distribution
// @route   GET /api/reports/quiz/:quizId/grades
// @access  Public
const getGradeDistribution = async (req, res) => {
  try {
    const data = await reportService.getGradeDistribution(req.params.quizId);
    res.status(200).json(data);
  } catch (error) {
    console.error('Error in getGradeDistribution:', error);
    res.status(500).json({ message: 'Server error retrieving grade distribution' });
  }
};

// @desc    Get Student Rankings
// @route   GET /api/reports/quiz/:quizId/rankings
// @access  Public
const getStudentRankings = async (req, res) => {
  try {
    const data = await reportService.getStudentRankings(req.params.quizId);
    res.status(200).json(data);
  } catch (error) {
    console.error('Error in getStudentRankings:', error);
    res.status(500).json({ message: 'Server error retrieving rankings' });
  }
};

// @desc    Get Top Performers
// @route   GET /api/reports/quiz/:quizId/top-performers
// @access  Public
const getTopPerformers = async (req, res) => {
  try {
    const data = await reportService.getTopPerformers(req.params.quizId);
    res.status(200).json(data);
  } catch (error) {
    console.error('Error in getTopPerformers:', error);
    res.status(500).json({ message: 'Server error retrieving top performers' });
  }
};

// @desc    Get Lowest Performers
// @route   GET /api/reports/quiz/:quizId/lowest-performers
// @access  Public
const getLowestPerformers = async (req, res) => {
  try {
    const data = await reportService.getLowestPerformers(req.params.quizId);
    res.status(200).json(data);
  } catch (error) {
    console.error('Error in getLowestPerformers:', error);
    res.status(500).json({ message: 'Server error retrieving lowest performers' });
  }
};

// @desc    Export Quiz Results to CSV
// @route   GET /api/reports/quiz/:quizId/export
// @access  Public
const exportQuizResults = async (req, res) => {
  try {
    const quizId = req.params.quizId;
    const quiz = await mongoose.model('Quiz').findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    const targetQuizCode = quiz.quizCode;

    const results = await QuizResult.find({ quizId: targetQuizCode }).sort({ submittedAt: 1 }).lean();

    const fields = [
      { label: 'Student Name', value: 'studentName' },
      { label: 'Student ID', value: 'studentId' },
      { label: 'Correct Answers', value: 'correctAnswers' },
      { label: 'Total Questions', value: 'totalQuestions' },
      { label: 'Percentage', value: 'percentage' },
      { label: 'Time Taken', value: 'timeTaken' },
      { 
        label: 'Submission Date', 
        value: (row) => new Date(row.submittedAt).toISOString().split('T')[0]
      }
    ];

    const csvData = generateCsv(results, fields);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=quiz_${req.params.quizId}_report.csv`);
    res.status(200).send(csvData);
  } catch (error) {
    console.error('Error in exportQuizResults:', error);
    res.status(500).json({ message: 'Server error exporting data' });
  }
};

// @desc    Get Module Quiz Comparison
// @route   GET /api/reports/module/:moduleId/comparison
// @access  Public
const getModuleComparison = async (req, res) => {
  try {
    const data = await reportService.getModuleComparison(req.params.moduleId);
    res.status(200).json(data);
  } catch (error) {
    console.error('Error in getModuleComparison:', error);
    res.status(500).json({ message: 'Server error retrieving module comparison' });
  }
};

module.exports = {
  getQuizAnalytics,
  getStudentPerformanceGraph,
  getGradeDistribution,
  getStudentRankings,
  getTopPerformers,
  getLowestPerformers,
  exportQuizResults,
  getModuleComparison
};
