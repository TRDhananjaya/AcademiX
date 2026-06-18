const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Quiz Report Routes
router.get('/quiz/:quizId/analytics', reportController.getQuizAnalytics);
router.get('/quiz/:quizId/performance', reportController.getStudentPerformanceGraph);
router.get('/quiz/:quizId/grades', reportController.getGradeDistribution);
router.get('/quiz/:quizId/rankings', reportController.getStudentRankings);
router.get('/quiz/:quizId/top-performers', reportController.getTopPerformers);
router.get('/quiz/:quizId/lowest-performers', reportController.getLowestPerformers);
router.get('/quiz/:quizId/export', reportController.exportQuizResults);

// Module Comparison Route
router.get('/module/:moduleId/comparison', reportController.getModuleComparison);

module.exports = router;
