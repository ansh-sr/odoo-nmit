"""
Dayflow HRMS - Backend (Hackathon MVP)

Simple FastAPI app with in-memory mock data.
No database, no auth yet - that comes later.

Run with:
    uvicorn main:app --reload
"""

from datetime import datetime, date, timedelta
from typing import Optional, List
from uuid import uuid4

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Dayflow HRMS API", version="0.1.0")

# Allow the Vite dev server (and any localhost port) to call this API during
# the hackathon. Tighten this once auth / deployment is in place.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Mock data
# ---------------------------------------------------------------------------

EMPLOYEES = [
    {
        "id": "EMP001",
        "name": "Aditi Sharma",
        "email": "aditi.sharma@dayflow.io",
        "role": "Employee",
        "department": "Engineering",
        "designation": "Frontend Developer",
        "avatar": "AS",
        "phone": "+91 98765 43210",
        "address": "Bengaluru, Karnataka",
        "joinDate": "2023-03-14",
        "salary": {"base": 85000, "hra": 25500, "allowances": 8000, "currency": "INR"},
    },
    {
        "id": "EMP002",
        "name": "Rohan Verma",
        "email": "rohan.verma@dayflow.io",
        "role": "Employee",
        "department": "Engineering",
        "designation": "Backend Developer",
        "avatar": "RV",
        "phone": "+91 98765 11223",
        "address": "Pune, Maharashtra",
        "joinDate": "2022-11-02",
        "salary": {"base": 92000, "hra": 27600, "allowances": 9000, "currency": "INR"},
    },
    {
        "id": "EMP003",
        "name": "Kavya Iyer",
        "email": "kavya.iyer@dayflow.io",
        "role": "HR",
        "department": "Human Resources",
        "designation": "HR Officer",
        "avatar": "KI",
        "phone": "+91 98765 99887",
        "address": "Chennai, Tamil Nadu",
        "joinDate": "2021-06-21",
        "salary": {"base": 78000, "hra": 23400, "allowances": 7000, "currency": "INR"},
    },
    {
        "id": "EMP004",
        "name": "Sameer Khan",
        "email": "sameer.khan@dayflow.io",
        "role": "Employee",
        "department": "Design",
        "designation": "Product Designer",
        "avatar": "SK",
        "phone": "+91 98765 55443",
        "address": "Hyderabad, Telangana",
        "joinDate": "2023-08-09",
        "salary": {"base": 80000, "hra": 24000, "allowances": 7500, "currency": "INR"},
    },
]

# Attendance keyed by employee id -> list of daily records
ATTENDANCE = {
    "EMP001": [
        {"date": "2026-08-18", "status": "Present", "checkIn": "09:02", "checkOut": "18:10"},
        {"date": "2026-08-19", "status": "Present", "checkIn": "08:57", "checkOut": "18:05"},
        {"date": "2026-08-20", "status": "Half-day", "checkIn": "09:10", "checkOut": "13:30"},
        {"date": "2026-08-21", "status": "Present", "checkIn": "09:00", "checkOut": "18:20"},
        {"date": "2026-08-22", "status": "Present", "checkIn": "08:55", "checkOut": None},
    ],
    "EMP002": [
        {"date": "2026-08-18", "status": "Present", "checkIn": "09:15", "checkOut": "18:00"},
        {"date": "2026-08-19", "status": "Absent", "checkIn": None, "checkOut": None},
        {"date": "2026-08-20", "status": "Present", "checkIn": "09:05", "checkOut": "18:00"},
        {"date": "2026-08-21", "status": "Present", "checkIn": "09:00", "checkOut": "17:55"},
        {"date": "2026-08-22", "status": "Present", "checkIn": "09:03", "checkOut": None},
    ],
    "EMP003": [
        {"date": "2026-08-18", "status": "Present", "checkIn": "09:00", "checkOut": "18:00"},
        {"date": "2026-08-19", "status": "Present", "checkIn": "09:00", "checkOut": "18:00"},
        {"date": "2026-08-20", "status": "Leave", "checkIn": None, "checkOut": None},
        {"date": "2026-08-21", "status": "Present", "checkIn": "08:50", "checkOut": "18:00"},
        {"date": "2026-08-22", "status": "Present", "checkIn": "08:58", "checkOut": None},
    ],
    "EMP004": [
        {"date": "2026-08-18", "status": "Present", "checkIn": "09:20", "checkOut": "18:15"},
        {"date": "2026-08-19", "status": "Present", "checkIn": "09:10", "checkOut": "18:00"},
        {"date": "2026-08-20", "status": "Present", "checkIn": "09:00", "checkOut": "18:00"},
        {"date": "2026-08-21", "status": "Half-day", "checkIn": "09:00", "checkOut": "13:00"},
        {"date": "2026-08-22", "status": "Present", "checkIn": "09:05", "checkOut": None},
    ],
}

