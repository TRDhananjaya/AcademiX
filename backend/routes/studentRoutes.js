const express = require('express');
const router = express.Router();
const { roleMiddleware } = require('../middleware/roleMiddleware');
const {
    getStudents,
    getStudentById,
    addStudent,
    updateStudent,
    deleteStudent
} = require('../controllers/studentController');

// Only teachers can manage student records
router.route('/')
    .get(roleMiddleware('teacher'), getStudents)
    .post(roleMiddleware('teacher'), addStudent);

router.route('/:id')
    .get(roleMiddleware('teacher'), getStudentById)
    .put(roleMiddleware('teacher'), updateStudent)
    .delete(roleMiddleware('teacher'), deleteStudent);

module.exports = router;
