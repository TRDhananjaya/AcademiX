const express = require('express');
const router = express.Router();
const {
    getStudents,
    getStudentById,
    addStudent,
    updateStudent,
    deleteStudent
} = require('../controllers/studentController');

router.route('/')
    .get(getStudents)
    .post(addStudent);

router.route('/:id')
    .get(getStudentById)
    .put(updateStudent)
    .delete(deleteStudent);

module.exports = router;
