const express = require('express');
const router = express.Router();
const { generateFollowUpQuiz } = require('../controllers/followUpController');

// @route   POST /api/followup/generate
// @desc    Generate adaptive follow-up quiz
// @access  Private (or Public depending on auth middleware, left open as per existing system)
router.post('/generate', generateFollowUpQuiz);

module.exports = router;
