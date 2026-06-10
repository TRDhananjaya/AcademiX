const express = require('express');
const router = express.Router();
const { getStudents } = require('../controllers/userController');

// Get all students
router.get('/students', getStudents);

module.exports = router;
