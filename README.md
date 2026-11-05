# MERN Stack Task Management System

A task manager built with **MongoDB Atlas, Express.js, React and Node.js**.
Students can register, log in and manage tasks (title, description, priority, due date, status).
A dashboard summarises progress, and administrators can manage user accounts.

## Features
- Register / login with bcrypt password hashing and JWT authentication
- Full CRUD for tasks, plus a task details page
- Dashboard: totals, completion rate, overdue and high-priority counts, upcoming deadlines
- Search, filters (status, priority, deadline), sorting and pagination
- Role-based access: `admin` can list, edit and delete users (`/admin/users`)
- Form validation, loading spinners, feedback messages, responsive Bootstrap UI

## Folder structure
```
server/   Express API (routes, controllers, models, middleware)
client/   React app (Vite, React Router, Axios, Bootstrap)
```

## Run locally

### 1. API
```bash
cd server
cp .env.example .env      # then fill in MONGO_URI and JWT_SECRET
npm install
npm run dev               # http://localhost:5000
```

### 2. React app
```bash
cd client
cp .env.example .env      # VITE_API_URL=http://localhost:5000
npm install
npm run dev               # http://localhost:5173
```

### 3. Make an admin
Register a normal account in the app, then:
```bash
cd server
npm run make-admin -- you@example.com
```
Log out and back in; the **Users** link appears in the navbar.

## API reference
All `/api/tasks` and `/api/users` routes need the header `Authorization: Bearer <token>`.

| Method | Route | Access | Description |
|---|---|---|---|
| POST | /api/auth/register | public | Create account, returns token |
| POST | /api/auth/login | public | Log in, returns token |
| GET | /api/auth/profile | user | Current user |
| GET | /api/tasks | user | List own tasks. Query: `search, status, priority, deadline (overdue/today/week), sort (newest/oldest/due), page, limit` |
| GET | /api/tasks/stats | user | Dashboard summary |
| POST | /api/tasks | user | Create task |
| GET | /api/tasks/:id | user | Task details |
| PUT | /api/tasks/:id | user | Update task |
| DELETE | /api/tasks/:id | user | Delete task |
| GET | /api/users | admin | List users with task counts |
| GET | /api/users/:id | admin | One user |
| PUT | /api/users/:id | admin | Update name, email, role |
| DELETE | /api/users/:id | admin | Delete user and their tasks |

## Deployment
- **API (Render):** root directory `server`, build command `npm install`, start command `npm start`.
  Environment variables: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` (your Vercel URL, no trailing slash).
- **Atlas:** under Network Access allow `0.0.0.0/0` so Render can connect.
- **Client (Vercel):** root directory `client`, framework Vite.
  Environment variable: `VITE_API_URL` (your Render URL). `vercel.json` handles page refreshes on React routes.
