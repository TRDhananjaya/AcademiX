const express = require('express');
const router = express.Router();
const { roleMiddleware } = require('../middleware/roleMiddleware');
const reportController = require('../controllers/reportController');

// Only teachers can access reports
router.get('/quiz/:quizId/analytics', roleMiddleware('teacher'), reportController.getQuizAnalytics);
router.get('/quiz/:quizId/performance', roleMiddleware('teacher'), reportController.getStudentPerformanceGraph);
router.get('/quiz/:quizId/grades', roleMiddleware('teacher'), reportController.getGradeDistribution);
router.get('/quiz/:quizId/rankings', roleMiddleware('teacher'), reportController.getStudentRankings);
router.get('/quiz/:quizId/top-performers', roleMiddleware('teacher'), reportController.getTopPerformers);
router.get('/quiz/:quizId/lowest-performers', roleMiddleware('teacher'), reportController.getLowestPerformers);
router.get('/quiz/:quizId/export', roleMiddleware('teacher'), reportController.exportQuizResults);

// Module Comparison Route
router.get('/module/:moduleId/comparison', roleMiddleware('teacher'), reportController.getModuleComparison);

module.exports = router;
