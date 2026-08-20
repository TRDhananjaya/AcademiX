const express = require('express');
const router = express.Router();
const { getStudyPlans, generateStudyPlanPdf, recoverMissingStudyPlans } = require('../controllers/studyPlanController');

// Routes are protected by authMiddleware in server.js
router.get('/', getStudyPlans);
router.post('/pdf', generateStudyPlanPdf);
router.post('/recover-missing', recoverMissingStudyPlans);

module.exports = router;
