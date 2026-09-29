# LearnHub — MERN Learning Management System

LearnHub is a full-stack Learning Management System. **Students** browse and enroll in courses and track progress, **instructors** create/edit/delete courses and upload lessons, and **admins** manage users and courses and view analytics. Access is secured with JWT authentication, bcrypt password hashing and role-based authorization.

## Technologies
- **Frontend:** React 18+ (Vite), React Router, Axios, Bootstrap / React Bootstrap, Context API
- **Backend:** Node.js, Express, Mongoose, JSON Web Tokens, bcryptjs, dotenv, cors, morgan
- **Database:** MongoDB

## Project structure
```
final-assesment/
├── backend/
│   ├── config/db.js            MongoDB connection
│   ├── models/                 User, Course (with embedded lessons), Enrollment
│   ├── controllers/            auth, course, enrollment, admin logic
│   ├── routes/                 REST route definitions
│   ├── middleware/             auth.js (protect/authorize), error.js
│   ├── tests/api.test.js       end-to-end API test (32 checks)
│   ├── seed.js                 demo data
│   └── server.js
└── frontend/
    └── src/
        ├── components/         NavBar, Footer, CourseCard, ProtectedRoute, Loader
        ├── pages/              Home, Courses, CourseDetail, Login, Register, 3 dashboards
        ├── services/api.js     Axios instance + service functions
        └── context/AuthContext.jsx
```

## Installation
Prerequisites: Node.js 18+, and MongoDB running locally (or a MongoDB Atlas connection string).

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env        # then edit MONGO_URI and JWT_SECRET
npm run seed                # optional: demo users and courses
npm run dev                 # API on http://localhost:5000

# 2. Frontend (new terminal)
cd frontend
npm install
npm run dev                 # app on http://localhost:5173 (proxies /api to :5000)
```

No MongoDB installed? Run the backend with `USE_MEMORY_DB=true` (set in `.env`) — it starts a temporary in-memory database pre-seeded with the demo data.

### Demo accounts (after `npm run seed`)
| Role | Email | Password |
|---|---|---|
| Admin | admin@learnhub.com | admin123 |
| Instructor | instructor@learnhub.com | instructor123 |
| Student | student@learnhub.com | student123 |

## Environment variables (`backend/.env`)
| Variable | Purpose |
|---|---|
| `PORT` | API port (default 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign tokens (never commit) |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `CLIENT_URL` | Allowed CORS origin |

## REST API
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/register` | Public (student / instructor) |
| POST | `/api/login` | Public |
| GET | `/api/me` | Logged in |
| GET | `/api/courses` (`?search=&category=`) | Public |
| GET | `/api/courses/:id` | Public |
| POST | `/api/courses` | Instructor, Admin |
| PUT | `/api/courses/:id` | Owner instructor, Admin |
| DELETE | `/api/courses/:id` | Owner instructor, Admin |
| GET | `/api/courses/mine` | Instructor, Admin |
| POST/DELETE | `/api/courses/:id/lessons[/:lessonId]` | Owner instructor, Admin |
| POST | `/api/enroll` | Student |
| GET | `/api/my-courses` | Student |
| PUT | `/api/enrollments/:id/progress` | Student |
| GET | `/api/admin/analytics`, `/api/admin/users` | Admin |
| PUT/DELETE | `/api/admin/users/:id` | Admin |

Send the token as `Authorization: Bearer <token>`.

## Role-based access
- **Backend:** `protect` middleware verifies the JWT; `authorize(...roles)` restricts routes. Instructors can only modify their own courses.
- **Frontend:** `ProtectedRoute` redirects anonymous users to login and shows "Access denied" for the wrong role.
- Public registration cannot create admins; admins promote users from the Admin dashboard.

## Testing
With the API running (seeded):
```bash
cd backend
npm test        # 32 checks: auth, validation, RBAC, course CRUD, enrollment, admin
```
Set `API_URL` to test a deployed instance.

## Deployment
```bash
cd frontend && npm run build          # creates frontend/dist
cd ../backend && NODE_ENV=production npm start
```
When `frontend/dist` exists, Express serves the React app and the API from one server/port, so it can be deployed as a single Node service (Render, Railway, etc.) with `MONGO_URI` (e.g. MongoDB Atlas) and `JWT_SECRET` set as environment variables. If the frontend is hosted separately, set `VITE_API_URL` to the API URL at build time and `CLIENT_URL` on the backend.
