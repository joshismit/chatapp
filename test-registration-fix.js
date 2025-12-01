/**
 * Quick test to verify registration accepts both email and phone
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

async function testRegistration() {
  try {
    console.log('🧪 Testing registration with both email and phone...\n');
    
    const testData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phoneNumber: '+1234567890',
      password: 'Test1234',
      confirmPassword: 'Test1234'
    };

    console.log('📤 Sending request with:', {
      firstName: testData.firstName,
      lastName: testData.lastName,
      email: testData.email,
      phoneNumber: testData.phoneNumber,
      password: '***',
      confirmPassword: '***'
    });

    const response = await axios.post(
      `${API_BASE_URL}/api/register/generate-otp`,
      testData
    );

    console.log('\n✅ SUCCESS! Registration accepts both email and phone');
    console.log('Response:', {
      success: response.data.success,
      message: response.data.message,
      expiresIn: response.data.expiresIn
    });
  } catch (error) {
    if (error.response) {
      console.error('\n❌ ERROR:', error.response.data.message);
      console.error('Status:', error.response.status);
      
      if (error.response.data.message.includes('Provide either phone number or email, not both')) {
        console.error('\n⚠️  The backend server is still running old code!');
        console.error('Please restart the backend server for changes to take effect.');
      }
    } else {
      console.error('\n❌ Network Error:', error.message);
      console.error('Make sure the backend server is running on port 3000');
    }
  }
}

testRegistration();

