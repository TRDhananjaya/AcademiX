const express = require('express');
const router = express.Router();
const { getMessages, sendMessage } = require('../controllers/commonMessageController');

router.get('/', getMessages);
router.post('/', sendMessage);

module.exports = router;
