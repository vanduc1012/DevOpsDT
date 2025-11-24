const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'cafe_secret_key_2025_very_long_and_secure_key_for_jwt_token_generation',
    {
      expiresIn: process.env.JWT_EXPIRATION || '24h'
    }
  );
};

const verifyToken = (token) => {
  return jwt.verify(
    token,
    process.env.JWT_SECRET || 'cafe_secret_key_2025_very_long_and_secure_key_for_jwt_token_generation'
  );
};

module.exports = { generateToken, verifyToken };

