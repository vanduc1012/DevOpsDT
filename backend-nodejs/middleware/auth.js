const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    console.log('🔍 Auth check:', {
      method: req.method,
      path: req.path,
      hasAuthHeader: !!authHeader,
      authHeaderPrefix: authHeader ? authHeader.substring(0, 20) + '...' : 'none'
    });
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('⚠️ No valid Authorization header');
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Vui lòng đăng nhập để truy cập',
        status: 401
      });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'cafe_secret_key_2025_very_long_and_secure_key_for_jwt_token_generation');
      
      console.log('🔐 JWT decoded:', { userId: decoded.userId });
      
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        console.warn('❌ User not found:', decoded.userId);
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Người dùng không tồn tại',
          status: 401
        });
      }

      req.user = {
        id: user._id.toString(),
        username: user.username,
        role: user.role
      };
      
      console.log('✅ Authentication successful:', { username: user.username, role: user.role });
      next();
    } catch (error) {
      console.error('❌ JWT verification failed:', error.message);
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.',
        status: 401
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
      status: 500
    });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Bạn không có quyền truy cập tài nguyên này',
      status: 403
    });
  }
};

module.exports = { authMiddleware, adminMiddleware };

