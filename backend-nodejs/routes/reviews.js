const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Review = require('../models/Review');
const MenuItem = require('../models/MenuItem');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Get all reviews for a menu item (public)
router.get('/menu/:menuItemId', async (req, res) => {
  try {
    const { menuItemId } = req.params;
    const { status = 'APPROVED' } = req.query;

    const reviews = await Review.find({
      menuItemId: new mongoose.Types.ObjectId(menuItemId),
      status
    })
      .populate('userId', 'fullName username')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(reviews);
  } catch (error) {
    console.error('Error getting reviews:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Get all reviews (admin only)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, menuItemId, userId } = req.query;
    const query = {};

    if (status) query.status = status;
    if (menuItemId) query.menuItemId = menuItemId;
    if (userId) query.userId = userId;

    const reviews = await Review.find(query)
      .populate('menuItemId', 'name')
      .populate('userId', 'fullName username')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error('Error getting all reviews:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Get review statistics for a menu item
router.get('/menu/:menuItemId/stats', async (req, res) => {
  try {
    const { menuItemId } = req.params;

    const stats = await Review.aggregate([
      { $match: { menuItemId: new mongoose.Types.ObjectId(menuItemId), status: 'APPROVED' } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);

    if (stats.length === 0) {
      return res.json({
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      });
    }

    const stat = stats[0];
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    stat.ratingDistribution.forEach(rating => {
      distribution[rating] = (distribution[rating] || 0) + 1;
    });

    res.json({
      averageRating: Math.round(stat.averageRating * 10) / 10,
      totalReviews: stat.totalReviews,
      ratingDistribution: distribution
    });
  } catch (error) {
    console.error('Error getting review stats:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Create a review (authenticated users)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { menuItemId, rating, comment, orderId } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!menuItemId) {
      return res.status(400).json({ error: 'Menu item ID is required' });
    }
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Validate menu item exists
    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    // Convert to ObjectId
    const menuItemObjectId = new mongoose.Types.ObjectId(menuItemId);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Check if user already reviewed this item
    const existingReview = await Review.findOne({ 
      menuItemId: menuItemObjectId, 
      userId: userObjectId 
    });
    if (existingReview) {
      return res.status(400).json({ error: 'Bạn đã đánh giá món này rồi. Bạn có thể chỉnh sửa đánh giá của mình.' });
    }

    // Create review
    const review = new Review({
      menuItemId: menuItemObjectId,
      userId: userObjectId,
      rating: parseInt(rating),
      comment: comment || '',
      orderId: orderId ? new mongoose.Types.ObjectId(orderId) : null,
      status: 'APPROVED' // Auto-approve for now, can be changed to 'PENDING' for moderation
    });

    await review.save();

    // Update menu item average rating
    await updateMenuItemRating(menuItemId);

    // Populate user info before sending
    await review.populate('userId', 'fullName username');

    res.status(201).json(review);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Bạn đã đánh giá món này rồi.' });
    }
    console.error('Error creating review:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Update a review (user can only update their own review)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check if user owns this review or is admin
    if (review.userId.toString() !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Bạn không có quyền chỉnh sửa đánh giá này' });
    }

    review.rating = rating;
    review.comment = comment || '';
    await review.save();

    // Update menu item average rating
    await updateMenuItemRating(review.menuItemId);

    await review.populate('userId', 'fullName username');

    res.json(review);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Delete a review (user can delete their own, admin can delete any)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check if user owns this review or is admin
    if (review.userId.toString() !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Bạn không có quyền xóa đánh giá này' });
    }

    const menuItemId = review.menuItemId;
    await Review.findByIdAndDelete(id);

    // Update menu item average rating
    await updateMenuItemRating(menuItemId);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Update review status (admin only)
router.patch('/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    review.status = status;
    await review.save();

    // Update menu item average rating if status changed to/from APPROVED
    if (status === 'APPROVED' || review.status === 'APPROVED') {
      await updateMenuItemRating(review.menuItemId);
    }

    await review.populate('userId', 'fullName username');
    await review.populate('menuItemId', 'name');

    res.json(review);
  } catch (error) {
    console.error('Error updating review status:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Helper function to update menu item average rating
async function updateMenuItemRating(menuItemId) {
  try {
    const stats = await Review.aggregate([
      { $match: { menuItemId: new mongoose.Types.ObjectId(menuItemId), status: 'APPROVED' } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    const averageRating = stats.length > 0 ? Math.round(stats[0].averageRating * 10) / 10 : 0;
    const totalReviews = stats.length > 0 ? stats[0].totalReviews : 0;

    await MenuItem.findByIdAndUpdate(menuItemId, {
      averageRating,
      totalReviews
    });
  } catch (error) {
    console.error('Error updating menu item rating:', error);
  }
}

module.exports = router;

