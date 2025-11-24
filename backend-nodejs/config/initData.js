const User = require('../models/User');

const initializeData = async () => {
  try {
    // Check if root user exists
    const rootUser = await User.findOne({ username: 'root' });
    
    if (!rootUser) {
      // Create root user
      const root = new User({
        username: 'root',
        password: 'root123',
        fullName: 'Root Administrator',
        role: 'ADMIN'
      });
      await root.save();
      console.log('✅ Root user created: username=root, password=root123');
    } else {
      console.log('ℹ️ Root user already exists');
    }
  } catch (error) {
    console.error('Error initializing data:', error);
  }
};

module.exports = initializeData;

