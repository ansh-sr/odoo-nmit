# Dayflow HRMS

A full-stack Employee Management System with a FastAPI backend and a React + Vite + Tailwind frontend. Covers employee onboarding (via admin-issued Employee IDs), attendance, leave requests, payroll, and role-based (Employee / Admin) views.

## Tech stack

**Backend:** FastAPI, SQLAlchemy (SQLite), Passlib (bcrypt password hashing), PyJWT
**Frontend:** React 18, React Router, Vite, Tailwind CSS, lucide-react icons

## Project structure

```
odoo-nmit/
├── requirements.txt        Python backend dependencies
├── backend/
│   ├── main.py              FastAPI app + all API routes
│   ├── models.py            SQLAlchemy ORM models
│   ├── schemas.py           Pydantic request/response schemas
│   ├── database.py          DB engine/session setup (SQLite: hrms.db)
│   ├── auth.py              Password hashing + JWT helpers
│   └── init_db.py           One-off script to create DB tables
└── client/
    ├── package.json         Frontend dependencies (Vite + React + Tailwind)
    ├── vite.config.js / tailwind.config.js / postcss.config.js
    ├── .env                 VITE_API_URL - not committed, create locally
    └── src/
        ├── App.jsx, main.jsx, index.css
        ├── components/       Layout, Sidebar, DayProgress, StatusBadge
        ├── data/mockData.js
        ├── lib/auth.js       Client-side auth/session helpers
        └── pages/            Login, Signup, Profile, Attendance, Leaves,
                               Payroll, and Employee/Admin-specific variants
```

## Data model

| Model | Purpose |
|---|---|
| `User` | employee_id, email, hashed_password, role (`Employee` / `Admin`), verification status |
| `Profile` | full name, job title, phone, address, profile picture |
| `Attendance` | daily status with check-in / check-out timestamps |
| `LeaveRequest` | leave type, date range, approval status, remarks |
| `Payroll` | base salary, bonuses, deductions, net salary, payment date |
| `EmployeeDirectory` | admin-issued Employee IDs; an employee can only sign up if their ID exists here and hasn't been registered yet |

## API routes

| Area | Endpoints |
|---|---|
| Admin — employee IDs | `POST /admin/employees/generate`, `GET /admin/employees`, `DELETE /admin/employees/{employee_id}` |
| Auth | `POST /signup`, `POST /signin` |
| Profile | `GET /profile/{user_id}`, `PUT /profile/{user_id}` |
| Admin — directory | `GET /admin/users`, `GET /admin/leaves` |
| Attendance | `POST /attendance/check-in`, `PUT /attendance/check-out/{attendance_id}`, `GET /attendance/{user_id}` |
| Leave | `POST /leave/apply`, `PUT /leave/approve/{leave_id}`, `GET /leave/{user_id}` |
| Payroll | `GET /admin/payroll`, `POST /payroll/create`, `PUT /payroll/{payroll_id}`, `GET /payroll/{user_id}` |

Signup is gated by the `EmployeeDirectory` table — an Admin must generate an Employee ID (`POST /admin/employees/generate`) before that person can create an account with it.

## Getting started

### 1. Backend (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r ../requirements.txt

python init_db.py               # creates hrms.db with all tables
uvicorn main:app --reload --port 8000
```

The API is now running at `http://127.0.0.1:8000` (interactive docs at `http://127.0.0.1:8000/docs`).

### 2. Frontend (React + Vite)

```bash
cd client
npm install

# create client/.env (it's git-ignored, so this step is required on every fresh clone)
echo "VITE_API_URL=http://127.0.0.1:8000" > .env

npm run dev
```

The app runs at `http://localhost:5173` by default. Make sure the backend is running first, and that `VITE_API_URL` points at wherever it's actually listening (if the backend runs on another machine/container, use that machine's IP instead of `127.0.0.1`).

### 3. First-time use

1. Sign up an **Admin** account directly from the Signup page (Role: "Admin / HR" — no Employee ID required).
2. Log in as that Admin and generate Employee IDs from the Employee IDs screen.
3. Employees sign up using the Employee ID an Admin generated for them, plus their own email/password.

## Known gaps / things to check before deploying

- `SECRET_KEY` in `backend/auth.py` is a hardcoded placeholder — replace it with a real secret (e.g. from an environment variable) before deploying anywhere beyond local dev.
- CORS is wide open (`allow_origins=["*"]`) in `main.py` — fine for local development, should be locked down for production.
- No route currently checks the caller's role/JWT before serving `/admin/*` endpoints — anyone who can reach the API can call them. Add an auth dependency before exposing this beyond localhost.
- SQLite (`hrms.db`) is fine for development but isn't meant for concurrent production use — consider Postgres/MySQL for a real deployment.
- No automated test suite yet.
