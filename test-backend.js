/**
 * Backend API Test Script
 * Tests all endpoints and complete user flow
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api`;

// Test results
const results = {
  passed: [],
  failed: [],
  warnings: []
};

// Helper function to make API calls
async function apiCall(method, endpoint, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${API_BASE}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500,
    };
  }
}

// Test functions
async function testHealthCheck() {
  console.log('\n🏥 Testing Health Check...');
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    if (response.data.status === 'ok') {
      results.passed.push('Health check');
      console.log('✅ Health check: PASSED');
      return true;
    }
  } catch (error) {
    results.failed.push('Health check');
    console.log('❌ Health check: FAILED');
    return false;
  }
}

async function testRegistration() {
  console.log('\n📝 Testing Registration Flow...');
  const testPhone = `+123456789${Math.floor(Math.random() * 10000)}`;
  const testEmail = `test${Math.floor(Math.random() * 10000)}@example.com`;
  let otp = null;

  // Test 1: Check availability
  console.log('  → Checking phone availability...');
  const availability = await apiCall('GET', `/register/check-availability?phoneNumber=${encodeURIComponent(testPhone)}`);
  if (availability.success && availability.data.available) {
    results.passed.push('Registration - Check availability');
    console.log('  ✅ Check availability: PASSED');
  } else {
    results.failed.push('Registration - Check availability');
    console.log('  ❌ Check availability: FAILED');
    return null;
  }

  // Test 2: Generate OTP
  console.log('  → Generating registration OTP...');
  const otpResponse = await apiCall('POST', '/register/generate-otp', {
    phoneNumber: testPhone,
  });
  if (otpResponse.success) {
    otp = otpResponse.data.otp; // In dev mode, OTP is returned
    results.passed.push('Registration - Generate OTP');
    console.log('  ✅ Generate OTP: PASSED');
    console.log(`  📱 OTP: ${otp || 'Check server logs'}`);
  } else {
    results.failed.push('Registration - Generate OTP');
    console.log('  ❌ Generate OTP: FAILED');
    console.log('  Error:', otpResponse.error);
    return null;
  }

  // Test 3: Verify OTP
  console.log('  → Verifying registration OTP...');
  const verifyResponse = await apiCall('POST', '/register/verify-otp', {
    phoneNumber: testPhone,
    otp: otp || '123456', // Use returned OTP or default
    displayName: 'Test User',
  });
  if (verifyResponse.success && verifyResponse.data.userId) {
    results.passed.push('Registration - Verify OTP');
    console.log('  ✅ Verify OTP: PASSED');
    console.log(`  👤 User ID: ${verifyResponse.data.userId}`);
    return {
      userId: verifyResponse.data.userId,
      phoneNumber: testPhone,
    };
  } else {
    results.failed.push('Registration - Verify OTP');
    console.log('  ❌ Verify OTP: FAILED');
    console.log('  Error:', verifyResponse.error);
    return null;
  }
}

async function testOTPLogin(phoneNumber) {
  console.log('\n📱 Testing OTP Login Flow...');
  let token = null;

  // Test 1: Generate OTP
  console.log('  → Generating login OTP...');
  const otpResponse = await apiCall('POST', '/otp/generate', {
    phoneNumber,
  });
  if (otpResponse.success) {
    results.passed.push('OTP Login - Generate OTP');
    console.log('  ✅ Generate OTP: PASSED');
    console.log(`  📱 OTP: ${otpResponse.data.otp || 'Check server logs'}`);
  } else {
    results.failed.push('OTP Login - Generate OTP');
    console.log('  ❌ Generate OTP: FAILED');
    console.log('  Error:', otpResponse.error);
    return null;
  }

  // Test 2: Verify OTP
  console.log('  → Verifying login OTP...');
  const verifyResponse = await apiCall('POST', '/otp/verify', {
    phoneNumber,
    otp: otpResponse.data.otp || '123456',
  });
  if (verifyResponse.success && verifyResponse.data.token) {
    token = verifyResponse.data.token;
    results.passed.push('OTP Login - Verify OTP');
    console.log('  ✅ Verify OTP: PASSED');
    console.log(`  🔑 Token: ${token.substring(0, 20)}...`);
    return token;
  } else {
    results.failed.push('OTP Login - Verify OTP');
    console.log('  ❌ Verify OTP: FAILED');
    console.log('  Error:', verifyResponse.error);
    return null;
  }
}

async function testQRCodeLogin() {
  console.log('\n🖥️  Testing QR Code Login Flow...');
  let qrToken = null;
  let desktopToken = null;

  // Test 1: Generate QR
  console.log('  → Generating QR code...');
  const qrResponse = await apiCall('POST', '/qr/generate');
  if (qrResponse.success && qrResponse.data.qrToken) {
    qrToken = qrResponse.data.qrToken;
    results.passed.push('QR Login - Generate QR');
    console.log('  ✅ Generate QR: PASSED');
    console.log(`  🔲 QR Token: ${qrToken}`);
  } else {
    results.failed.push('QR Login - Generate QR');
    console.log('  ❌ Generate QR: FAILED');
    return null;
  }

  // Test 2: Check QR Status (should be pending)
  console.log('  → Checking QR status (pending)...');
  const statusResponse = await apiCall('GET', `/qr/status/${qrToken}`);
  if (statusResponse.success && statusResponse.data.status === 'pending') {
    results.passed.push('QR Login - Check status (pending)');
    console.log('  ✅ Check status: PASSED (pending)');
  } else {
    results.failed.push('QR Login - Check status');
    console.log('  ❌ Check status: FAILED');
  }

  // Note: Full QR flow requires mobile app to scan, so we'll just test generation
  results.warnings.push('QR Login - Full flow requires mobile app to scan QR code');
  console.log('  ⚠️  Full QR flow requires mobile app to scan');

  return { qrToken };
}

async function testSessionStart(token) {
  console.log('\n🔐 Testing Session Start...');

  // Test 1: Verify token
  console.log('  → Verifying token...');
  const verifyResponse = await apiCall('GET', '/auth/verify', null, token);
  if (verifyResponse.success && verifyResponse.data.userId) {
    results.passed.push('Session - Verify token');
    console.log('  ✅ Verify token: PASSED');
    console.log(`  👤 User ID: ${verifyResponse.data.userId}`);
  } else {
    results.failed.push('Session - Verify token');
    console.log('  ❌ Verify token: FAILED');
    return false;
  }

  // Test 2: Update online status
  console.log('  → Updating online status...');
  const statusResponse = await apiCall('PUT', '/chat/status/online', { isOnline: true }, token);
  if (statusResponse.success) {
    results.passed.push('Session - Update online status');
    console.log('  ✅ Update online status: PASSED');
  } else {
    results.failed.push('Session - Update online status');
    console.log('  ❌ Update online status: FAILED');
  }

  return true;
}

async function testChat(token, userId) {
  console.log('\n💬 Testing Chat Functionality...');

  // Test 1: Create conversation
  console.log('  → Creating conversation...');
  const otherUserId = 'user_test_456';
  const convResponse = await apiCall('POST', '/chat/conversations', {
    otherUserId,
  }, token);
  if (convResponse.success && convResponse.data.conversation) {
    const conversationId = convResponse.data.conversation.conversationId;
    results.passed.push('Chat - Create conversation');
    console.log('  ✅ Create conversation: PASSED');
    console.log(`  💬 Conversation ID: ${conversationId}`);

    // Test 2: Send message
    console.log('  → Sending message...');
    const messageResponse = await apiCall('POST', '/chat/messages', {
      conversationId,
      text: 'Hello! This is a test message',
      type: 'text',
    }, token);
    if (messageResponse.success && messageResponse.data.message) {
      results.passed.push('Chat - Send message');
      console.log('  ✅ Send message: PASSED');
      console.log(`  📨 Message ID: ${messageResponse.data.message.messageId}`);

      // Test 3: Get messages
      console.log('  → Getting messages...');
      const getMessagesResponse = await apiCall('GET', `/chat/conversations/${conversationId}/messages`, null, token);
      if (getMessagesResponse.success && Array.isArray(getMessagesResponse.data.messages)) {
        results.passed.push('Chat - Get messages');
        console.log('  ✅ Get messages: PASSED');
        console.log(`  📬 Messages count: ${getMessagesResponse.data.messages.length}`);
      } else {
        results.failed.push('Chat - Get messages');
        console.log('  ❌ Get messages: FAILED');
      }

      // Test 4: Update message status
      if (messageResponse.data.message.messageId) {
        console.log('  → Updating message status...');
        const statusResponse = await apiCall('PUT', `/chat/messages/${messageResponse.data.message.messageId}/status`, {
          status: 'read',
        }, token);
        if (statusResponse.success) {
          results.passed.push('Chat - Update message status');
          console.log('  ✅ Update message status: PASSED');
        } else {
          results.failed.push('Chat - Update message status');
          console.log('  ❌ Update message status: FAILED');
        }
      }

      return conversationId;
    } else {
      results.failed.push('Chat - Send message');
      console.log('  ❌ Send message: FAILED');
      console.log('  Error:', messageResponse.error);
    }
  } else {
    results.failed.push('Chat - Create conversation');
    console.log('  ❌ Create conversation: FAILED');
    console.log('  Error:', convResponse.error);
  }

  return null;
}

async function testTypingIndicator(token, conversationId) {
  console.log('\n⌨️  Testing Typing Indicators...');

  // Test 1: Set typing
  console.log('  → Setting typing indicator...');
  const setTypingResponse = await apiCall('POST', '/chat/typing', {
    conversationId,
    isTyping: true,
  }, token);
  if (setTypingResponse.success) {
    results.passed.push('Typing - Set typing indicator');
    console.log('  ✅ Set typing indicator: PASSED');
  } else {
    results.failed.push('Typing - Set typing indicator');
    console.log('  ❌ Set typing indicator: FAILED');
  }

  // Test 2: Get typing indicators
  console.log('  → Getting typing indicators...');
  const getTypingResponse = await apiCall('GET', `/chat/conversations/${conversationId}/typing`, null, token);
  if (getTypingResponse.success) {
    results.passed.push('Typing - Get typing indicators');
    console.log('  ✅ Get typing indicators: PASSED');
  } else {
    results.failed.push('Typing - Get typing indicators');
    console.log('  ❌ Get typing indicators: FAILED');
  }
}

async function testLogout(token) {
  console.log('\n🚪 Testing Logout...');

  const logoutResponse = await apiCall('POST', '/auth/logout', null, token);
  if (logoutResponse.success) {
    results.passed.push('Logout');
    console.log('  ✅ Logout: PASSED');

    // Verify token is invalidated
    console.log('  → Verifying token is invalidated...');
    const verifyResponse = await apiCall('GET', '/auth/verify', null, token);
    if (!verifyResponse.success) {
      results.passed.push('Logout - Token invalidated');
      console.log('  ✅ Token invalidated: PASSED');
    } else {
      results.failed.push('Logout - Token invalidated');
      console.log('  ❌ Token invalidated: FAILED (token still works)');
    }
  } else {
    results.failed.push('Logout');
    console.log('  ❌ Logout: FAILED');
    console.log('  Error:', logoutResponse.error);
  }
}

async function testSSE() {
  console.log('\n📡 Testing SSE Implementation...');
  results.warnings.push('SSE - Backend SSE endpoint not implemented');
  console.log('  ⚠️  SSE endpoint not implemented in backend');
  console.log('  ⚠️  Frontend has SSE service but backend lacks SSE endpoint');
  console.log('  💡 Recommendation: Implement SSE endpoint or use Socket.io');
}

// Main test runner
async function runTests() {
  console.log('🧪 Starting Backend API Tests...');
  console.log('='.repeat(50));

  // Test 1: Health check
  const healthOk = await testHealthCheck();
  if (!healthOk) {
    console.log('\n❌ Server is not running. Please start the server first.');
    console.log('   Run: cd mock-backend && node server.js');
    return;
  }

  // Test 2: Registration
  const user = await testRegistration();
  if (!user) {
    console.log('\n⚠️  Registration failed. Some tests may fail.');
  }

  // Test 3: OTP Login
  let token = null;
  if (user) {
    token = await testOTPLogin(user.phoneNumber);
  }

  // Test 4: QR Code Login (partial)
  await testQRCodeLogin();

  // Test 5: Session Start
  if (token) {
    await testSessionStart(token);

    // Test 6: Chat
    const conversationId = await testChat(token, user.userId);

    // Test 7: Typing Indicators
    if (conversationId) {
      await testTypingIndicator(token, conversationId);
    }

    // Test 8: Logout
    await testLogout(token);
  }

  // Test 9: SSE
  await testSSE();

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Summary');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${results.passed.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`⚠️  Warnings: ${results.warnings.length}`);

  if (results.passed.length > 0) {
    console.log('\n✅ Passed Tests:');
    results.passed.forEach(test => console.log(`   - ${test}`));
  }

  if (results.failed.length > 0) {
    console.log('\n❌ Failed Tests:');
    results.failed.forEach(test => console.log(`   - ${test}`));
  }

  if (results.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    results.warnings.forEach(warning => console.log(`   - ${warning}`));
  }

  console.log('\n' + '='.repeat(50));
}

// Run tests
runTests().catch(error => {
  console.error('❌ Test runner error:', error);
  process.exit(1);
});

