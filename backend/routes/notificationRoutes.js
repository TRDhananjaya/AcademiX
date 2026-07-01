const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead } = require('../controllers/notificationController');

// All routes are protected by authMiddleware (mounted in server.js)
router.get('/', getNotifications);
router.put('/:id/read', markAsRead);

module.exports = router;
