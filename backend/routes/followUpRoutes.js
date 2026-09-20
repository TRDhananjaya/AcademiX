const express = require('express');
const router = express.Router();
const {
  getOrGenerateFollowUpQuiz,
  submitFollowUpQuiz,
  generateFollowUpQuiz,
  getAllFollowUpQuizzes,
  toggleFollowUpAvailability,
  toggleAllFollowUpAvailability,
  getFollowUpGroupStatus,
  toggleFollowUpQuizGroup,
  deleteFollowUpQuiz
} = require('../controllers/followUpController');

// @route   GET /api/followup/group-status
// @desc    Get availability status of Follow-Up Quiz 1 and Follow-Up Quiz 2
router.get('/group-status', getFollowUpGroupStatus);

// @route   PUT /api/followup/toggle-group
// @desc    Toggle availability of Follow-Up Quiz 1 or Follow-Up Quiz 2 for all students
router.put('/toggle-group', toggleFollowUpQuizGroup);

// @route   GET /api/followup/all
// @desc    Get all follow-up quizzes for teacher management
router.get('/all', getAllFollowUpQuizzes);

// @route   PUT /api/followup/toggle-all
// @desc    Enable or disable all follow-up quizzes at once
router.put('/toggle-all', toggleAllFollowUpAvailability);

// @route   PUT /api/followup/:id/toggle
// @desc    Toggle availability of single follow-up quiz for students
router.put('/:id/toggle', toggleFollowUpAvailability);

// @route   DELETE /api/followup/:id
// @desc    Delete a follow-up quiz
router.delete('/:id', deleteFollowUpQuiz);

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
