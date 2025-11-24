const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  tableNumber: {
    type: String,
    required: true,
    unique: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['AVAILABLE', 'OCCUPIED', 'PAID'],
    default: 'AVAILABLE'
  },
  location: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CafeTable', tableSchema, 'cafe_tables');

