const express = require('express');
const router = express.Router();
const { generatePrediction, getLessonPredictions } = require('../controllers/predictionController');

router.post('/predict', generatePrediction);
router.get('/lesson/:lessonId', getLessonPredictions);

module.exports = router;
