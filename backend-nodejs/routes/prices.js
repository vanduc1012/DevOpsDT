const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const PriceHistory = require('../models/PriceHistory');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Test endpoint (public)
router.get('/test', (req, res) => {
  res.json({ message: 'PriceController is working' });
});

// Test auth endpoint
router.put('/test-auth', authMiddleware, (req, res) => {
  res.json({
    message: 'Auth test endpoint',
    authenticated: true,
    username: req.user.username,
    authorities: req.user.role
  });
});

// Get all price history (admin only)
router.get('/history', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    console.log('Getting all price history...');
    const history = await PriceHistory.find().sort({ changeDate: -1 });
    console.log('Found', history.length, 'price history records');
    res.json(history);
  } catch (error) {
    console.error('Error getting price history:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Get price history by menu item (admin only)
router.get('/history/menu/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    console.log('Getting price history for menu item:', req.params.id);
    const history = await PriceHistory.find({ menuItemId: req.params.id })
      .sort({ changeDate: -1 });
    console.log('Found', history.length, 'records for menu item', req.params.id);
    res.json(history);
  } catch (error) {
    console.error('Error getting price history:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Update price (admin only)
router.put('/menu/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    console.log('=== PriceController.updatePrice called ===');
    console.log('Menu Item ID:', req.params.id);
    console.log('User:', req.user.username);
    console.log('Request:', req.body);

    const { newPrice, reason } = req.body;

    if (!req.params.id || req.params.id === 'undefined') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Menu item ID is required'
      });
    }

    if (!newPrice) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'New price is required'
      });
    }

    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Menu item not found with ID: ' + req.params.id
      });
    }

    const oldPrice = menuItem.price || 0;

    // Check if price changed
    if (oldPrice === newPrice) {
      return res.json(menuItem);
    }

    // Save price history
    const priceHistory = new PriceHistory({
      menuItemId: menuItem._id,
      menuItemName: menuItem.name || 'Unknown',
      oldPrice,
      newPrice,
      changeDate: new Date(),
      changedBy: req.user.username,
      reason: reason || ''
    });
    await priceHistory.save();

    // Update menu item price
    menuItem.price = newPrice;
    await menuItem.save();

    console.log('Price updated successfully');
    res.json(menuItem);
  } catch (error) {
    console.error('Error updating price:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

module.exports = router;

