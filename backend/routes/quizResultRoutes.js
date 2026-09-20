const express = require('express');
const router = express.Router();
const { submitQuiz, getResultsByQuiz, getResultsByStudent, getAllResults, exportQuizResultsCSV, deleteQuizResult } = require('../controllers/quizResultController');

router.get('/export-csv', exportQuizResultsCSV);
router.post('/', submitQuiz);
router.get('/', getAllResults);
router.get('/quiz/:quizId', getResultsByQuiz);
router.get('/student/:studentId', getResultsByStudent);
router.delete('/:id', deleteQuizResult);

module.exports = router;
