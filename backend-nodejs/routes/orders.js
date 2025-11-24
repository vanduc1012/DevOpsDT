const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const CafeTable = require('../models/CafeTable');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Get all orders (admin only)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'username fullName')
      .populate('tableId', 'tableNumber')
      .sort({ orderTime: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error getting orders:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Get my orders (authenticated)
router.get('/my-orders', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate('tableId', 'tableNumber')
      .sort({ orderTime: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error getting my orders:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Get orders by table (authenticated)
router.get('/table/:tableId', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ tableId: req.params.tableId })
      .populate('userId', 'username fullName')
      .sort({ orderTime: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error getting orders by table:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Get order by ID (authenticated)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'username fullName')
      .populate('tableId', 'tableNumber');
    
    if (!order) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Order not found'
      });
    }
    
    // Check if user owns the order or is admin
    if (order.userId._id.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to view this order'
      });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error getting order:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Create order (authenticated)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { tableId, items } = req.body;

    // Validate items and get menu item details
    const orderItems = [];
    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem) {
        return res.status(400).json({
          error: 'Bad Request',
          message: `Menu item ${item.menuItemId} not found`
        });
      }
      orderItems.push({
        menuItemId: menuItem._id,
        menuItemName: menuItem.name,
        quantity: item.quantity,
        price: menuItem.price
      });
    }

    const order = new Order({
      userId: req.user.id,
      tableId,
      items: orderItems
    });

    await order.save();

    // Update table status
    await CafeTable.findByIdAndUpdate(tableId, { status: 'OCCUPIED' });

    const populatedOrder = await Order.findById(order._id)
      .populate('userId', 'username fullName')
      .populate('tableId', 'tableNumber');

    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Update order status (admin only)
router.patch('/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        completedTime: status === 'COMPLETED' ? new Date() : undefined
      },
      { new: true, runValidators: true }
    )
      .populate('userId', 'username fullName')
      .populate('tableId', 'tableNumber');
    
    if (!order) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Order not found'
      });
    }

    // Update table status if order is completed
    if (status === 'COMPLETED') {
      await CafeTable.findByIdAndUpdate(order.tableId, { status: 'PAID' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Transfer table (admin only)
router.patch('/:id/transfer-table', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { newTableId } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { tableId: newTableId },
      { new: true, runValidators: true }
    )
      .populate('userId', 'username fullName')
      .populate('tableId', 'tableNumber');
    
    if (!order) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Order not found'
      });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error transferring table:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

module.exports = router;

