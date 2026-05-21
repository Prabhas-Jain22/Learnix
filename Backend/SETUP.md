# Backend Setup Guide

## Prerequisites

- Node.js v14+ installed
- MongoDB running locally (or MongoDB Atlas)
- Gmail account (for OTP emails)

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages:
- express: Web framework
- mongoose: MongoDB ORM
- jwt: Authentication
- bcryptjs: Password hashing
- nodemailer: Email service
- multer: File uploads
- cors: Cross-origin requests
- dotenv: Environment variables

### 2. Configure Environment Variables

Create a `.env` file in the Backend directory with the following:

```env
# Database
MONGO_URI=mongodb://127.0.0.1:27017/lms

# JWT Configuration
JWT_SECRET=your-secret-key-here-min-32-chars
JWT_EXPIRY=1h

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_SERVICE=gmail

# OTP Configuration
OTP_EXPIRY=5

# Server
PORT=5000
NODE_ENV=development
```

### 3. Email Setup (Gmail)

**For Gmail Users:**
1. Enable 2-step verification on your Google Account
2. Generate an App Password:
   - Visit https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer" (or your device)
   - Google will generate a 16-character password
   - Use this password as EMAIL_PASSWORD in .env

**For Other Email Services:**
- Change EMAIL_SERVICE to your provider (e.g., "outlook", "yahoo")
- Update EMAIL_USER and EMAIL_PASSWORD accordingly

### 4. MongoDB Setup

**Option A: Local MongoDB**
```bash
# Start MongoDB service
mongod

# Verify connection
mongosh mongodb://127.0.0.1:27017/lms
```

**Option B: MongoDB Atlas**
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/lms
```

### 5. Start the Server

```bash
# Development mode
npm start

# Or with auto-reload (install nodemon first)
npm install -D nodemon
npx nodemon server.js
```

You should see:
```
MongoDB Connected ✅
Server running on port 5000 🚀
```

## Project Structure

```
Backend/
├── controllers/          # Business logic for routes
│   ├── authController.js        # Authentication logic
│   ├── courseController.js       # Course management
│   ├── assignmentController.js   # Assignment logic
│   ├── userController.js         # User profile
│   ├── doubtController.js        # Q&A logic
│   └── progressController.js     # Progress tracking
│
├── models/              # MongoDB schemas
│   ├── user.js          # User schema
│   ├── Course.js        # Course schema
│   ├── Assignment.js    # Assignment schema
│   ├── Submission.js    # Submission schema
│   ├── Doubt.js         # Doubt schema
│   └── Progress.js      # Progress schema
│
├── routes/              # API endpoints
│   ├── authRoutes.js           # /api/auth
│   ├── courseRoutes.js         # /api/courses
│   ├── assignmentRoutes.js     # /api/assignments
│   ├── userRoutes.js           # /api/users
│   ├── doubtRoutes.js          # /api/doubts
│   └── progressRoutes.js       # /api/progress
│
├── middleware/          # Express middleware
│   ├── authMiddleware.js       # JWT verification
│   └── roleMiddleware.js       # Role-based access
│
├── utils/              # Helper functions
│   └── otpUtils.js      # OTP generation & sending
│
├── uploads/            # Video & image storage
│
├── server.js           # Main application file
├── .env                # Environment variables
├── .env.example         # Example env file
└── package.json        # Dependencies
```

## API Testing

### Using Postman or Thunder Client

1. **Test OTP Login**
   ```
   POST http://localhost:5000/api/auth/send-otp
   Body: { "email": "user@example.com" }
   ```

2. **Verify OTP**
   ```
   POST http://localhost:5000/api/auth/verify-otp
   Body: { "email": "user@example.com", "otp": "123456" }
   ```

3. **Test Protected Route**
   ```
   GET http://localhost:5000/api/users/profile
   Headers: { "Authorization": "your-jwt-token" }
   ```

## Common Issues & Solutions

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Start MongoDB service
```bash
# Windows
mongod

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Email Not Sending
```
Error: Invalid login
```
**Solution:** 
- Verify EMAIL_USER and EMAIL_PASSWORD in .env
- For Gmail, use App Password (16 chars), not account password
- Less secure apps must be enabled in Gmail

### Port Already in Use
```
Error: listen EADDRINUSE :::5000
```
**Solution:**
```bash
# Kill process using port 5000
lsof -ti:5000 | xargs kill -9

# Or use different port
PORT=3000 npm start
```

### JWT Token Expired
```
Error: Token expired. Please login again.
```
**Solution:** User needs to login again to get a new token

## Database Models

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: "student" | "instructor",
  otp: String,
  otpExpiry: Date,
  isOtpVerified: Boolean,
  profilePicture: String,
  bio: String,
  enrolledCourses: [ObjectId],
  createdAt: Date
}
```

### Course
```javascript
{
  title: String,
  description: String,
  category: String,
  thumbnail: String,
  instructor: ObjectId (User),
  students: [ObjectId],
  lessons: [{
    title: String,
    videoUrl: String,
    description: String,
    duration: Number
  }],
  reviews: [{
    userId: ObjectId,
    rating: 1-5,
    comment: String,
    createdAt: Date
  }],
  averageRating: Number,
  createdAt: Date
}
```

### Assignment
```javascript
{
  courseId: ObjectId,
  instructorId: ObjectId,
  title: String,
  description: String,
  dueDate: Date,
  questions: [{
    questionText: String,
    type: "mcq" | "text",
    options: [String],
    correctAnswer: String,
    marks: Number
  }],
  totalMarks: Number,
  createdAt: Date
}
```

## Performance Tips

1. **Use Database Indexes**
   - Indexes on frequently queried fields
   - Better query performance

2. **Pagination**
   - Implement for large datasets
   - Reduce response time

3. **Caching**
   - Cache course listings
   - Cache user profile data

4. **File Uploads**
   - Validate file types
   - Limit file sizes
   - Store in cloud (S3, etc.)

## Security Checklist

- [x] Passwords hashed with bcryptjs
- [x] JWT tokens for authentication
- [x] Role-based access control
- [x] Input validation
- [x] CORS protection
- [x] OTP expiry (5 minutes)
- [x] Environment variables for secrets
- [x] Secure file upload

## Next Steps

1. Start the frontend development server
2. Test API endpoints from frontend
3. Implement any custom features
4. Deploy to production

## Support

For issues:
1. Check .env configuration
2. Verify MongoDB connection
3. Check console logs
4. Review API response status codes
