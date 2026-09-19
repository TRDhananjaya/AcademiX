const express = require('express');
const router = express.Router();
const { roleMiddleware } = require('../middleware/roleMiddleware');
const { createQuiz, getQuizzes, getQuizById, getQuestionModules, getRandomQuestionsFromModule, deleteQuiz } = require('../controllers/quizController');

// Both students and teachers can view quizzes
router.get('/', getQuizzes);
router.get('/modules', getQuestionModules);
router.get('/modules/:quizCode/questions', getRandomQuestionsFromModule);
router.get('/:quizId', getQuizById);

// Only teachers can create/delete quizzes
router.post('/', roleMiddleware('teacher'), createQuiz);
router.delete('/:quizId', roleMiddleware('teacher'), deleteQuiz);

module.exports = router;
