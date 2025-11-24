const express = require('express');
const router = express.Router();
const CafeTable = require('../models/CafeTable');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Get all tables (public)
router.get('/', async (req, res) => {
  try {
    const tables = await CafeTable.find();
    res.json(tables);
  } catch (error) {
    console.error('Error getting tables:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Get available tables (public)
router.get('/available', async (req, res) => {
  try {
    const tables = await CafeTable.find({ status: 'AVAILABLE' });
    res.json(tables);
  } catch (error) {
    console.error('Error getting available tables:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Get table by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const table = await CafeTable.findById(req.params.id);
    if (!table) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Table not found'
      });
    }
    res.json(table);
  } catch (error) {
    console.error('Error getting table:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Create table (admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const table = new CafeTable(req.body);
    await table.save();
    res.json(table);
  } catch (error) {
    console.error('Error creating table:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Update table (admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const table = await CafeTable.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!table) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Table not found'
      });
    }
    
    res.json(table);
  } catch (error) {
    console.error('Error updating table:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Update table status (admin only)
router.patch('/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const table = await CafeTable.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!table) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Table not found'
      });
    }
    
    res.json(table);
  } catch (error) {
    console.error('Error updating table status:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Delete table (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const table = await CafeTable.findByIdAndDelete(req.params.id);
    if (!table) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Table not found'
      });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting table:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

module.exports = router;

