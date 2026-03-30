<div align="center">

<br />

# 🎓 StudySync

### Personalized EdTech Platform for Nigerian Learners

A backend API powering curated learning paths, lecturer course management, and an AI study assistant — built for Nigerian university students and early-career professionals.

<br />

![Node.js](https://img.shields.io/badge/Node.js-20_LTS-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas_M0-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7.x-DC382D?style=flat-square&logo=redis&logoColor=white)
![Render](https://img.shields.io/badge/Deployed_on-Render-46E3B7?style=flat-square&logo=render&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)
![Status](https://img.shields.io/badge/Status-MVP_Build-orange?style=flat-square)

<br />

[Features](#-features) · [Architecture](#-architecture) · [Getting Started](#-getting-started) · [API Reference](#-api-reference) · [Folder Structure](#-folder-structure) · [Environment Variables](#-environment-variables) · [Deployment](#-deployment) · [Team](#-team)

<br />

</div>

---

## 📌 Overview

**StudySync** is an EdTech platform designed to solve a specific problem: Nigerian university students and early-career professionals struggle to complete online courses due to unstable internet, lack of accountability, and information overload from too many choices.

The platform addresses this with:

- **AI-generated personalized learning paths** — learners don't choose blindly; an AI curates a structured course sequence based on their level and goals
- **Distraction-free focus mode** — blocks interruptions during study sessions
- **Progress tracking and streak accountability** — keeps learners moving forward
- **Internet-optimized content** — course materials designed for variable connectivity
- **An AI study assistant (Pola)** — a role-gated chatbot that answers course questions, gives study tips, and helps learners navigate the platform

There are two user-facing portals:

| Portal | Who it's for | What they can do |
|---|---|---|
| **Learner Portal** | Students / early-career professionals | Browse courses, enroll, get an AI learning path, track progress, use focus mode, chat with Pola |
| **Lecturer Portal** | Course instructors | Upload and manage courses, view enrolled students, receive notifications |

> **Admin functions** (course approval, user management) are handled directly via the MongoDB Atlas dashboard during the MVP. A full admin portal is scoped for v2.

---

## ✨ Features

### For Learners
- ✅ Self-registration and onboarding (captures course interest, learning intent, and current level)
- ✅ AI-generated personalized learning path (powered by Claude API, delivered asynchronously)
- ✅ Course catalog browsing with search and filters (by level, tag, category)
- ✅ Course enrollment and module tracking
- ✅ Progress logging — track completed modules and percentage completion
- ✅ Daily streak tracking with last-activity timestamps
- ✅ Distraction-free focus mode with configurable session timers
- ✅ AI chatbot (Pola) for study tips, course Q&A, and platform navigation help

### For Lecturers
- ✅ Invitation-based account creation (no public self-registration for lecturers)
- ✅ Full course management — create, edit, delete courses and individual modules
- ✅ Course submission workflow — submit for admin approval before going live
- ✅ Student visibility — see who enrolled and track their progress per course
- ✅ In-app and email notifications — course approved/rejected, student completions, deadline alerts

### Platform
- ✅ JWT-based authentication with refresh tokens
- ✅ Role-based access control (RBAC) — learner, lecturer, admin
- ✅ Rate limiting on all endpoints (Redis-backed)
- ✅ Async job queue (BullMQ) for AI path generation and email notifications
- ✅ Daily cron job for deadline reminders
- ✅ Standardised API response envelope across all endpoints

---

## 🏗 Architecture

```
Client (Web / Mobile)
        │
        ▼
  API Gateway + Auth Middleware (JWT · RBAC)
        │
  ┌─────┴──────────────────────────────────────┐
  │                                            │
  ▼                                            ▼
Learner Module          Lecturer Module
  ├── Onboarding          ├── Course CRUD
  ├── Course browsing     ├── Module management
  ├── Enrollment          ├── Student visibility
  ├── Progress            └── Notifications
  ├── Focus mode
  └── AI Chatbot (Pola)
        │
        ▼
  AI Services (Claude API)
  ├── Path Generation (async via BullMQ)
  └── Chatbot (real-time with session history)
        │
        ▼
  Data Layer
  ├── MongoDB Atlas    — users, courses, paths, progress, chat sessions
  └── Redis            — focus mode sessions, rate limiting, job queue

  Background Layer
  ├── BullMQ Workers   — path generation, email notifications
  └── Cron Scheduler   — daily deadline checks
```

### Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Runtime | Node.js 20 LTS | Stable, widely supported, great async performance |
| Framework | Express.js | Lightweight, flexible, familiar to the team |
| Primary DB | MongoDB Atlas (M0 free) | Flexible schema for profiles, paths, chat history |
| Cache / Queue | Redis (Render free) | Focus mode TTL, rate limiting, BullMQ job queue |
| AI | Claude API (Anthropic) | Path generation + chatbot (Pola) |
| Email | Resend | Simple API, 100 emails/day free tier |
| File Storage | Cloudinary | Course media uploads, 25 GB free tier |
| Deployment | Render | Free web service + Redis instance |
| Frontend Deploy | Vercel | Free Hobby plan for the frontend team |

---

## 🚀 Getting Started

### Prerequisites

- Node.js v20 or higher
- A MongoDB Atlas account (free M0 cluster)
- A Redis instance (use Render's free Redis or a local instance)
- An Anthropic API key (for the AI chatbot and path generation)
- A Resend account (for emails)

### 1. Clone the repository

```bash
git clone https://github.com/JeedyWhyte/Capstone-Project.git
cd backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your values. See [Environment Variables](#-environment-variables) for the full list.

### 4. Seed the first admin account

```bash
node scripts/create-admin.js
```

This creates the first admin user using `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` from your `.env`. **Delete these two variables from `.env` after running this once.**

### 5. Start the development server

```bash
npm run dev
```

The server starts on `http://localhost:5000`. The `/health` endpoint confirms it is running:

```bash
curl http://localhost:5000/health
# → { "status": "ok", "ts": "2026-03-17T..." }
```

### 6. (Optional) Add a lecturer account

```bash
node scripts/create-lecturer.js --name "Dr. Ada Obi" --email "ada@univ.edu.ng"
```

This creates the lecturer account, generates an invite link, and sends it to their email address.

---

## 📁 Folder Structure

```
src/
├── app.js                        # Express app setup and route mounting
├── server.js                     # HTTP server entry point
│
├── config/
│   ├── db.js                     # Mongoose connection to MongoDB Atlas
│   ├── redis.js                  # Redis client setup
│   └── env.js                    # Validates all required env vars on startup
│
├── middleware/
│   ├── auth.js                   # authenticate + requireRole middleware
│   ├── rateLimiter.js            # Per-IP rate limiting (Redis-backed)
│   ├── validate.js               # Request body validation (Zod)
│   └── errorHandler.js           # Global error handler
│
├── models/                       # Mongoose schemas
│   ├── user.model.js
│   ├── course.model.js
│   ├── enrollment.model.js
│   ├── progress.model.js
│   ├── path.model.js
│   ├── notification.model.js
│   └── chatSession.model.js
│
├── modules/
│   ├── auth/                     # Shared auth (both roles)
│   ├── learner/                  # Learner portal features
│   ├── lecturer/                 # Lecturer portal features
│   ├── courses/                  # Shared course catalog logic
│   ├── chatbot/                  # AI chatbot (Pola)
│   ├── paths/                    # AI learning path engine
│   ├── progress/                 # Progress tracking and streaks
│   ├── focus/                    # Focus mode (Redis TTL sessions)
│   └── notifications/            # In-app and email notifications
│
├── jobs/
│   ├── queues.js                 # BullMQ queue definitions
│   ├── workers/
│   │   ├── pathGeneration.worker.js
│   │   └── notification.worker.js
│   └── schedulers/
│       └── deadlineCheck.js      # Daily cron for deadline reminders
│
├── scripts/
│   ├── create-admin.js           # One-time admin seed script
│   ├── create-lecturer.js        # CLI: invite a new lecturer
│   └── seed-courses.js           # CLI: seed test course data
│
└── utils/
    ├── jwt.js                    # Sign / verify JWT helpers
    ├── hash.js                   # bcrypt wrappers
    ├── response.js               # Standard API response envelope
    └── logger.js                 # Structured logger (Winston)

tests/
├── unit/                         # Unit tests per service
└── integration/                  # Integration tests per route group
```

---

## 📡 API Reference

**Base URL:** `https://api.StudySync.com`  
**Local:** `http://localhost:5000`  
**All routes prefixed with:** `/api`

### Authentication

All protected routes require a `Bearer` token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

Tokens expire in 15 minutes. Use `POST /api/auth/refresh-token` with your refresh token to get a new one.

---

### Auth Routes — Public

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Learner self-registration |
| `POST` | `/api/auth/login` | Login — returns JWT + refresh token |
| `POST` | `/api/auth/refresh-token` | Exchange refresh token for new JWT |
| `POST` | `/api/auth/logout` | Invalidate refresh token |
| `POST` | `/api/auth/set-password` | Lecturer sets password from invite link |
| `POST` | `/api/auth/forgot-password` | Request password reset email |
| `POST` | `/api/auth/reset-password` | Reset password using emailed token |

**Register a new learner**

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Temi Okafor",
  "email": "temi@example.com",
  "password": "securepassword123"
}
```

```json
// 201 Created
{
  "success": true,
  "message": "Account created. Please complete onboarding.",
  "data": {
    "userId": "64f1a...",
    "token": "<jwt>",
    "refreshToken": "<refresh_jwt>"
  }
}
```

---

### Learner Routes — `role: learner` required

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/learner/onboard` | Submit onboarding — triggers AI path generation |
| `GET` | `/api/learner/profile` | Get own profile |
| `PATCH` | `/api/learner/profile` | Update own profile |
| `GET` | `/api/courses` | Browse approved course catalog |
| `GET` | `/api/courses/:id` | View a course with full module list |
| `GET` | `/api/courses/search` | Search courses by title, level, or tag |
| `POST` | `/api/courses/:id/enroll` | Enroll in a course |
| `GET` | `/api/learner/enrollments` | List my enrolled courses |
| `GET` | `/api/learner/path` | Get my AI-generated learning path |
| `PATCH` | `/api/learner/path/stage/:stageId` | Mark a path stage complete |
| `POST` | `/api/learner/progress/log` | Log a completed module |
| `GET` | `/api/learner/progress` | Full progress summary |
| `GET` | `/api/learner/progress/streak` | Current streak + last activity |
| `GET` | `/api/learner/progress/:courseId` | Progress for one course |
| `POST` | `/api/focus/start` | Start a focus session |
| `POST` | `/api/focus/end` | End a focus session early |
| `GET` | `/api/focus/status` | Check active session and time remaining |

**Onboard a learner** *(triggers async AI path generation)*

```http
POST /api/learner/onboard
Authorization: Bearer <token>
Content-Type: application/json

{
  "course": "Data Science",
  "learningIntent": "career switch",
  "currentLevel": "beginner"
}
```

```json
// 202 Accepted — path generation is async
{
  "success": true,
  "message": "Onboarding received. Your learning path is being generated.",
  "data": { "status": "generating" }
}
```

> Poll `GET /api/learner/path` until `status` changes from `"generating"` to `"ready"`.

---

### Chatbot Routes (Pola) — `role: learner` required

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/chatbot/message` | Send a message — returns Pola's reply |
| `POST` | `/api/chatbot/new-session` | Start a fresh conversation |
| `GET` | `/api/chatbot/history` | Get message history for current session |
| `GET` | `/api/chatbot/sessions` | List past sessions |

**Send a message to Pola**

```http
POST /api/chatbot/message
Authorization: Bearer <token>
Content-Type: application/json

{
  "sessionId": "sess_abc123",
  "message": "Can you give me study tips for staying focused on Python?"
}
```

```json
// 200 OK
{
  "success": true,
  "data": {
    "sessionId": "sess_abc123",
    "reply": "Great question! Here are three tips that work well for Python learners..."
  }
}
```

> Pola is scoped to three areas: study tips & motivation, course-related Q&A, and platform navigation. She will politely redirect off-topic requests.

---

### Lecturer Routes — `role: lecturer` required

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/lecturer/profile` | Get own profile |
| `PATCH` | `/api/lecturer/profile` | Update own profile |
| `GET` | `/api/lecturer/courses` | List my courses + approval status |
| `POST` | `/api/lecturer/courses` | Create a new course (status: draft) |
| `GET` | `/api/lecturer/courses/:id` | View one of my courses |
| `PATCH` | `/api/lecturer/courses/:id` | Edit a course I own |
| `DELETE` | `/api/lecturer/courses/:id` | Delete a draft course |
| `POST` | `/api/lecturer/courses/:id/modules` | Add a module |
| `PATCH` | `/api/lecturer/courses/:id/modules/:mId` | Edit a module |
| `DELETE` | `/api/lecturer/courses/:id/modules/:mId` | Remove a module |
| `POST` | `/api/lecturer/courses/:id/submit` | Submit course for admin approval |
| `GET` | `/api/lecturer/courses/:id/students` | View enrolled students |
| `GET` | `/api/lecturer/courses/:id/progress` | Student completion stats |
| `GET` | `/api/notifications` | List my notifications |
| `PATCH` | `/api/notifications/:id/read` | Mark a notification read |
| `PATCH` | `/api/notifications/read-all` | Mark all notifications read |

**Course approval workflow**

```
Lecturer creates course  →  status: "draft"
Lecturer submits course  →  status: "pending"
Admin approves           →  status: "approved"  →  visible to learners
Admin rejects            →  status: "rejected"  +  rejectionReason
```

---

### Standard Response Format

Every endpoint returns the same envelope:

```json
// Success
{
  "success": true,
  "message": "Optional message",
  "data": { }
}

// Error
{
  "success": false,
  "message": "Human-readable error",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [ ]
  }
}
```

---

## 🔐 Environment Variables

Copy `.env.example` to `.env` and fill in your values. **Never commit `.env` to version control.**

```env
# Server
PORT=5000
NODE_ENV=development
APP_URL=https://your-app.onrender.com

# MongoDB Atlas — M0 free cluster
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/StudySync

# Redis — Render free instance
REDIS_URL=redis://red-xxxxxxxxxxxxxxxx:6379

# JWT
JWT_SECRET=<long-random-string-min-32-chars>
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=<different-long-random-string>
REFRESH_TOKEN_EXPIRES_IN=7d
INVITE_TOKEN_EXPIRES_IN=48h

# Claude API — chatbot + AI path generation
ANTHROPIC_API_KEY=sk-ant-...
CHATBOT_MODEL=claude-haiku-4-5-20251001
PATH_GEN_MODEL=claude-haiku-4-5-20251001

# Email — Resend (free: 100 emails/day)
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@StudySync.com

# File storage — Cloudinary (free: 25 GB)
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# Admin seed — remove from .env after running create-admin.js once
SEED_ADMIN_EMAIL=admin@StudySync.com
SEED_ADMIN_PASSWORD=change_me_immediately
```

---

## ☁️ Deployment

### Deploying to Render (Free Tier)

1. Push your repo to GitHub
2. Go to [render.com](https://render.com) → **New Web Service** → connect your GitHub repo
3. Set the build command: `npm install`
4. Set the start command: `node src/server.js`
5. Add all environment variables from your `.env` under **Environment**
6. Create a free **Redis** instance on Render and copy the URL into `REDIS_URL`
7. Deploy

**Prevent cold starts (important on free tier)**

Render's free tier spins down your server after 15 minutes of inactivity. The fix is free:

1. Sign up at [uptimerobot.com](https://uptimerobot.com)
2. Add a new monitor → **HTTP(S)** → paste your Render URL + `/health`
3. Set the check interval to **5 minutes**
4. Save — your server will stay permanently awake

### Environment Notes

| Service | Free Tier Limit | Notes |
|---|---|---|
| Render Web Service | 750 hrs/month | Enough for 24/7 with no overages |
| MongoDB Atlas M0 | 512 MB storage | Sufficient for early users |
| Redis (Render) | 25 MB | Enough for sessions + queue |
| Resend | 100 emails/day | Sufficient for MVP |
| Cloudinary | 25 GB storage | Sufficient for MVP |
| Claude API | Pay-as-you-go | ~$0.003/message (Haiku model) |

---

## 🧪 Running Tests

```bash
# Run all tests
npm test

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Watch mode during development
npm run test:watch
```

Integration tests require a running MongoDB instance. The test suite uses a separate `StudySync_test` database and cleans up after each run.

---

## 📜 Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start server with hot reload (nodemon) |
| `npm start` | Start server in production mode |
| `npm test` | Run all tests |
| `node scripts/create-admin.js` | Seed the first admin account |
| `node scripts/create-lecturer.js --name "..." --email "..."` | Invite a new lecturer |
| `node scripts/seed-courses.js` | Seed test course data |

---

## 📐 Data Models

### User
| Field | Type | Notes |
|---|---|---|
| `name` | String | Required |
| `email` | String | Unique, indexed |
| `role` | Enum | `learner` · `lecturer` · `admin` |
| `status` | Enum | `active` · `invited` · `suspended` |
| `onboarding` | Object | Learner only — course, intent, level |
| `inviteToken` | String | Lecturer only — one-time token |

### Course
| Field | Type | Notes |
|---|---|---|
| `title` | String | Required |
| `level` | Enum | `beginner` · `intermediate` · `advanced` |
| `status` | Enum | `draft` · `pending` · `approved` · `rejected` |
| `createdBy` | ObjectId | Ref: User (lecturer) |
| `modules` | Array | `{ title, durationMins, resourceUrl }` |
| `enrollmentCount` | Number | Denormalised — incremented on enroll |

### LearningPath
| Field | Type | Notes |
|---|---|---|
| `userId` | ObjectId | Ref: User |
| `status` | Enum | `generating` · `ready` · `failed` |
| `stages` | Array | `{ order, courseId, status, deadline }` |
| `stage.status` | Enum | `locked` · `active` · `completed` |

### ChatSession
| Field | Type | Notes |
|---|---|---|
| `userId` | ObjectId | Learner only |
| `history` | Array | `{ role, content, timestamp }` |
| `active` | Boolean | Whether this is the current session |

> The API sends only the last 20 messages to Claude per request to control token usage and cost.

---

## 🤝 Contributing

This is a private repository for the StudySync engineering team. Branch and commit conventions:

**Branches**
```
feature/<ticket-id>-short-description    e.g. feature/12-chatbot-session-endpoint
fix/<ticket-id>-short-description        e.g. fix/18-streak-timezone-bug
chore/<description>                      e.g. chore/update-dependencies
```

**Commits** — follow [Conventional Commits](https://www.conventionalcommits.org/):
```
feat: add focus mode start endpoint
fix: correct streak calculation across midnight boundary
chore: upgrade mongoose to 8.x
docs: update API reference with chatbot routes
test: add integration tests for learner enrollment
```

**Pull Requests**
- Every PR requires at least one reviewer before merging
- PRs must pass all tests before review
- Keep PRs focused — one feature or fix per PR

---

## 👥 Team

**| Name |**

| [Bryan Jerry-Bassey](https://github.com/JeedyWhyte) |
| [Bethel Onyealilach](https://github.com/B-got-banned) |
| [Lucky Abigail Atuhaire](https://github.com/laatuhaire) |

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

<div align="center">

Built with purpose for Nigerian learners · StudySync © 2026

</div>
