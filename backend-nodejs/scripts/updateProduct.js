const mongoose = require('mongoose');
const MenuItem = require('../models/MenuItem');
require('dotenv').config();

const updateProduct = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cafe-management';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Find product with name "123"
    const product = await MenuItem.findOne({ name: '123' });
    
    if (!product) {
      console.log('❌ Không tìm thấy sản phẩm có tên "123"');
      await mongoose.disconnect();
      return;
    }

    console.log(`📦 Tìm thấy sản phẩm: ${product.name} (ID: ${product._id})`);

    // Update product
    product.name = 'Sữa chua';
    product.imageUrl = '/images/anhsuachua.jpg';
    
    await product.save();
    
    console.log('✅ Đã cập nhật sản phẩm:');
    console.log(`   - Tên mới: ${product.name}`);
    console.log(`   - ImageUrl: ${product.imageUrl}`);

    await mongoose.disconnect();
    console.log('✅ Đã ngắt kết nối MongoDB');
  } catch (error) {
    console.error('❌ Lỗi:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

updateProduct();

