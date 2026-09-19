const express = require('express');
const router = express.Router();
const { roleMiddleware } = require('../middleware/roleMiddleware');
const { getLessons, createLesson, updateLesson, deleteLesson } = require('../controllers/lessonController');

// Both students and teachers can view lessons
router.get('/', getLessons);

// Only teachers can create/update/delete lessons
router.post('/', roleMiddleware('teacher'), createLesson);
router.put('/:id', roleMiddleware('teacher'), updateLesson);
router.delete('/:id', roleMiddleware('teacher'), deleteLesson);

module.exports = router;
