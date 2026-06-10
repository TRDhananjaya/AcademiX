const express = require('express');
const router = express.Router();
const { submitQuiz, getResultsByQuiz, getResultsByStudent } = require('../controllers/quizResultController');

router.post('/', submitQuiz);
router.get('/quiz/:quizId', getResultsByQuiz);
router.get('/student/:studentId', getResultsByStudent);

module.exports = router;
