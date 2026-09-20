const express = require('express');
const router = express.Router();
const { roleMiddleware } = require('../middleware/roleMiddleware');
const { generatePrediction, getLessonPredictions, getStudentAllLessonsPrediction, backfillPredictions } = require('../controllers/predictionController');

// Both students (own prediction) and teachers can trigger predictions
router.post('/predict', generatePrediction);

// Teacher-only: view predictions across lessons/students
router.get('/lesson/:lessonId', roleMiddleware('teacher'), getLessonPredictions);
router.get('/student/:studentId', roleMiddleware('teacher'), getStudentAllLessonsPrediction);

// Teacher-only: trigger a backfill of missing predictions
router.post('/backfill', roleMiddleware('teacher'), backfillPredictions);

module.exports = router;
