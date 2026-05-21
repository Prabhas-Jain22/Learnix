const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '..', 'README.md');
const content = `# Learnix

Learnix is a modern learning platform that empowers students and instructors to connect, learn, and collaborate online. The application includes course management, video lessons, assignments, doubts, progress tracking, and AI-powered study assistance.

## Features

- Student and instructor role-based access
- Course browsing, enrollment, and video lessons
- Assignment creation, submission, and review
- Doubt forum with instructor replies
- Progress tracking and course completion indicators
- Profile management and authenticated access
- OTP and password login flows
- AI study assistant powered by Gemini
- File uploads for course content and thumbnails

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT authentication
- Nodemailer for OTP email
- Multer for file uploads
- CORS support

### Frontend
- React 19
- Vite
- Axios
- React Router v7
- Framer Motion
- CSS styling

## Installation

### 1. Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file from the example template:

```bash
cp .env.example .env
```

Set the following variables in `Backend/.env`:

```
MONGO_URI=
JWT_SECRET=
JWT_EXPIRY=1h
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_SERVICE=gmail
PORT=5000
NODE_ENV=development
GEMINI_API_KEY=
FRONTEND_URL=
```

Start the backend:

```bash
npm start
```

### 2. Frontend Setup

```bash
cd Frontend
npm install
```

Create a `.env` file from the example template:

```bash
cp .env.example .env
```

Set the following variable in `Frontend/.env`:

```
VITE_API_URL=
```

Start the frontend:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Environment Variables

### Backend
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT signing
- `JWT_EXPIRY` - Token expiration (example: 1h)
- `EMAIL_USER` - SMTP email sender
- `EMAIL_PASSWORD` - SMTP email password
- `EMAIL_SERVICE` - SMTP provider (gmail)
- `PORT` - Backend port
- `NODE_ENV` - Environment mode
- `GEMINI_API_KEY` - Gemini API key for AI assistant
- `FRONTEND_URL` - Allowed origin for CORS in production

### Frontend
- `VITE_API_URL` - Backend API base URL

## Deployment

### Render Backend
1. Create a new Web Service on Render.
2. Connect the repository and point the root to `Backend`.
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables from `Backend/.env.example`.
6. Deploy.

### Render Frontend
1. Create a new Static Site on Render.
2. Connect the repository and point the root to `Frontend`.
3. Set build command: `npm install && npm run build`
4. Set publish directory: `dist`
5. Add `VITE_API_URL` to point to the deployed backend URL.
6. Deploy.

## Screenshots

Add screenshots to this section after deployment:
- Homepage
- Dashboard
- Course detail page
- Admin course creation
- AI assistant

## Project Structure

```
Backend/
  server.js
  controllers/
  models/
  routes/
  middleware/
  uploads/
  .env.example
Frontend/
  src/
  public/
  vite.config.js
  .env.example
.gitignore
render.yaml
README.md
```

## GitHub Push Commands

```bash
git add .
git commit -m "Rename project to Learnix and prepare deployment"
git push origin main
```

## Render Setup Commands

```bash
# Backend
cd Backend
npm install
npm start

# Frontend
cd Frontend
npm install
npm run build
```
`;
fs.writeFileSync(filePath, content, 'utf8');
console.log('README.md updated');
