# Ledger — HRMS Frontend

A React + Vite frontend for the FastAPI HRMS backend (`main.py`). Covers signup/signin,
employee attendance punch in/out, leave requests, and payroll — plus an admin view for
salary structure, payroll entry, and leave approval.

## Setup

```bash
cd client
npm install
npm run dev
```

Runs on `http://localhost:5173` by default and expects the API at `http://localhost:8000`
(matches `start_backend.sh`). To point at a different API URL, create a `.env` file:

```
VITE_API_URL=http://localhost:8000
```

## Notes on the backend contract

- `/signin` returns a JWT with `sub` (user id) and `role` claims — the frontend decodes
  this client-side (no verification) purely to route Employee vs Admin, since there's no
  `/me` endpoint yet.
- There's no endpoint to list *all* leave requests across employees, so the admin panel
  updates leave status by ID (the employee sees their leave ID on their own dashboard).
  If you add a "list all leave requests" endpoint later, swap the admin leave panel for
  a proper table.
- Attendance "punch out" only works for the most recent record with no `check_out_time` —
  matches the one-active-session assumption in `main.py`.

## Structure

```
src/
  api.js                  fetch wrapper for every backend endpoint
  context/AuthContext.jsx  JWT storage + decode, login/logout
  pages/Login.jsx
  pages/Signup.jsx
  pages/EmployeeDashboard.jsx
  pages/AdminDashboard.jsx
  components/Navbar.jsx
  components/StatCard.jsx
  components/LedgerTable.jsx
```
