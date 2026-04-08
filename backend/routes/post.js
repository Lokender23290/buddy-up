const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { verifyToken } = require('../middleware/auth');

// Protected Routes: Only for verified campus identities
router.post('/', verifyToken, postController.createPost);
router.get('/', verifyToken, postController.getPosts);
router.put('/:id/resolve', verifyToken, postController.resolvePost);
router.put('/:id/join', verifyToken, postController.joinCommunity);
router.put('/:id/leave', verifyToken, postController.leaveCommunity);

module.exports = router;
