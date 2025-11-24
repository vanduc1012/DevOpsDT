const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  menuItemName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
});

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CafeTable',
    required: false // Optional for delivery/pickup orders
  },
  orderType: {
    type: String,
    enum: ['DINE_IN', 'DELIVERY', 'PICKUP'],
    default: 'DINE_IN'
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  deliveryFee: {
    type: Number,
    default: 0,
    min: 0
  },
  deliveryAddress: {
    type: String
  },
  deliveryPhone: {
    type: String
  },
  paymentMethod: {
    type: String,
    enum: ['CASH', 'ONLINE', 'CARD'],
    default: 'CASH'
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
    default: 'PENDING'
  },
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'],
    default: 'PENDING'
  },
  orderTime: {
    type: Date,
    default: Date.now
  },
  completedTime: {
    type: Date
  }
}, {
  timestamps: true
});

// Calculate total before saving
orderSchema.pre('save', function(next) {
  // Total amount is sum of items only (delivery fee is separate)
  this.totalAmount = this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  next();
});

module.exports = mongoose.model('Order', orderSchema, 'orders');

