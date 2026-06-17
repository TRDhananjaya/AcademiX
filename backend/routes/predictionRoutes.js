const express = require('express');
const router = express.Router();
const { generatePrediction } = require('../controllers/predictionController');

router.post('/predict', generatePrediction);

module.exports = router;
