const express = require('express');
const router = express.Router();
const { loginUser, getMe } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Public routes
router.post('/login', loginUser);

// Protected routes
router.get('/me', authMiddleware, getMe);

module.exports = router;
