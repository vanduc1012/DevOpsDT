// Helper để debug authentication
export const debugAuth = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  console.log('=== AUTH DEBUG ===');
  console.log('Token exists:', !!token);
  console.log('Token length:', token ? token.length : 0);
  console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'null');
  console.log('User exists:', !!user);
  
  if (user) {
    try {
      const userObj = JSON.parse(user);
      console.log('User data:', userObj);
      console.log('User role:', userObj.role);
      console.log('Is ADMIN:', userObj.role === 'ADMIN');
    } catch (e) {
      console.error('Error parsing user:', e);
    }
  }
  
  console.log('==================');
  
  return {
    hasToken: !!token,
    hasUser: !!user,
    token: token,
    user: user ? JSON.parse(user) : null
  };
};

// Test API call với token
export const testApiCall = async (api) => {
  const token = localStorage.getItem('token');
  
  console.log('Testing API call with token...');
  console.log('Token:', token ? 'Present' : 'Missing');
  
  try {
    const response = await api.get('/api/prices/test');
    console.log('✅ API call successful:', response.data);
    return response;
  } catch (error) {
    console.error('❌ API call failed:', error);
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data);
    return null;
  }
};

