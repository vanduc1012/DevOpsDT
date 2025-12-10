require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Middleware
app.use(cors({
  origin: true, // allow all origins
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (for uploaded QR codes)
app.use('/uploads', express.static('uploads'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://vanduc1022:vanduc123321@cluster0.d29cy3o.mongodb.net/cafe_db?retryWrites=true&w=majority')
  .then(async () => {
    console.log('✅ MongoDB connected successfully');
    // Initialize data
    const initializeData = require('./config/initData');
    await initializeData();
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
  });

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Cafe Management System API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      menu: '/api/menu',
      tables: '/api/tables',
      orders: '/api/orders',
      reports: '/api/reports',
      prices: '/api/prices',
      promotions: '/api/promotions',
      inventory: '/api/inventory'
    }
  });
});

app.get('/api', (req, res) => {
  res.json({
    message: 'Cafe Management System API',
    version: '1.0.0',
    status: 'running'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP',
    service: 'cafe-management'
  });
});

// Import routes
const authRoutes = require('./routes/auth');
const menuRoutes = require('./routes/menu');
const tableRoutes = require('./routes/tables');
const orderRoutes = require('./routes/orders');
const reportRoutes = require('./routes/reports');
const priceRoutes = require('./routes/prices');
const promotionRoutes = require('./routes/promotions');
const inventoryRoutes = require('./routes/inventory');
const paymentConfigRoutes = require('./routes/paymentConfig');
const userRoutes = require('./routes/users');
const reviewRoutes = require('./routes/reviews');
const blogRoutes = require('./routes/blogs');

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/prices', priceRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/payment-config', paymentConfigRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/blogs', blogRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.status || 500
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    status: 404
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}/api`);
});

