const express = require('express');
const router = express.Router();
const { getLessons, createLesson, updateLesson, deleteLesson } = require('../controllers/lessonController');

router.get('/', getLessons);
router.post('/', createLesson);
router.put('/:id', updateLesson);
router.delete('/:id', deleteLesson);

module.exports = router;
