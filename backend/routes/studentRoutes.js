const express = require('express');
const router = express.Router();
const { roleMiddleware } = require('../middleware/roleMiddleware');
const {
    getStudents,
    getStudentById,
    addStudent,
    updateStudent,
    deleteStudent,
    getStudentOwnProfile
} = require('../controllers/studentController');

// Logged-in students can fetch their own student profile and QR code
router.get('/profile', getStudentOwnProfile);
router.get('/me', getStudentOwnProfile);

// Only teachers can manage the full student list
router.route('/')
    .get(roleMiddleware('teacher'), getStudents)
    .post(roleMiddleware('teacher'), addStudent);

router.route('/:id')
    .get(roleMiddleware('teacher'), getStudentById)
    .put(roleMiddleware('teacher'), updateStudent)
    .delete(roleMiddleware('teacher'), deleteStudent);

module.exports = router;
