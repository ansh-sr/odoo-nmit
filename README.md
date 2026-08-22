# odoo-nmit — Project Overview

A full-stack **Employee Management System** (front-end package name: `dayflow-frontend`), built with a FastAPI backend and a React + Vite frontend. Covers employee onboarding, attendance, leave requests, payroll, and admin controls.

## Structure

```
odoo-nmit/
├── README.md            (currently empty/placeholder)
├── requirements.txt      Python backend dependencies
├── backend/
│   ├── main.py           FastAPI app + all API routes
│   ├── models.py         SQLAlchemy ORM models
│   ├── schemas.py        Pydantic request/response schemas
│   ├── database.py       DB session/engine setup
│   ├── auth.py           Auth helpers (hashing, JWT, etc.)
│   └── init_db.py        DB initialization script
└── client/
    ├── package.json      Frontend deps (Vite + React 18 + Tailwind)
    ├── vite.config.js / tailwind.config.js / postcss.config.js
    ├── index.html
    └── src/
        ├── App.jsx, main.jsx, index.css
        ├── components/   Layout, Sidebar, DayProgress, StatusBadge
        ├── data/mockData.js
        ├── lib/auth.js
        └── pages/        Login, Signup, Dashboard, Profile,
                           Attendance, Leaves, Payroll,
                           Employee/Admin variants of the above
```

## Backend (FastAPI)

**Dependencies** (`requirements.txt`): fastapi, uvicorn, sqlalchemy, passlib[bcrypt], bcrypt, pyjwt, python-multipart, email-validator.

**Data models** (`models.py`):
- `User` — employee_id, email, hashed_password, role (Employee/Admin), verification status
- `Profile` — full name, job title, phone, address, profile picture
- `Attendance` — daily status with check-in/check-out timestamps
- `LeaveRequest` — leave type, date range, approval status, remarks
- `Payroll` — base salary, bonuses, deductions, net salary, payment date
- `EmployeeDirectory` — admin-issued employee IDs; an employee can only sign up if their ID exists here and hasn't been registered yet

**API routes** (`main.py`):
| Area | Endpoints |
|---|---|
| Admin — employee IDs | `POST /admin/employees/generate`, `GET /admin/employees`, `DELETE /admin/employees/{employee_id}` |
| Auth | `POST /signup`, `POST /signin` |
| Profile | `GET/PUT /profile/{user_id}` |
| Admin — users/leaves | `GET /admin/users`, `GET /admin/leaves` |
| Attendance | `POST /attendance/check-in`, `PUT /attendance/check-out/{attendance_id}`, `GET /attendance/{user_id}` |
| Leave | `POST /leave/apply`, `PUT /leave/approve/{leave_id}`, `GET /leave/{user_id}` |
| Payroll | `GET /admin/payroll`, `POST /payroll/create`, `PUT /payroll/{payroll_id}`, `GET /payroll/{user_id}` |

Signup is gated by the pre-registered `EmployeeDirectory` table — an admin must generate an employee ID before that person can create an account.

## Frontend (React + Vite + Tailwind)

**Dependencies**: React 18, react-router-dom, lucide-react icons, Tailwind CSS.

**Pages** split by role:
- Shared: Login, Signup, Dashboard, Profile, Attendance, Leaves, Payroll
- Employee-specific: `EmployeeDashboard.jsx`
- Admin-specific: `AdminDashboard.jsx`, `AdminEmployees.jsx`, `AdminEmployeeIds.jsx`, `AdminLeaveApprovals.jsx`, `AdminPayroll.jsx`

**Components**: `Layout`, `Sidebar`, `DayProgress`, `StatusBadge`
**Other**: `lib/auth.js` (client-side auth helpers), `data/mockData.js` (sample/mock data for UI development)

## Likely Purpose

Given the "odoo-nmit" naming, this looks like a hackathon/college project (possibly built for an Odoo-affiliated event at NMIT) implementing a lightweight HR/employee-management platform: role-based signup via admin-issued IDs, attendance tracking, leave management, and payroll — split cleanly into an Employee view and an Admin view.

## Notes / Gaps Observed

- Top-level `README.md` is currently just a title with no content.
- No `.env` / config file visible for DB connection strings or JWT secrets — check `database.py` and `auth.py` before running.
- No tests directory present.
