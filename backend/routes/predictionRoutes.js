const express = require('express');
const router = express.Router();
const { generatePrediction, getLessonPredictions, getStudentAllLessonsPrediction } = require('../controllers/predictionController');

router.post('/predict', generatePrediction);
router.get('/lesson/:lessonId', getLessonPredictions);
router.get('/student/:studentId', getStudentAllLessonsPrediction);

module.exports = router;