# Leave requests keyed by employee id
LEAVE_REQUESTS = {
    "EMP001": [
        {
            "id": "LR001",
            "type": "Sick",
            "startDate": "2026-08-10",
            "endDate": "2026-08-11",
            "remarks": "Fever",
            "status": "Approved",
            "appliedOn": "2026-08-08",
        },
        {
            "id": "LR002",
            "type": "Paid",
            "startDate": "2026-08-28",
            "endDate": "2026-08-29",
            "remarks": "Family function",
            "status": "Pending",
            "appliedOn": "2026-08-20",
        },
    ],
    "EMP002": [
        {
            "id": "LR003",
            "type": "Unpaid",
            "startDate": "2026-08-19",
            "endDate": "2026-08-19",
            "remarks": "Personal work",
            "status": "Rejected",
            "appliedOn": "2026-08-16",
        }
    ],
    "EMP003": [],
    "EMP004": [
        {
            "id": "LR004",
            "type": "Paid",
            "startDate": "2026-09-01",
            "endDate": "2026-09-03",
            "remarks": "Travel",
            "status": "Pending",
            "appliedOn": "2026-08-21",
        }
    ],
}


def _get_employee_or_404(employee_id: str) -> dict:
    for emp in EMPLOYEES:
        if emp["id"] == employee_id:
            return emp
    raise HTTPException(status_code=404, detail=f"Employee '{employee_id}' not found")


# ---------------------------------------------------------------------------
# Request/response models
# ---------------------------------------------------------------------------

class LeaveRequestCreate(BaseModel):
    employeeId: str
    type: str  # Paid | Sick | Unpaid
    startDate: str
    endDate: str
    remarks: Optional[str] = ""


class CheckInRequest(BaseModel):
    employeeId: str


class CheckOutRequest(BaseModel):
    employeeId: str


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "dayflow-backend", "time": datetime.utcnow().isoformat()}


@app.get("/api/employees")
def get_employees():
    return {"count": len(EMPLOYEES), "employees": EMPLOYEES}


@app.get("/api/employees/{employee_id}")
def get_employee(employee_id: str):
    return _get_employee_or_404(employee_id)


@app.get("/api/attendance/{employee_id}")
def get_attendance(employee_id: str):
    _get_employee_or_404(employee_id)
    records = ATTENDANCE.get(employee_id, [])
    return {"employeeId": employee_id, "records": records}


@app.get("/api/leave/{employee_id}")
def get_leave(employee_id: str):
    _get_employee_or_404(employee_id)
    requests_ = LEAVE_REQUESTS.get(employee_id, [])
    return {"employeeId": employee_id, "requests": requests_}


@app.post("/api/leave")
def create_leave(payload: LeaveRequestCreate):
    _get_employee_or_404(payload.employeeId)

    new_request = {
        "id": f"LR{uuid4().hex[:6].upper()}",
        "type": payload.type,
        "startDate": payload.startDate,
        "endDate": payload.endDate,
        "remarks": payload.remarks or "",
        "status": "Pending",
        "appliedOn": date.today().isoformat(),
    }
    LEAVE_REQUESTS.setdefault(payload.employeeId, []).insert(0, new_request)
    return new_request


@app.post("/api/attendance/check-in")
def check_in(payload: CheckInRequest):
    _get_employee_or_404(payload.employeeId)
    today = date.today().isoformat()
    now = datetime.now().strftime("%H:%M")

    records = ATTENDANCE.setdefault(payload.employeeId, [])
    today_record = next((r for r in records if r["date"] == today), None)

    if today_record:
        if today_record.get("checkIn"):
            raise HTTPException(status_code=400, detail="Already checked in today")
        today_record["checkIn"] = now
        today_record["status"] = "Present"
    else:
        today_record = {"date": today, "status": "Present", "checkIn": now, "checkOut": None}
        records.append(today_record)

    return today_record


@app.post("/api/attendance/check-out")
def check_out(payload: CheckOutRequest):
    _get_employee_or_404(payload.employeeId)
    today = date.today().isoformat()
    now = datetime.now().strftime("%H:%M")

    records = ATTENDANCE.setdefault(payload.employeeId, [])
    today_record = next((r for r in records if r["date"] == today), None)

    if not today_record or not today_record.get("checkIn"):
        raise HTTPException(status_code=400, detail="Must check in before checking out")
    if today_record.get("checkOut"):
        raise HTTPException(status_code=400, detail="Already checked out today")

    today_record["checkOut"] = now
    return today_record


@app.get("/")
def root():
    return {"message": "Dayflow HRMS API is running. See /docs for the interactive API explorer."}
