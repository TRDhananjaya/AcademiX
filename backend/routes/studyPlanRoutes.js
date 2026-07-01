const express = require('express');
const router = express.Router();
const { getStudyPlans } = require('../controllers/studyPlanController');

// Routes are protected by authMiddleware in server.js
router.get('/', getStudyPlans);

module.exports = router;
