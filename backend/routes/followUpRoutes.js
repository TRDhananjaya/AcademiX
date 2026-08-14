const express = require('express');
const router = express.Router();
const { 
  getOrGenerateFollowUpQuiz, 
  submitFollowUpQuiz, 
  generateFollowUpQuiz 
} = require('../controllers/followUpController');

// @route   GET /api/followup/lesson/:lessonId
// @desc    Get or generate adaptive follow-up quiz for a lesson
// @access  Public / Private
router.get('/lesson/:lessonId', getOrGenerateFollowUpQuiz);

// @route   POST /api/followup/submit
// @desc    Submit follow-up quiz results
// @access  Public / Private
router.post('/submit', submitFollowUpQuiz);

// @route   POST /api/followup/generate
// @desc    Legacy generate route
// @access  Public / Private
router.post('/generate', generateFollowUpQuiz);

module.exports = router;
