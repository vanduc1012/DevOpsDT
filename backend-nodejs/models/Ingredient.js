const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  currentStock: {
    type: Number,
    default: 0,
    min: 0
  },
  minStock: {
    type: Number,
    required: true,
    min: 0
  },
  maxStock: {
    type: Number,
    min: 0
  },
  unitPrice: {
    type: Number,
    default: 0,
    min: 0
  },
  category: {
    type: String
  },
  supplier: {
    type: String
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Ingredient', ingredientSchema, 'ingredients');

