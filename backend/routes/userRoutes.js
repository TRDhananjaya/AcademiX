const express = require('express');
const router = express.Router();
const { getStudents, checkUsername } = require('../controllers/userController');

// Get all students
router.get('/students', getStudents);

// Check if username exists
router.get('/check-username/:username', checkUsername);

module.exports = router;
