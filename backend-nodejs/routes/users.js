const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// All user routes require authentication
router.use(authMiddleware);

// Get profile of current user
router.get('/me', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }
    res.json(user);
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Admin routes below
router.use(adminMiddleware);

// Get all users (admin only)
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Get user by ID (admin only)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }
    res.json(user);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Update user role (admin only)
router.patch('/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!role || !['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Role must be USER or ADMIN'
      });
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    // Protect root account - cannot change role
    if (user.username === 'root') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Không thể thay đổi quyền của tài khoản root'
      });
    }

    // Prevent admin from removing their own admin role
    if (user._id.toString() === req.user.id && role === 'USER') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Bạn không thể tự xóa quyền admin của chính mình'
      });
    }

    user.role = role;
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      message: 'Cập nhật quyền thành công',
      user: userResponse
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Delete user (admin only) - but not root
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    // Protect root account - cannot delete
    if (user.username === 'root') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Không thể xóa tài khoản root'
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Bạn không thể xóa chính mình'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

module.exports = router;

