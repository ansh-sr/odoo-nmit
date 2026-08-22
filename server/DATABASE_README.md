# Database Architecture - odoo_nmit

## Overview

This project uses **TWO databases** that work together:

| Database | What It Does | Technology |
|----------|--------------|------------|
| **MongoDB** | All application data | NoSQL Document Store |
| **Supabase** | User login/authentication & file storage | PostgreSQL + Auth API |

**Why split?** MongoDB is great for flexible app data. Supabase provides
ready-made auth, storage, and real-time features without building from scratch.

---

## MongoDB - Application Data

**Connection:** `mongodb://localhost:27017/`
**Database name:** `odoo_nmit`
**Managed by:** `server/seed_db.py`

### Collections

#### 1. `users` - Employee Records
```json
{
  "emp_id": "EMP101",
  "name": "Alex Mercer",
  "email": "alex@dayflow.com",
  "password": "hashed_password_here",
  "role": "Employee",
  "job_title": "Frontend Developer",
  "department": "Engineering",
  "phone": "+91 9876543212",
  "address": "Bangalore, India",
  "profile_pic": "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
  "basic_salary": 45000.0,
  "allowances": 10000.0,
  "deductions": 2000.0,
  "net_salary": 53000.0,
  "created_at": "2026-08-22 10:00:00"
}
```
**Used for:** Employee profiles, salary info, department data

#### 2. `attendance` - Daily Check-in/out
```json
{
  "emp_id": "EMP101",
  "name": "Alex Mercer",
  "date": "2026-08-22",
  "check_in": "09:02:14",
  "check_out": null,
  "status": "Present"
}
```
**Used for:** Tracking work hours, daily attendance

#### 3. `leaves` - Leave Requests
```json
{
  "emp_id": "EMP101",
  "name": "Alex Mercer",
  "leave_type": "Sick",
  "start_date": "2026-09-01",
  "end_date": "2026-09-02",
  "remarks": "Medical appointment",
  "status": "Pending",
  "admin_comment": "",
  "applied_on": "2026-08-22 10:00:00"
}
```
**Used for:** Leave applications, approvals, history

---

## Supabase - Authentication & Storage

**URL:** Set in `server/.env` as `SUPABASE_URL`
**Browser key:** Set in `server/.env` as `SUPABASE_PUBLISHABLE_KEY`
**Server-only key:** Set in `server/.env` as `SUPABASE_SERVICE_ROLE_KEY` (only for `seed_supabase.py`; never expose it to a browser)
**Managed by:** `server/seed_supabase.py`

### What Supabase Handles

#### 1. User Authentication (Login/Signup)
- Email + password login
- Session management (who is logged in)
- Password reset
- Protected routes

**Auth users table (managed by Supabase automatically):**
| Email | Role in Supabase `app_metadata` |
|-------|----------------------------------|
| admin@dayflow.com | `admin` |
| hr@dayflow.com | `hr` |
| alex@dayflow.com | `employee` |

Development passwords are set through environment variables and are never committed.

#### 2. File Storage (Profile Pictures)
- Store employee profile photos in the private `profile-pictures` bucket
- Use paths in the form `<supabase-user-id>/avatar.<extension>`
- A signed-in user can access only files in their own folder
- Generate short-lived signed URLs when the app needs to display an image

#### 3. Real-time Updates (Optional)
- Live attendance updates
- Real-time leave status changes
- Notifications

---

## How They Work Together

```
User Login Flow:
  1. User enters email/password
  2. Supabase Auth verifies credentials
  3. Supabase returns session token
  4. App uses token to fetch data from MongoDB

Data Flow:
  App -> Supabase (auth check) -> MongoDB (fetch data) -> App
```

### Example: Employee Check-in
```
1. Employee logs in via Supabase Auth
2. App verifies session is valid
3. App writes check-in time to MongoDB attendance collection
4. MongoDB stores the record
5. App shows "Checked in at 09:02:14"
```

### Example: Admin Views Reports
```
1. Admin logs in via Supabase Auth
2. App verifies admin role from Supabase metadata
3. App queries MongoDB for attendance/leave data
4. MongoDB returns all records
5. App displays reports
```

---

## File Structure

```
server/
  seed_db.py          # Seeds MongoDB with sample data
  seed_supabase.py    # Seeds Supabase Auth with users
  .env                # Your credentials (DO NOT COMMIT)
  .env.example        # Template for .env
```

---

## Running the Project

```bash
# 1. Seed MongoDB (app data)
python seed_db.py

# 2. Seed Supabase (auth users)
python seed_supabase.py
```

---

## Important Notes

1. **Never commit `.env` file** - Add it to `.gitignore`
2. **MongoDB is local** - Only works on your machine
3. **Supabase is cloud** - Works from anywhere
4. **Passwords live only in Supabase Auth** - never use a MongoDB password field for login
5. **Don't duplicate users** - Auth identity and roles are in Supabase; profiles remain in MongoDB and should store the corresponding Supabase user ID

---

## For Team Members

### If you're working on Auth/Login:
- Work with **Supabase** only; use `server/supabase_auth.py` to validate bearer tokens
- Use `server/seed_supabase.py` for test users after setting the required variables in `server/.env`
- Check Supabase dashboard → Authentication

### If you're working on Attendance/Leaves:
- Work with **MongoDB** only
- Use `server/seed_db.py` for test data
- Check MongoDB Compass → odoo_nmit database

### If you're working on both:
- Understand the flow above
- Auth check before any MongoDB query
- Never store passwords in MongoDB
