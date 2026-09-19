const express = require('express');
const router = express.Router();
const { roleMiddleware } = require('../middleware/roleMiddleware');
const { generatePrediction, getLessonPredictions, getStudentAllLessonsPrediction } = require('../controllers/predictionController');

// Only teachers can trigger and view predictions
router.post('/predict', roleMiddleware('teacher'), generatePrediction);
router.get('/lesson/:lessonId', roleMiddleware('teacher'), getLessonPredictions);
router.get('/student/:studentId', roleMiddleware('teacher'), getStudentAllLessonsPrediction);

module.exports = router;
