const mongoose = require('mongoose');

const paymentConfigSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['QR_CODE', 'VNPAY', 'MOMO', 'ZALOPAY', 'BANK_TRANSFER'],
    required: true
  },
  qrCodeImage: {
    type: String, // URL to QR code image
  },
  accountNumber: {
    type: String
  },
  accountName: {
    type: String
  },
  bankCode: {
    type: String
  },
  bankName: {
    type: String
  },
  // API Configuration for external payment gateway
  apiKey: {
    type: String
  },
  apiSecret: {
    type: String
  },
  merchantId: {
    type: String
  },
  apiUrl: {
    type: String // Payment gateway API URL
  },
  callbackUrl: {
    type: String // URL for payment callback
  },
  returnUrl: {
    type: String // URL to redirect after payment
  },
  active: {
    type: Boolean,
    default: true
  },
  description: {
    type: String
  },
  createdBy: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PaymentConfig', paymentConfigSchema, 'payment_configs');

