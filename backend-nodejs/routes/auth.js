const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, password, fullName, email, phone } = req.body;

    // Check if username exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Username already exists'
      });
    }

    // Check if email exists
    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Email already exists'
        });
      }
    }

    // Create new user
    const user = new User({
      username,
      password,
      fullName,
      email,
      phone,
      role: 'USER'
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id.toString());

    res.json({
      token,
      username: user.username,
      fullName: user.fullName,
      role: user.role
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Username and password are required'
      });
    }

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid username or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid username or password'
      });
    }

    // Generate token
    const token = generateToken(user._id.toString());

    res.json({
      token,
      username: user.username,
      fullName: user.fullName,
      role: user.role
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

module.exports = router;

