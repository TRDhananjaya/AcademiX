const express = require('express');
const router = express.Router();
const { createQuiz, getQuizzes, getQuizById } = require('../controllers/quizController');

router.post('/', createQuiz);
router.get('/', getQuizzes);
router.get('/:quizId', getQuizById);

module.exports = router;
