# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### Step 2: Configure Environment Variables

**Backend (.env):**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/auth_db
JWT_SECRET=supersecretkey123
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env):**
```
REACT_APP_API_URL=http://localhost:5000/api
```

### Step 3: Start MongoDB

```bash
# If installed locally
mongod
```

### Step 4: Run Backend & Frontend

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### Step 5: Access the App

Open http://localhost:3000 in your browser

## 📝 Test Credentials

After signup and OTP verification, you can use the same credentials to login.

## 📚 Key Components

| Component | Purpose |
|-----------|---------|
| **Signup.js** | User registration |
| **Login.js** | User authentication |
| **OTPVerification.js** | Email & SMS verification |
| **Dashboard.js** | User profile page |
| **authController.js** | Backend authentication logic |
| **AuthContext.js** | React state management |

## 🔑 Features Included

- ✅ User registration with validation
- ✅ Secure password hashing
- ✅ Email OTP verification
- ✅ SMS OTP verification
- ✅ JWT token-based login
- ✅ Protected routes
- ✅ User dashboard
- ✅ Responsive UI
- ✅ Error handling

## ⚙️ Configuration Checklist

- [ ] MongoDB is running
- [ ] Gmail app password configured
- [ ] Twilio credentials added
- [ ] Backend .env created
- [ ] Frontend .env created
- [ ] Dependencies installed
- [ ] Both servers started

## 🆘 Common Issues

| Issue | Solution |
|-------|----------|
| Port 5000 in use | Change PORT in .env |
| Port 3000 in use | Kill process or use different port |
| MongoDB error | Ensure mongod is running |
| Email OTP fails | Verify Gmail credentials |
| SMS fails | Check Twilio account balance |

## 📱 Application Flow

```
Signup → OTP Verification → Login → Dashboard
  ↓          ↓               ↓
 Form    Email + SMS      JWT Token
         Verification    Protected Route
```

## 🎨 Customization

### Change Colors
Edit `frontend/src/index.css`:
```css
/* Current: Purple/Blue Gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Try: Pink/Orange Gradient */
background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
```

### Change OTP Expiry
Edit `backend/models/OTP.js`:
```javascript
// Change from 10 minutes to desired time
default: () => new Date(+new Date() + 10*60*1000)
```

## 📖 Next Steps

1. Test signup flow
2. Verify OTP functionality
3. Test login
4. Customize styling
5. Deploy to production

---

**Need help?** Check the main README.md for detailed configuration instructions.
