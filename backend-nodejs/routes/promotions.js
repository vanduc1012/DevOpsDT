const express = require('express');
const router = express.Router();
const Promotion = require('../models/Promotion');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Test endpoint (public)
router.get('/test', (req, res) => {
  res.json({ message: 'PromotionController is working' });
});

// Get all promotions (admin only)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const promotions = await Promotion.find().sort({ createdAt: -1 });
    res.json(promotions);
  } catch (error) {
    console.error('Error getting promotions:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Get active promotions (public)
router.get('/active', async (req, res) => {
  try {
    const now = new Date();
    const promotions = await Promotion.find({
      active: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).sort({ createdAt: -1 });
    res.json(promotions);
  } catch (error) {
    console.error('Error getting active promotions:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Get promotion by ID (admin only)
router.get('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Promotion not found'
      });
    }
    res.json(promotion);
  } catch (error) {
    console.error('Error getting promotion:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Create promotion (admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const promotion = new Promotion({
      ...req.body,
      createdBy: req.user.username
    });
    await promotion.save();
    res.status(201).json(promotion);
  } catch (error) {
    console.error('Error creating promotion:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Update promotion (admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!promotion) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Promotion not found'
      });
    }
    
    res.json(promotion);
  } catch (error) {
    console.error('Error updating promotion:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Delete promotion (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndDelete(req.params.id);
    if (!promotion) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Promotion not found'
      });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting promotion:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Toggle promotion (admin only)
router.post('/:id/toggle', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Promotion not found'
      });
    }
    
    promotion.active = !promotion.active;
    await promotion.save();
    
    res.json(promotion);
  } catch (error) {
    console.error('Error toggling promotion:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

module.exports = router;

