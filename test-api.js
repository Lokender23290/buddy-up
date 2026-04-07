// Example - How to Test the API
// Save this as test-api.js and run: node test-api.js

const axios = require('axios');

const API_URL = 'http://localhost:5001/api';

// Test data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  phone: '+1234567890',
  password: 'TestPassword123',
  confirmPassword: 'TestPassword123',
};

async function testAPI() {
  try {
    console.log('🧪 Testing Auth API...\n');

    // 1. Test Health Check
    console.log('1️⃣  Testing Backend Health...');
    const healthResponse = await axios.get('http://localhost:5001/api/health');
    console.log('   ✓ Backend is running\n');

    // 2. Test Signup
    console.log('2️⃣  Testing Signup...');
    const signupResponse = await axios.post(`${API_URL}/auth/signup`, testUser);
    console.log('   ✓ Signup successful');
    console.log('   Response:', signupResponse.data, '\n');

    // 3. Test Send Email OTP
    console.log('3️⃣  Testing Email OTP...');
    try {
      const emailOTPResponse = await axios.post(
        `${API_URL}/auth/send-email-otp`,
        { email: testUser.email }
      );
      console.log('   ✓ Email OTP sent (check console if configured)');
      console.log('   Response:', emailOTPResponse.data, '\n');
    } catch (error) {
      console.log('   ⚠️  Email not configured (expected)');
      console.log('   Note: Configure EMAIL_USER and EMAIL_PASSWORD in .env\n');
    }

    // 4. Test Send Phone OTP
    console.log('4️⃣  Testing Phone OTP...');
    try {
      const phoneOTPResponse = await axios.post(
        `${API_URL}/auth/send-phone-otp`,
        { phone: testUser.phone }
      );
      console.log('   ✓ Phone OTP sent (check SMS if configured)');
      console.log('   Response:', phoneOTPResponse.data, '\n');
    } catch (error) {
      console.log('   ⚠️  SMS not configured (expected)');
      console.log('   Note: Configure Twilio credentials in .env\n');
    }

    // 5. Test OTP Verification (use any 6 digits for testing)
    console.log('5️⃣  Testing OTP Verification...');
    try {
      const verifyResponse = await axios.post(`${API_URL}/auth/verify-otp`, {
        identifier: testUser.email,
        otp: '123456', // This will fail as OTP is random
        type: 'email',
      });
      console.log('   ✓ OTP verified');
    } catch (error) {
      console.log('   ℹ️  OTP verification failed (expected with random OTP)');
      console.log('   Note: Use actual OTP from email/SMS for real verification\n');
    }

    console.log('✅ API Tests Complete!\n');
    console.log('📱 Frontend: http://localhost:3000');
    console.log('🔌 Backend:  http://localhost:5001');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run tests
testAPI();
