const express = require('express');
const router = express.Router();
const { generatePrediction } = require('../controllers/predictionController');

router.post('/predict/:studentId', generatePrediction);

module.exports = router;
