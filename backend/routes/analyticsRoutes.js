const express = require('express');
const router = express.Router();
const { 
    getAnalytics, 
    getAvailableQuizzes, 
    getAvailableLessons, 
    getStudentPerformance,
    getAllStudents,
    getIndividualStudentAnalytics,
    getTeacherDashboardStats
} = require('../controllers/analyticsController');

router.get('/quizzes', getAvailableQuizzes);
router.get('/lessons', getAvailableLessons);
router.get('/student-performance', getStudentPerformance);
router.get('/students', getAllStudents);
router.get('/teacher-dashboard', getTeacherDashboardStats);
router.get('/student/:studentId', getIndividualStudentAnalytics);
router.get('/', getAnalytics);

module.exports = router;
