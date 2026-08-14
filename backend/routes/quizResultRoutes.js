const express = require('express');
const router = express.Router();
const { submitQuiz, getResultsByQuiz, getResultsByStudent, getAllResults, exportQuizResultsExcel } = require('../controllers/quizResultController');

router.get('/export-excel', exportQuizResultsExcel);
router.post('/', submitQuiz);
router.get('/', getAllResults);
router.get('/quiz/:quizId', getResultsByQuiz);
router.get('/student/:studentId', getResultsByStudent);

module.exports = router;
