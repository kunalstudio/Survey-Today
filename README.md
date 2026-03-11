# SurveyOS — Full MERN Stack Survey Platform

## Project Structure

```
survey-mern/
├── backend/                        # Node.js + Express API
│   ├── config/
│   │   └── db.js                   # MongoDB connection
│   ├── controllers/
│   │   ├── auth.controller.js      # register, login, logout, forgot/reset password
│   │   ├── survey.controller.js    # full CRUD + questions + publish/close
│   │   ├── response.controller.js  # start, save, submit, list responses
│   │   └── analytics.controller.js # summary, per-question stats, CSV export
│   ├── middleware/
│   │   ├── AppError.js             # Custom error class
│   │   ├── auth.middleware.js      # protect, optionalAuth, authorize(roles)
│   │   ├── errorHandler.js         # Global error handler
│   │   └── notFound.js             # 404 handler
│   ├── models/
│   │   ├── User.model.js           # Users with bcrypt password hashing
│   │   ├── Survey.model.js         # Surveys with embedded questions
│   │   └── Response.model.js       # Responses with answers array
│   ├── routes/
│   │   ├── auth.routes.js          # /api/auth/*
│   │   ├── user.routes.js          # /api/users/*
│   │   ├── survey.routes.js        # /api/surveys/*
│   │   ├── response.routes.js      # /api/surveys/:id/responses/*
│   │   └── analytics.routes.js     # /api/surveys/:id/analytics/*
│   ├── utils/
│   │   ├── jwt.utils.js            # Token generation and verification
│   │   └── email.utils.js          # Nodemailer email helpers
│   ├── tests/
│   │   └── auth.test.js            # Jest + Supertest tests
│   ├── .env.example                # Environment variable template
│   ├── package.json
│   └── server.js                   # Entry point
│
└── frontend/                       # React app
    └── src/
        ├── api/
        │   └── index.js            # Axios client + all API calls
        ├── context/
        │   └── AuthContext.js      # Global auth state (React Context)
        ├── hooks/
        │   └── index.js            # useSurveys, useSurvey, useAnalytics, useSurveyResponse
        ├── components/
        │   └── layout/
        │       └── MainLayout.js   # Sidebar + Outlet for private pages
        ├── pages/
        │   ├── LandingPage.js
        │   ├── LoginPage.js
        │   ├── RegisterPage.js
        │   ├── DashboardPage.js
        │   ├── SurveysListPage.js
        │   ├── CreateSurveyPage.js
        │   ├── SurveyBuilderPage.js
        │   ├── SurveyDetailPage.js
        │   ├── TakeSurveyPage.js   # Public survey taking with all question types
        │   ├── AnalyticsPage.js
        │   ├── SurveyResponsesPage.js
        │   ├── ExplorePage.js
        │   ├── ProfilePage.js
        │   └── NotFoundPage.js
        └── App.js                  # All routes + PrivateRoute + PublicOnlyRoute
```

---

## Quick Start

### Prerequisites
- Node.js v20+
- MongoDB Atlas account (free) OR local MongoDB

### 1. Clone and install

```bash
git clone <your-repo>
cd survey-mern

# Install backend
cd backend && npm install

# Install frontend
cd ../frontend && npm install
```

### 2. Configure environment

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secrets, and email credentials
```

### 3. Run in development

```bash
# Terminal 1 — Backend (http://localhost:5000)
cd backend && npm run dev

# Terminal 2 — Frontend (http://localhost:3000)
cd frontend && npm start
```

---

## API Endpoints Reference

### Auth — /api/auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /register | No | Create account |
| POST | /login | No | Login, get tokens |
| POST | /logout | Yes | Invalidate refresh token |
| POST | /refresh | No | Get new access token |
| POST | /forgot-password | No | Send reset email |
| POST | /reset-password | No | Set new password |
| GET | /me | Yes | Get current user |

### Surveys — /api/surveys
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | / | Optional | List surveys |
| POST | / | Yes | Create survey |
| GET | /:id | Optional | Get survey |
| PUT | /:id | Yes | Update survey |
| DELETE | /:id | Yes | Delete survey + responses |
| PATCH | /:id/publish | Yes | Publish draft |
| PATCH | /:id/close | Yes | Close survey |
| POST | /:id/duplicate | Yes | Clone as draft |
| POST | /:id/questions | Yes | Add question |
| PUT | /:id/questions/:qid | Yes | Update question |
| DELETE | /:id/questions/:qid | Yes | Delete question |
| PATCH | /:id/questions/reorder | Yes | Reorder questions |

### Responses — /api/surveys/:surveyId/responses
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /start | Optional | Begin response session |
| PATCH | /:responseId/answers | Token | Autosave answers |
| POST | /:responseId/submit | Token | Final submit |
| GET | / | Yes (owner) | List all responses |
| DELETE | /:responseId | Yes (owner) | Delete response |

### Analytics — /api/surveys/:surveyId/analytics
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /summary | Yes (owner) | Overview stats |
| GET | /questions | Yes (owner) | Per-question aggregates |
| GET | /export | Yes (owner) | Download CSV |

---

## Deployment

### Option A — Free Tier (Recommended for learning)

**MongoDB Atlas** (database)
1. Create free account at mongodb.com/cloud/atlas
2. Create cluster → Get connection string → Add to backend .env

**Render.com** (backend)
1. Connect GitHub repo
2. Set Root Directory: `backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add all .env variables in Environment tab

**Vercel** (frontend)
1. Connect GitHub repo
2. Set Root Directory: `frontend`
3. Add env variable: `REACT_APP_API_URL=https://your-render-app.onrender.com/api`
4. Deploy

### Option B — Single Server (VPS like DigitalOcean)

```bash
# Build frontend
cd frontend && npm run build

# Serve built frontend from Express (add to server.js)
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../frontend/build/index.html')));
```

Then deploy `backend/` + `frontend/build/` to your server with PM2:

```bash
npm install -g pm2
pm2 start server.js --name surveyos
pm2 startup && pm2 save
```

---

## Question Types Supported

| Type | Description |
|------|-------------|
| multiple_choice | Single select from options |
| checkbox | Multi-select from options |
| short_text | Single line text input |
| long_text | Multi-line textarea |
| scale | Numeric scale (e.g. 1-10) |
| rating | Star/number rating |
| yes_no | Binary yes/no |
| date | Date picker |
| dropdown | Dropdown select |

---

## Security Features

- Passwords hashed with bcrypt (12 rounds)
- JWT access tokens (7d) + refresh tokens (30d)
- Refresh token stored in DB for invalidation on logout
- Helmet for secure HTTP headers
- CORS restricted to frontend origin
- Rate limiting: 100 req/15min globally, 10 req/hr on auth routes
- Input sanitization via Mongoose validators
- Optional anonymous responses via session tokens

---

## Running Tests

```bash
cd backend
npm test
```
