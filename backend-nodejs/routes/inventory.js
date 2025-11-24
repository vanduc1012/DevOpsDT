const express = require('express');
const router = express.Router();
const Ingredient = require('../models/Ingredient');
const StockTransaction = require('../models/StockTransaction');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Test endpoint (public)
router.get('/test', (req, res) => {
  res.json({ message: 'InventoryController is working' });
});

// Get all ingredients (admin only)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const ingredients = await Ingredient.find();
    res.json(ingredients);
  } catch (error) {
    console.error('Error getting ingredients:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Get low stock ingredients (admin only)
router.get('/low-stock', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const ingredients = await Ingredient.find();
    const lowStock = ingredients.filter(ing => ing.currentStock <= ing.minStock);
    res.json(lowStock);
  } catch (error) {
    console.error('Error getting low stock ingredients:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Get ingredient by ID (admin only)
router.get('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);
    if (!ingredient) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Ingredient not found'
      });
    }
    res.json(ingredient);
  } catch (error) {
    console.error('Error getting ingredient:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Create ingredient (admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const ingredient = new Ingredient(req.body);
    await ingredient.save();
    res.status(201).json(ingredient);
  } catch (error) {
    console.error('Error creating ingredient:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Update ingredient (admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const ingredient = await Ingredient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!ingredient) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Ingredient not found'
      });
    }
    
    res.json(ingredient);
  } catch (error) {
    console.error('Error updating ingredient:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Import stock (admin only)
router.post('/:id/import', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { quantity, unitPrice, supplier, notes } = req.body;
    const ingredient = await Ingredient.findById(req.params.id);
    
    if (!ingredient) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Ingredient not found'
      });
    }

    const stockBefore = ingredient.currentStock;
    const stockAfter = stockBefore + quantity;

    ingredient.currentStock = stockAfter;
    await ingredient.save();

    const transaction = new StockTransaction({
      ingredientId: ingredient._id,
      ingredientName: ingredient.name,
      type: 'IMPORT',
      quantity,
      unitPrice: unitPrice || ingredient.unitPrice,
      totalAmount: quantity * (unitPrice || ingredient.unitPrice),
      transactionDate: new Date(),
      performedBy: req.user.username,
      supplier,
      notes,
      stockBefore,
      stockAfter
    });
    await transaction.save();

    res.json(transaction);
  } catch (error) {
    console.error('Error importing stock:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Export stock (admin only)
router.post('/:id/export', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { quantity, notes } = req.body;
    const ingredient = await Ingredient.findById(req.params.id);
    
    if (!ingredient) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Ingredient not found'
      });
    }

    if (ingredient.currentStock < quantity) {
      return res.status(400).json({
        error: 'Bad Request',
        message: `Insufficient stock. Current: ${ingredient.currentStock}, Required: ${quantity}`
      });
    }

    const stockBefore = ingredient.currentStock;
    const stockAfter = stockBefore - quantity;

    ingredient.currentStock = stockAfter;
    await ingredient.save();

    const transaction = new StockTransaction({
      ingredientId: ingredient._id,
      ingredientName: ingredient.name,
      type: 'EXPORT',
      quantity,
      unitPrice: ingredient.unitPrice,
      totalAmount: quantity * ingredient.unitPrice,
      transactionDate: new Date(),
      performedBy: req.user.username,
      notes,
      stockBefore,
      stockAfter
    });
    await transaction.save();

    res.json(transaction);
  } catch (error) {
    console.error('Error exporting stock:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Adjust stock (admin only)
router.post('/:id/adjust', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { newStock, reason } = req.body;
    const ingredient = await Ingredient.findById(req.params.id);
    
    if (!ingredient) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Ingredient not found'
      });
    }

    const stockBefore = ingredient.currentStock;
    const difference = newStock - stockBefore;

    ingredient.currentStock = newStock;
    await ingredient.save();

    const transaction = new StockTransaction({
      ingredientId: ingredient._id,
      ingredientName: ingredient.name,
      type: 'ADJUSTMENT',
      quantity: Math.abs(difference),
      unitPrice: ingredient.unitPrice,
      totalAmount: 0,
      transactionDate: new Date(),
      performedBy: req.user.username,
      notes: reason,
      stockBefore,
      stockAfter: newStock
    });
    await transaction.save();

    res.json(transaction);
  } catch (error) {
    console.error('Error adjusting stock:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Get all transactions (admin only)
router.get('/transactions', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const transactions = await StockTransaction.find()
      .sort({ transactionDate: -1 });
    res.json(transactions);
  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Get transactions by ingredient (admin only)
router.get('/:id/transactions', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const transactions = await StockTransaction.find({ ingredientId: req.params.id })
      .sort({ transactionDate: -1 });
    res.json(transactions);
  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Delete ingredient (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const ingredient = await Ingredient.findByIdAndDelete(req.params.id);
    if (!ingredient) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Ingredient not found'
      });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting ingredient:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

module.exports = router;

