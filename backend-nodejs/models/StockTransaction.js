const mongoose = require('mongoose');

const stockTransactionSchema = new mongoose.Schema({
  ingredientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ingredient',
    required: true
  },
  ingredientName: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['IMPORT', 'EXPORT', 'ADJUSTMENT'],
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  unitPrice: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  transactionDate: {
    type: Date,
    default: Date.now
  },
  performedBy: {
    type: String,
    required: true
  },
  supplier: {
    type: String
  },
  notes: {
    type: String
  },
  stockBefore: {
    type: Number,
    required: true
  },
  stockAfter: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('StockTransaction', stockTransactionSchema, 'stock_transactions');

