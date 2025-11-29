const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  menuItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  userId: {
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
    trim: true,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'APPROVED'
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: false // Optional: link to order if review is from an order
  }
}, {
  timestamps: true
});

// Index for efficient queries
reviewSchema.index({ menuItemId: 1, status: 1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ createdAt: -1 });

// Prevent duplicate reviews from same user for same menu item
reviewSchema.index({ menuItemId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema, 'reviews');

