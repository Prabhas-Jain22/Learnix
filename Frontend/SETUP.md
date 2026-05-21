# Frontend Setup Guide

## Prerequisites

- Node.js v14+ installed
- npm or yarn package manager
- Backend server running (http://localhost:5000)

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages:
- react: UI library
- react-dom: React DOM rendering
- react-router-dom: Routing
- axios: HTTP client
- framer-motion: Animations
- vite: Build tool

### 2. Configure Backend URL

The frontend is configured to use `http://localhost:5000` for API calls.

If your backend runs on a different URL, update all axios calls:

**Find and replace in all .jsx files:**
```javascript
// Change from:
axios.get("http://localhost:5000/api/...")

// To:
axios.get("http://your-backend-url/api/...")
```

Or create a constants file:
```javascript
// src/config.js
export const API_BASE_URL = process.env.VITE_API_URL || "http://localhost:5000";
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at: `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` folder.

## Project Structure

```
Frontend/
├── src/
│   ├── pages/              # Page components
│   │   ├── Home.jsx        # Course listing & browsing
│   │   ├── Auth.jsx        # Authentication choice
│   │   ├── Login.jsx       # Password login
│   │   ├── OTPLogin.jsx    # OTP login
│   │   ├── Register.jsx    # Registration
│   │   ├── Dashboard.jsx   # Student dashboard
│   │   ├── CourseDetail.jsx # Course view with videos
│   │   ├── Assignments.jsx # Course assignments
│   │   ├── Doubts.jsx      # Q&A forum
│   │   ├── Profile.jsx     # User profile
│   │   └── Admin.jsx       # Instructor panel
│   │
│   ├── components/         # Reusable components
│   │   ├── Navbar.jsx      # Navigation bar
│   │   ├── ProgressBar.jsx # Progress indicator
│   │   ├── RatingStars.jsx # Rating display
│   │   ├── RoleCard.jsx    # Role selection
│   │   └── Toast.jsx       # Notifications
│   │
│   ├── assets/            # Images & static files
│   ├── App.jsx            # Main app component with routes
│   ├── main.jsx           # React entry point
│   ├── App.css            # Global styles
│   └── index.css          # Base styles
│
├── public/                # Static files served as-is
├── vite.config.js         # Vite configuration
├── eslint.config.js       # ESLint rules
├── index.html             # HTML entry point
└── package.json           # Dependencies
```

## Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Component Documentation

### Navbar
- Responsive navigation
- User authentication status
- Quick links to main pages
- Logout functionality

### ProgressBar
- Circular progress indicator
- Shows percentage completion
- Color-coded based on progress

### Toast Notifications
- Success messages (green)
- Error messages (red)
- Auto-dismiss after 3 seconds

### RoleCard
- Role selection card
- Used in Auth page
- Visual role indicators

## Page Features

### Home Page
- Browse all available courses
- Search and filter courses
- Enroll in courses
- View course details

### Dashboard
- View enrolled courses
- Track progress
- Continue learning
- See completion stats

### Course Detail
- Watch video lessons
- Track lesson progress
- See course information
- Read reviews

### Assignments
- View course assignments
- Answer questions (MCQ & text)
- Submit assignments
- View scores

### Doubts
- Ask questions
- Answer other students' questions
- Get instructor replies
- Mark doubts as resolved

### Profile
- View user information
- Edit profile
- View enrolled courses
- See learning stats

### Admin (Instructor)
- Create courses
- Upload course thumbnail
- Add video lessons
- Create assignments
- Manage course content

## Authentication Flow

### OTP Login
```
1. Enter email → Send OTP
2. Check email for OTP
3. Enter OTP → Verify
4. Receive JWT token
5. Redirect to dashboard
```

### Password Login
```
1. Register with email & password
2. Password hashed on backend
3. Login with email & password
4. Receive JWT token
5. Redirect to dashboard
```

## Token Management

The JWT token is stored in localStorage:

```javascript
// Storing token
localStorage.setItem("token", tokenFromServer);
localStorage.setItem("role", userRole);

// Using token in API calls
const token = localStorage.getItem("token");
axios.get(url, {
  headers: { Authorization: token }
});

// Logout
localStorage.removeItem("token");
localStorage.removeItem("role");
```

## Common Issues & Solutions

### Backend API Not Reachable
```
Error: Cannot POST http://localhost:5000/api/auth/login
```
**Solution:**
- Verify backend is running on port 5000
- Check firewall settings
- Use correct API URL in code

### Token Expired Error
```
Error: Token expired. Please login again.
```
**Solution:**
- User needs to login again
- Clear localStorage and reload
- Check JWT_EXPIRY in backend .env

### CORS Error
```
Error: Access to XMLHttpRequest... has been blocked by CORS policy
```
**Solution:**
- Verify backend CORS is enabled
- Check origin in CORS settings
- Verify frontend URL is whitelisted

### Styles Not Loading
```
No styling appears on page
```
**Solution:**
- Check CSS file imports
- Verify CSS files exist
- Clear browser cache
- Restart dev server

## Browser DevTools Tips

### React DevTools
- Install React DevTools extension
- Inspect component state
- Debug props

### Network Tab
- Monitor API calls
- Check response status
- Verify payload

### Application Tab
- Check localStorage for token
- Verify role is set correctly
- Clear cache if needed

## Performance Optimization

1. **Code Splitting**
   - Lazy load pages with React.lazy()
   - Load components on demand

2. **Image Optimization**
   - Use placeholder images
   - Load images on demand
   - Compress images

3. **Bundle Size**
   - Analyze with `npm run build`
   - Use production build
   - Remove unused dependencies

## Responsive Design

The application is responsive for:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (< 768px)

## Accessibility Features

- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Color contrast compliance

## Environment Variables

Create `.env.local` file:

```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=Learnix
```

Access in code:
```javascript
const apiUrl = import.meta.env.VITE_API_URL;
```

## Deployment

### Vercel
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Upload dist folder to Netlify
```

### Traditional Server
```bash
npm run build
# Copy dist folder to web server
```

## Troubleshooting Checklist

- [ ] Backend running on port 5000
- [ ] MongoDB connected
- [ ] .env file configured
- [ ] Email service working
- [ ] npm dependencies installed
- [ ] No TypeScript errors
- [ ] console.log showing expected values
- [ ] Network tab shows 200 responses

## Development Workflow

1. Start backend: `npm start` in Backend folder
2. Start frontend: `npm run dev` in Frontend folder
3. Open http://localhost:5173
4. Use browser DevTools to debug
5. Check console for errors
6. Verify API responses in Network tab

## Code Style

- Use functional components
- Use React hooks (useState, useEffect)
- Follow consistent naming conventions
- Add comments for complex logic
- Keep components reusable

## Next Steps

1. Verify all pages load correctly
2. Test authentication flows
3. Test API integration
4. Verify responsive design
5. Check performance
6. Deploy to production

## Support

For issues:
1. Check browser console
2. Check Network tab
3. Verify backend is running
4. Check localStorage for token
5. Clear cache and try again
