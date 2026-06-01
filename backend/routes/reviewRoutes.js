const express = require('express');
const router = express.Router();
const { createReview, getProviderReviews } = require('../controllers/reviewController');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, createReview);
router.get('/:providerId', getProviderReviews);

module.exports = router;
