const express = require('express');
const router = express.Router();
const { roleMiddleware } = require('../middleware/roleMiddleware');
const { 
    getAnalytics, 
    getAvailableQuizzes, 
    getAvailableLessons, 
    getStudentPerformance,
    getAllStudents,
    getIndividualStudentAnalytics,
    getTeacherDashboardStats
} = require('../controllers/analyticsController');

// Only teachers can access analytics
router.get('/quizzes', roleMiddleware('teacher'), getAvailableQuizzes);
router.get('/lessons', roleMiddleware('teacher'), getAvailableLessons);
router.get('/student-performance', roleMiddleware('teacher'), getStudentPerformance);
router.get('/students', roleMiddleware('teacher'), getAllStudents);
router.get('/teacher-dashboard', roleMiddleware('teacher'), getTeacherDashboardStats);
router.get('/student/:studentId', roleMiddleware('teacher'), getIndividualStudentAnalytics);
router.get('/', roleMiddleware('teacher'), getAnalytics);

module.exports = router;
