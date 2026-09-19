const express = require('express');
const router = express.Router();
const {
  getPosts,
  createPost,
  addReply,
  votePost,
  flagPost,
  dismissFlag,
  deletePost
} = require('../controllers/communityController');

router.get('/', getPosts);
router.post('/', createPost);
router.post('/:id/reply', addReply);
router.post('/:id/vote', votePost);
router.post('/:id/flag', flagPost);
router.post('/:id/dismiss-flag', dismissFlag);
router.delete('/:id', deletePost);

module.exports = router;
