const express = require('express');
const router = express.Router();
const { createQuiz, getQuizzes, getQuizById, getQuestionModules, getRandomQuestionsFromModule, deleteQuiz } = require('../controllers/quizController');

router.post('/', createQuiz);
router.get('/', getQuizzes);
router.get('/modules', getQuestionModules);
router.get('/modules/:quizCode/questions', getRandomQuestionsFromModule);
router.get('/:quizId', getQuizById);
router.delete('/:quizId', deleteQuiz);

module.exports = router;
