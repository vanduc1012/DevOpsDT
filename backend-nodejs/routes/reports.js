const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Get daily report (admin only)
router.get('/daily', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const orders = await Order.find({
      orderTime: { $gte: startOfDay, $lte: endOfDay },
      status: 'COMPLETED'
    });

    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalCustomers = orders.length;

    res.json({
      date: startOfDay.toISOString().split('T')[0],
      totalRevenue,
      totalCustomers,
      totalOrders: orders.length
    });
  } catch (error) {
    console.error('Error getting daily report:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Get today's report (admin only)
router.get('/today', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const orders = await Order.find({
      orderTime: { $gte: startOfDay, $lte: endOfDay },
      status: 'COMPLETED'
    });

    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalCustomers = orders.length;

    res.json({
      date: startOfDay.toISOString().split('T')[0],
      totalRevenue,
      totalCustomers,
      totalOrders: orders.length
    });
  } catch (error) {
    console.error('Error getting today report:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Get monthly report (admin only)
router.get('/monthly', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { year, month } = req.query;
    const targetYear = parseInt(year) || new Date().getFullYear();
    const targetMonth = parseInt(month) || new Date().getMonth() + 1;

    const startOfMonth = new Date(targetYear, targetMonth - 1, 1);
    const endOfMonth = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

    const orders = await Order.find({
      orderTime: { $gte: startOfMonth, $lte: endOfMonth },
      status: 'COMPLETED'
    });

    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalCustomers = orders.length;

    res.json({
      year: targetYear,
      month: targetMonth,
      totalRevenue,
      totalCustomers,
      totalOrders: orders.length
    });
  } catch (error) {
    console.error('Error getting monthly report:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

module.exports = router;

