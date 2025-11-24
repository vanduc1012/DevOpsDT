const express = require('express');
const router = express.Router();
const PaymentConfig = require('../models/PaymentConfig');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/qr-codes');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'qr-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WEBP)'));
    }
  }
});

// Get all payment configs (admin only)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const configs = await PaymentConfig.find().sort({ createdAt: -1 });
    res.json(configs);
  } catch (error) {
    console.error('Error getting payment configs:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Get active payment configs (public)
router.get('/active', async (req, res) => {
  try {
    const configs = await PaymentConfig.find({ active: true }).sort({ createdAt: -1 });
    res.json(configs);
  } catch (error) {
    console.error('Error getting active payment configs:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Get payment config by ID (admin only)
router.get('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const config = await PaymentConfig.findById(req.params.id);
    if (!config) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Payment config not found'
      });
    }
    res.json(config);
  } catch (error) {
    console.error('Error getting payment config:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Create payment config (admin only)
router.post('/', authMiddleware, adminMiddleware, upload.single('qrCodeImage'), async (req, res) => {
  try {
    const configData = {
      ...req.body,
      createdBy: req.user.username
    };

    // Handle file upload
    if (req.file) {
      // In production, upload to cloud storage (AWS S3, Cloudinary, etc.)
      // For now, save file path relative to server
      configData.qrCodeImage = `/uploads/qr-codes/${req.file.filename}`;
    }

    const config = new PaymentConfig(configData);
    await config.save();
    res.status(201).json(config);
  } catch (error) {
    console.error('Error creating payment config:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Update payment config (admin only)
router.put('/:id', authMiddleware, adminMiddleware, upload.single('qrCodeImage'), async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Handle file upload
    if (req.file) {
      // Delete old file if exists
      const oldConfig = await PaymentConfig.findById(req.params.id);
      if (oldConfig && oldConfig.qrCodeImage) {
        const oldFilePath = path.join(__dirname, '..', oldConfig.qrCodeImage);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      updateData.qrCodeImage = `/uploads/qr-codes/${req.file.filename}`;
    }

    const config = await PaymentConfig.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!config) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Payment config not found'
      });
    }

    res.json(config);
  } catch (error) {
    console.error('Error updating payment config:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Delete payment config (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const config = await PaymentConfig.findById(req.params.id);
    if (!config) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Payment config not found'
      });
    }

    // Delete associated file
    if (config.qrCodeImage) {
      const filePath = path.join(__dirname, '..', config.qrCodeImage);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await PaymentConfig.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting payment config:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Toggle payment config active status (admin only)
router.post('/:id/toggle', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const config = await PaymentConfig.findById(req.params.id);
    if (!config) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Payment config not found'
      });
    }

    config.active = !config.active;
    await config.save();

    res.json(config);
  } catch (error) {
    console.error('Error toggling payment config:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

module.exports = router;

