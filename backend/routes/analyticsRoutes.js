const express = require('express');
const router = express.Router();
const { getAnalytics, getAvailableQuizzes, getAvailableLessons, getStudentPerformance } = require('../controllers/analyticsController');

router.get('/quizzes', getAvailableQuizzes);
router.get('/lessons', getAvailableLessons);
router.get('/student-performance', getStudentPerformance);
router.get('/', getAnalytics);

module.exports = router;
