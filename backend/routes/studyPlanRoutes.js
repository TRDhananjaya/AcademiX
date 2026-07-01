const express = require('express');
const router = express.Router();
const { getStudyPlans, generateStudyPlanPdf } = require('../controllers/studyPlanController');

// Routes are protected by authMiddleware in server.js
router.get('/', getStudyPlans);
router.post('/pdf', generateStudyPlanPdf);

module.exports = router;
