/**
 * SSE Test Script
 * Tests Server-Sent Events implementation
 */

const axios = require('axios');
const EventSource = require('eventsource');

const BASE_URL = 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api`;

// Test results
const results = {
  passed: [],
  failed: [],
};

// Helper to get auth token
async function getAuthToken() {
  try {
    // First, register a user
    const phoneNumber = `+123456789${Math.floor(Math.random() * 10000)}`;
    
    // Generate registration OTP
    const otpResponse = await axios.post(`${API_BASE}/register/generate-otp`, {
      phoneNumber,
    });
    
    const otp = otpResponse.data.otp || '123456';
    
    // Verify registration
    const verifyResponse = await axios.post(`${API_BASE}/register/verify-otp`, {
      phoneNumber,
      otp,
      displayName: 'Test User',
    });
    
    if (!verifyResponse.data.userId) {
      throw new Error('Registration failed');
    }
    
    // Generate login OTP
    const loginOtpResponse = await axios.post(`${API_BASE}/otp/generate`, {
      phoneNumber,
    });
    
    const loginOtp = loginOtpResponse.data.otp || '123456';
    
    // Login
    const loginResponse = await axios.post(`${API_BASE}/otp/verify`, {
      phoneNumber,
      otp: loginOtp,
    });
    
    return loginResponse.data.token;
  } catch (error) {
    console.error('Error getting auth token:', error.message);
    return null;
  }
}

// Test SSE connection
async function testSSEConnection() {
  console.log('\n📡 Testing SSE Connection...');
  
  try {
    // Get auth token
    console.log('  → Getting auth token...');
    const token = await getAuthToken();
    if (!token) {
      results.failed.push('SSE - Get auth token');
      console.log('  ❌ Get auth token: FAILED');
      return;
    }
    results.passed.push('SSE - Get auth token');
    console.log('  ✅ Get auth token: PASSED');
    
    // Create a conversation
    console.log('  → Creating conversation...');
    const convResponse = await axios.post(
      `${API_BASE}/chat/conversations`,
      { otherUserId: 'user_test_456' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    if (!convResponse.data.conversation) {
      results.failed.push('SSE - Create conversation');
      console.log('  ❌ Create conversation: FAILED');
      return;
    }
    
    const conversationId = convResponse.data.conversation.conversationId;
    results.passed.push('SSE - Create conversation');
    console.log('  ✅ Create conversation: PASSED');
    console.log(`  💬 Conversation ID: ${conversationId}`);
    
    // Connect to SSE
    console.log('  → Connecting to SSE...');
    const sseUrl = `${API_BASE}/sse?conversationId=${conversationId}&token=${token}`;
    
    return new Promise((resolve) => {
      const eventSource = new EventSource(sseUrl);
      let connected = false;
      let messageReceived = false;
      
      eventSource.onopen = () => {
        if (!connected) {
          connected = true;
          results.passed.push('SSE - Connection established');
          console.log('  ✅ SSE connection: PASSED');
          
          // Test sending a message
          setTimeout(async () => {
            console.log('  → Sending test message...');
            try {
              const messageResponse = await axios.post(
                `${API_BASE}/chat/messages`,
                {
                  conversationId,
                  text: 'Test message via SSE',
                  type: 'text',
                },
                { headers: { Authorization: `Bearer ${token}` } }
              );
              
              if (messageResponse.data.success) {
                results.passed.push('SSE - Send message');
                console.log('  ✅ Send message: PASSED');
              }
            } catch (error) {
              results.failed.push('SSE - Send message');
              console.log('  ❌ Send message: FAILED');
            }
          }, 1000);
        }
      };
      
      eventSource.addEventListener('connected', (event) => {
        console.log('  📨 Connected event received');
      });
      
      eventSource.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.messageId || data.id) {
            if (!messageReceived) {
              messageReceived = true;
              results.passed.push('SSE - Receive message');
              console.log('  ✅ Receive message via SSE: PASSED');
              console.log(`  📬 Message: ${data.text}`);
            }
          }
        } catch (error) {
          console.error('  Error parsing message:', error);
        }
      });
      
      eventSource.addEventListener('statusUpdate', (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('  📊 Status update received:', data);
        } catch (error) {
          console.error('  Error parsing status update:', error);
        }
      });
      
      eventSource.onerror = (error) => {
        console.error('  ❌ SSE error:', error);
        results.failed.push('SSE - Connection error');
      };
      
      // Close after 5 seconds
      setTimeout(() => {
        eventSource.close();
        resolve();
      }, 5000);
    });
  } catch (error) {
    console.error('SSE test error:', error.message);
    results.failed.push('SSE - Connection test');
  }
}

// Main test runner
async function runTests() {
  console.log('🧪 Starting SSE Tests...');
  console.log('='.repeat(50));
  
  await testSSEConnection();
  
  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 SSE Test Summary');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${results.passed.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  
  if (results.passed.length > 0) {
    console.log('\n✅ Passed Tests:');
    results.passed.forEach(test => console.log(`   - ${test}`));
  }
  
  if (results.failed.length > 0) {
    console.log('\n❌ Failed Tests:');
    results.failed.forEach(test => console.log(`   - ${test}`));
  }
  
  console.log('\n' + '='.repeat(50));
}

// Check if eventsource is available
if (typeof EventSource === 'undefined') {
  console.log('⚠️  EventSource not available. Install eventsource package:');
  console.log('   npm install eventsource');
  console.log('\n   Or test manually using curl:');
  console.log('   curl -N -H "Authorization: Bearer <token>" \\');
  console.log('     "http://localhost:3000/api/sse?conversationId=xxx&token=xxx"');
} else {
  runTests().catch(error => {
    console.error('❌ Test runner error:', error);
    process.exit(1);
  });
}

