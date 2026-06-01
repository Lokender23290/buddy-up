const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxLength: 500,
    required: true
  }
}, { timestamps: true });

// Ensure one review per reviewer-provider pair
reviewSchema.index({ provider: 1, reviewer: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
