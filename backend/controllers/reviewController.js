const Review = require('../models/Review');
const User = require('../models/User');

exports.createReview = async (req, res) => {
    try {
        const { providerId, rating, comment } = req.body;
        const reviewerId = req.user.id; // from auth middleware

        if (providerId === String(reviewerId)) {
            return res.status(400).json({ message: "You cannot review your own profile." });
        }

        const existingReview = await Review.findOne({ provider: providerId, reviewer: reviewerId });
        if (existingReview) {
            return res.status(400).json({ message: "You have already reviewed this provider." });
        }

        const review = await Review.create({
            provider: providerId,
            reviewer: reviewerId,
            rating: Number(rating),
            comment
        });

        // Recalculate average rating algorithmically
        const allReviews = await Review.find({ provider: providerId });
        const totalReviews = allReviews.length;
        const sumRating = allReviews.reduce((acc, curr) => acc + curr.rating, 0);
        const averageRating = sumRating / totalReviews;

        await User.findByIdAndUpdate(providerId, {
            ratingStatistics: {
                averageRating: Number(averageRating.toFixed(1)),
                totalReviews
            }
        });

        res.status(201).json({ message: "Review recorded to ledger successfully", review });
    } catch (error) {
        console.error('Review Error:', error);
        res.status(500).json({ message: error.message || "Failed to execute review payload" });
    }
};

exports.getProviderReviews = async (req, res) => {
    try {
        const { providerId } = req.params;
        const reviews = await Review.find({ provider: providerId })
            .populate('reviewer', 'name profilePhoto college')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        console.error('Review Error:', error);
        res.status(500).json({ message: "Failed to fetch review matrix" });
    }
};
