const mongoose = require('mongoose');

const priceHistorySchema = new mongoose.Schema({
  menuItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  menuItemName: {
    type: String,
    required: true
  },
  oldPrice: {
    type: Number,
    required: true,
    min: 0
  },
  newPrice: {
    type: Number,
    required: true,
    min: 0
  },
  changeDate: {
    type: Date,
    default: Date.now
  },
  changedBy: {
    type: String,
    required: true
  },
  reason: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PriceHistory', priceHistorySchema, 'price_history');

