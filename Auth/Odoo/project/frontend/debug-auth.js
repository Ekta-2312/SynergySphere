// Simple test script to check authentication
console.log('=== Authentication Debug ===');
console.log('Access Token:', localStorage.getItem('accessToken'));
console.log('User Data:', localStorage.getItem('user'));
console.log('Is New Login:', localStorage.getItem('isNewLogin'));

// Test API call
const testAPI = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    console.log('Making test API call with token:', token?.substring(0, 20) + '...');
    
    const response = await fetch('http://localhost:5000/api/projects', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    if (response.ok) {
      const data = await response.json();
      console.log('API Response:', data);
    } else {
      const error = await response.text();
      console.log('API Error:', error);
    }
  } catch (error) {
    console.error('Network Error:', error);
  }
};

testAPI();
