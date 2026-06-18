const express = require('express');
const router = express.Router();
const { 
    getAnalytics, 
    getAvailableQuizzes, 
    getAvailableLessons, 
    getStudentPerformance,
    getAllStudents,
    getIndividualStudentAnalytics
} = require('../controllers/analyticsController');

router.get('/quizzes', getAvailableQuizzes);
router.get('/lessons', getAvailableLessons);
router.get('/student-performance', getStudentPerformance);
router.get('/students', getAllStudents);
router.get('/student/:studentId', getIndividualStudentAnalytics);
router.get('/', getAnalytics);

module.exports = router;
