const express = require('express');
const router = express.Router();
const {
  getConversations,
  getThread,
  sendMessage,
  markAsRead
} = require('../controllers/messageController');

router.get('/conversations', getConversations);
router.get('/thread/:otherUserId', getThread);
router.post('/send', sendMessage);
router.post('/read/:otherUserId', markAsRead);

module.exports = router;
