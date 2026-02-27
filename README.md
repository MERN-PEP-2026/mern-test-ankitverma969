# Student Course Management System

Full-stack course management application with:
- JWT authentication (register/login)
- Course CRUD + pin/unpin + filters
- Dashboard analytics and recent activity
- Client-side activity timeline
- Backend security/device activity logs

## Tech Stack

### Frontend
- React 18
- React Router DOM 6
- Axios
- Vite

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT (`jsonwebtoken`)
- Password hashing (`bcryptjs`)
- CORS + dotenv

## Project Structure

```text
.
|-- backend/
|   |-- config/
|   |   `-- db.js
|   |-- controllers/
|   |   |-- activityController.js
|   |   |-- authController.js
|   |   `-- courseController.js
|   |-- middleware/
|   |   |-- activityLogger.js
|   |   `-- authMiddleware.js
|   |-- models/
|   |   |-- ActivityLog.js
|   |   |-- Course.js
|   |   `-- Student.js
|   |-- routes/
|   |   |-- activityRoutes.js
|   |   |-- authRoutes.js
|   |   `-- courseRoutes.js
|   |-- services/
|   |   `-- activityLogService.js
|   |-- .env.example
|   `-- server.js
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |-- constants/
|   |   |-- pages/
|   |   |-- services/
|   |   |-- styles/
|   |   `-- utils/
|   |-- .env.example
|   `-- vite.config.js
`-- README.md
```

## Features

- Auth:
  - Register and login
  - JWT stored in `localStorage` as `token`
  - Protected frontend routes via `ProtectedRoute`
- Dashboard:
  - Create course form with local draft persistence
  - 7-day trend chart
  - Latest courses preview
  - Local activity preview
  - Backend security/device log preview
- Courses page:
  - Search + filters (`instructor`, `pinned`, `status`)
  - Edit, delete, and pin/unpin
  - Sorted by pinned -> active -> latest created
- Activity Log page:
  - Reads local activity history from `localStorage`
  - Tabs (all/course/system), export CSV
- Security Logs page:
  - Reads backend activity logs (`/api/activity/me`)
  - Displays browser/OS/network/request metadata

## Environment Variables

### Backend (`backend/.env`)

Use `backend/.env.example`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/student_course_db
JWT_SECRET=replace_with_a_strong_secret
FRONTEND_ORIGINS=http://localhost:5173,http://localhost:5174
```

### Frontend (`frontend/.env`)

Use `frontend/.env.example`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Local Setup

### 1. Clone and install dependencies

```bash
git clone <your-repo-url>
cd Testclass
```

```bash
cd backend
npm install
```

```bash
cd ../frontend
npm install
```

### 2. Configure environment files

- Create `backend/.env` from `backend/.env.example`
- Create `frontend/.env` from `frontend/.env.example`

### 3. Run the app

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173`.

## Available Scripts

### Backend
- `npm run dev` - Run with nodemon
- `npm start` - Run with node

### Frontend
- `npm run dev` - Vite dev server
- `npm run build` - Production build
- `npm run preview` - Preview production build

## API Reference

Base URL: `http://localhost:5000/api`

### Auth
- `POST /auth/register`
- `POST /auth/login`

### Courses (protected)
- `POST /courses` - Create course
- `GET /courses` - List courses with optional query:
  - `search`
  - `instructor`
  - `pinned` (`true|false`)
  - `status` (`active|expired`)
- `PUT /courses/:id` - Update course
- `PATCH /courses/:id/pin` - Toggle pin
- `DELETE /courses/:id` - Delete course

### Activity (protected)
- `GET /activity/me?limit=20` - Get current user's activity logs (1-100)

## Auth and Request Flow

- Login/register returns JWT.
- Frontend stores token in `localStorage`.
- Axios interceptor sends `Authorization: Bearer <token>`.
- Backend `authMiddleware` validates JWT for protected routes.

## Activity Logging Details

Backend activity logger captures:
- HTTP method, path, status code, latency
- API address + IP normalization
- Browser, OS, device type from user-agent
- Network hints via request headers (`X-Network-*`)

Notes:
- `/api/activity/me` is excluded from logging to avoid recursive log entries.
- Auth success events are explicitly logged as:
  - `AUTH_REGISTER_SUCCESS`
  - `AUTH_LOGIN_SUCCESS`

## Frontend Route Map

- `/login`
- `/register`
- `/dashboard` (protected)
- `/courses` (protected)
- `/activity-log` (protected)
- `/security-logs` (protected)

## Storage Keys Used

- `token` - auth token
- `courseActivityLog` - client-side activity timeline
- `lastViewedCourse` - resume context on dashboard
- `courseDraft` - unsent course form draft

## CORS Behavior

Backend allows:
- Configured `FRONTEND_ORIGINS`
- `http://localhost:5173`, `http://localhost:5174`
- Any localhost port matching `http://localhost:<port>`
- Non-browser clients without `Origin` header

## Current Limitations

- Courses are global in the database and not scoped to a user.
- No refresh token/session invalidation flow.
- No automated test suite configured yet.
- Social auth buttons are UI-only.

## Build Verification

Frontend builds successfully with:

```bash
cd frontend
npm run build
```

## License

No license file is currently included. Add a `LICENSE` file before publishing if needed.