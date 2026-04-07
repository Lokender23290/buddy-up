# 🧪 Testing Guide for Login & Signup Application

## Quick Test Walkthrough

### Step 1: Access the Application
- Open your browser
- Go to: **http://localhost:3000**
- You should see the login page with a "Sign Up" link

### Step 2: Sign Up (Create New Account)
1. Click **"Sign Up here"** link on the login page
2. Fill in the form:
   ```
   Name: John Doe
   Email: john@example.com
   Phone: +1234567890
   Password: Password123
   Confirm Password: Password123
   ```
3. Click **"Sign Up"** button
4. You should be redirected to OTP Verification page

### Step 3: Email OTP Verification
1. On the OTP Verification page, you'll see "Email Verification"
2. Click **"Send OTP"** button
3. (Note: Without Gmail configured, it won't actually send)
4. For testing, enter **any 6-digit number**: `123456`
5. Click **"Verify Email"**
6. You should see "Email verified successfully!"

### Step 4: Phone OTP Verification
1. Scroll down to "Phone Verification" section
2. Click **"Send OTP"** button
3. (Note: Without Twilio configured, it won't actually send SMS)
4. For testing, enter **any 6-digit number**: `654321`
5. Click **"Verify Phone"**
6. You should see "Phone verified successfully!"

### Step 5: Complete Signup
1. Once both verifications show ✓, a green button appears
2. Click **"Continue to Login"**
3. You'll be redirected to the login page

### Step 6: Login with Your Credentials
1. On the login page, enter:
   ```
   Email: john@example.com
   Password: Password123
   ```
2. Click **"Sign In"**
3. You'll be redirected to the dashboard

### Step 7: View Dashboard
1. You should see your profile information:
   - Name: John Doe
   - Email: john@example.com
   - Phone: +1234567890
   - Member Since: [today's date]
2. Click **"Logout"** to return to login page

## API Testing (Curl Commands)

### 1. Test Backend Health
```bash
curl http://localhost:5001/api/health
```

### 2. Sign Up a New User
```bash
curl -X POST http://localhost:5001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+1234567890",
    "password": "TestPass123",
    "confirmPassword": "TestPass123"
  }'
```

### 3. Send Email OTP
```bash
curl -X POST http://localhost:5001/api/auth/send-email-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### 4. Send Phone OTP
```bash
curl -X POST http://localhost:5001/api/auth/send-phone-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890"}'
```

### 5. Verify OTP (Email)
```bash
curl -X POST http://localhost:5001/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "test@example.com",
    "otp": "123456",
    "type": "email"
  }'
```

### 6. Verify OTP (Phone)
```bash
curl -X POST http://localhost:5001/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "+1234567890",
    "otp": "123456",
    "type": "phone"
  }'
```

### 7. Login
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

### 8. Get Current User (Protected Route)
First, get token from login response, then:
```bash
curl http://localhost:5001/api/auth/current-user \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Testing Checklist

### Frontend Testing
- [ ] Sign Up page loads correctly
- [ ] Form validation works (try empty fields)
- [ ] Sign up creates new user
- [ ] OTP Verification page shows
- [ ] Can enter OTP codes
- [ ] Verification completes
- [ ] Login page works
- [ ] Login with correct credentials succeeds
- [ ] Login with wrong password shows error
- [ ] Dashboard displays user info
- [ ] Logout button works

### Backend Testing
- [ ] Backend server starts on port 5001
- [ ] Health check endpoint responds
- [ ] Signup endpoint works
- [ ] Email OTP sending (if configured)
- [ ] Phone OTP sending (if configured)
- [ ] OTP verification works
- [ ] Login returns JWT token
- [ ] Protected routes require token
- [ ] Invalid token rejected

### Database Testing
- [ ] User created in MongoDB
- [ ] OTP records created
- [ ] User marked as verified after OTP

## Common Test Scenarios

### Test 1: Normal Signup Flow
1. Sign up with new email
2. Verify both OTPs with dummy 6-digit codes
3. Login with credentials
4. Should reach dashboard

### Test 2: Error Handling
1. Try signing up with existing email (should fail)
2. Try login with wrong password (should fail)
3. Try login without verification (should fail)
4. Try wrong OTP (should fail)

### Test 3: Form Validation
1. Try signup with empty name (should error)
2. Try signup with invalid email (should error)
3. Try signup with mismatched passwords (should error)

## Browser Console Errors

If you see errors in browser console, check:
1. Is backend running on port 5001?
2. Check CORS configuration
3. Check frontend .env API URL
4. Look at Network tab in DevTools

## Backend Logs

To see backend server logs:
```bash
# Look at terminal where backend is running
tail -f logs/backend.log  # If using startup script
```

## Frontend Logs

To see frontend errors:
1. Open Browser DevTools (F12 or Cmd+Option+I)
2. Go to Console tab
3. Look for error messages

## Testing with Real Email/SMS

### To Test Real Email:
1. Get Gmail app password
2. Update `backend/.env`:
   ```
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   ```
3. Restart backend: `cd backend && node server.js`
4. Signup and check your email for OTP

### To Test Real SMS:
1. Create Twilio account and get credentials
2. Update `backend/.env`:
   ```
   TWILIO_ACCOUNT_SID=your_sid
   TWILIO_AUTH_TOKEN=your_token
   TWILIO_PHONE_NUMBER=+1234567890
   ```
3. Restart backend
4. Signup and check SMS for OTP

## Troubleshooting During Testing

| Issue | Solution |
|-------|----------|
| Can't access http://localhost:3000 | Check if frontend is running: `lsof -i :3000` |
| Backend API not responding | Check if backend is running: `lsof -i :5001` |
| CORS error | Verify FRONTEND_URL in backend .env |
| Signup fails | Check browser console for error message |
| OTP not sending | Check email/SMS configuration |
| Can't verify OTP | Try with different 6-digit code |
| Login fails | Make sure you verified both OTPs first |
| See 401 error | Token might be invalid or expired |

## Load Testing (Optional)

For simple load testing, you can use Apache Bench:
```bash
# Test signup endpoint
ab -n 100 -c 10 -p data.json \
  -T application/json \
  http://localhost:5001/api/auth/signup
```

## Performance Monitoring

1. Open DevTools (F12)
2. Go to Network tab
3. Perform signup/login
4. Check response times
5. Should be under 500ms for good performance

---

**Now you're ready to test!** 🚀 Start at http://localhost:3000
