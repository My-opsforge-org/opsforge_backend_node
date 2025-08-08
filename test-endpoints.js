const axios = require('axios');

const BASE_URL = 'http://localhost:5002';

// Test function
async function testEndpoints() {
  console.log('Testing API endpoints...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Health endpoint:', healthResponse.status, healthResponse.data.status);

    // Test profile endpoint (will fail without auth, but should not be 404)
    console.log('\n2. Testing profile endpoint...');
    try {
      const profileResponse = await axios.get(`${BASE_URL}/api/profile`);
      console.log('❌ Profile endpoint should require authentication');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Profile endpoint requires authentication (expected)');
      } else if (error.response && error.response.status === 404) {
        console.log('❌ Profile endpoint not found (404)');
      } else {
        console.log('✅ Profile endpoint accessible:', error.response?.status || error.message);
      }
    }

    // Test feed endpoint (will fail without auth, but should not be 404)
    console.log('\n3. Testing feed endpoint...');
    try {
      const feedResponse = await axios.get(`${BASE_URL}/api/feed`);
      console.log('❌ Feed endpoint should require authentication');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Feed endpoint requires authentication (expected)');
      } else if (error.response && error.response.status === 404) {
        console.log('❌ Feed endpoint not found (404)');
      } else {
        console.log('✅ Feed endpoint accessible:', error.response?.status || error.message);
      }
    }

    // Test users profile endpoint
    console.log('\n4. Testing users profile endpoint...');
    try {
      const usersProfileResponse = await axios.get(`${BASE_URL}/api/users/profile`);
      console.log('❌ Users profile endpoint should require authentication');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Users profile endpoint requires authentication (expected)');
      } else if (error.response && error.response.status === 404) {
        console.log('❌ Users profile endpoint not found (404)');
      } else {
        console.log('✅ Users profile endpoint accessible:', error.response?.status || error.message);
      }
    }

    console.log('\n🎉 All tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run tests
testEndpoints();
