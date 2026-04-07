# Full-Stack Login & Signup Application with OTP Verification

A professional authentication system built with Node.js/Express backend and React frontend, featuring email and SMS-based OTP verification.

## Features

✅ **User Authentication**
- Secure signup and login
- Password hashing with bcryptjs
- JWT token-based authentication

✅ **OTP Verification**
- Email verification via Nodemailer
- SMS verification via Twilio
- 6-digit OTP with 10-minute expiry

✅ **Professional UI**
- Beautiful gradient design
- Responsive layout
- Form validation
- Error handling

✅ **Secure Backend**
- MongoDB database integration
- Protected routes with middleware
- Environment variable configuration

## Project Structure

```
signup/
├── backend/
│   ├── models/
│   │   ├── User.js          # User schema
│   │   └── OTP.js           # OTP schema
│   ├── controllers/
│   │   └── authController.js # Auth logic
│   ├── routes/
│   │   └── auth.js          # Auth endpoints
│   ├── middleware/
│   │   └── auth.js          # JWT verification
│   ├── utils/
│   │   ├── emailService.js  # Email sending
│   │   ├── smsService.js    # SMS sending
│   │   └── otpGenerator.js  # OTP generation
│   ├── config/
│   ├── server.js            # Express app
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── pages/
    │   │   ├── Signup.js
    │   │   ├── Login.js
    │   │   ├── OTPVerification.js
    │   │   └── Dashboard.js
    │   ├── context/
    │   │   └── AuthContext.js # Auth state management
    │   ├── utils/
    │   │   └── api.js        # API calls
    │   ├── App.js            # Main app
    │   ├── index.js
    │   └── index.css
    ├── package.json
    └── .env
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Nodemailer (Gmail setup required)
- Twilio account (for SMS)
- npm or yarn

## Installation & Setup

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in backend folder:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/auth_db
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890

FRONTEND_URL=http://localhost:3000
OTP_EXPIRY=10
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file in frontend folder:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Configuration Guide

### Gmail Setup (Email OTP)
1. Enable 2-Factor Authentication in your Google Account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use this app password in EMAIL_PASSWORD

### Twilio Setup (SMS OTP)
1. Create account at https://www.twilio.com
2. Get Account SID and Auth Token from dashboard
3. Purchase a phone number
4. Add credentials to .env

### MongoDB Setup
- **Local**: Install MongoDB and start service
- **Cloud**: Create cluster at https://www.mongodb.com/cloud/atlas and use connection string

## Running the Application

### Start Backend
```bash
cd backend
npm install
npm start
```
Server runs on http://localhost:5000

### Start Frontend (new terminal)
```bash
cd frontend
npm install
npm start
```
App runs on http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/send-email-otp` - Send email OTP
- `POST /api/auth/send-phone-otp` - Send SMS OTP
- `POST /api/auth/verify-otp` - Verify OTP
- `GET /api/auth/current-user` - Get logged-in user (protected)

## User Flow

1. **Signup Page**
   - Enter name, email, phone, password
   - Account created in database

2. **OTP Verification**
   - Receive OTP via email
   - Receive OTP via SMS
   - Verify both to complete signup

3. **Login Page**
   - Enter credentials
   - JWT token issued on success
   - Redirect to dashboard

4. **Dashboard**
   - View user profile
   - Logout option

## Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT authentication tokens
- ✅ Protected routes with middleware
- ✅ OTP expiration (10 minutes)
- ✅ Environment variables for secrets
- ✅ CORS configuration
- ✅ Input validation

## Testing

### Test Email OTP
```
1. Signup with valid email
2. Click "Send OTP" on email verification
3. Check your email for OTP
4. Enter OTP to verify
```

### Test Phone OTP
```
1. Ensure Twilio is configured
2. Click "Send OTP" on phone verification
3. Check your phone for SMS
4. Enter OTP to verify
```

### Test Login
```
1. After verification, go to login
2. Enter email and password
3. Successfully logged in and redirected to dashboard
```

## Styling

The application features:
- Modern gradient backgrounds
- Smooth transitions and hover effects
- Responsive design for all devices
- Professional color scheme (Purple/Blue)
- Accessible form controls

## Troubleshooting

**MongoDB Connection Error**
- Ensure MongoDB is running: `mongod`
- Check connection string in .env

**Email OTP not sending**
- Verify Gmail app password in .env
- Enable Less Secure Apps (if not using App Password)
- Check EMAIL_USER and EMAIL_PASSWORD

**SMS OTP not sending**
- Verify Twilio credentials
- Ensure phone number format is correct: +1234567890
- Check Twilio account balance

**CORS Error**
- Ensure FRONTEND_URL in backend .env matches frontend port
- Check proxy setting in frontend package.json

**Port Already in Use**
```bash
# Backend
lsof -i :5000
kill -9 <PID>

# Frontend
lsof -i :3000
kill -9 <PID>
```

## Next Steps

To enhance this application:
- Add password reset functionality
- Implement refresh tokens
- Add user profile editing
- Implement 2FA (Two-Factor Authentication)
- Add rate limiting for OTP requests
- Implement email verification links
- Add logging and monitoring
- Create admin dashboard
- Add email templates
- Implement session management

## License

MIT

## Support

For issues or questions, please check:
- Environment variables configuration
- MongoDB connection
- Twilio/Gmail API credentials
- Browser console for frontend errors
- Server logs for backend errors
