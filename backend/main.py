from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models, schemas, auth
from datetime import datetime
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.exc import IntegrityError

# Ensure database tables are created
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="HRMS API")

# CORS Middleware added here to fix the NetworkError
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/admin/employees/generate", response_model=schemas.EmployeeDirectoryResponse)
def generate_employee_id(payload: schemas.EmployeeIdGenerateRequest, db: Session = Depends(get_db)):
    """Admin generates a new Employee ID + assigns a name. The employee then
    signs up themselves using this ID + their own email + password."""
    last = db.query(models.EmployeeDirectory).order_by(models.EmployeeDirectory.id.desc()).first()
    next_num = (last.id if last else 0) + 1
    new_id = f"EMP{next_num:04d}"
    # Guard against collisions if IDs were ever added out of band
    while db.query(models.EmployeeDirectory).filter(models.EmployeeDirectory.employee_id == new_id).first():
        next_num += 1
        new_id = f"EMP{next_num:04d}"

    entry = models.EmployeeDirectory(
        employee_id=new_id,
        full_name=payload.full_name,
        role="Employee",
        is_registered=False,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@app.get("/admin/employees", response_model=List[schemas.EmployeeDirectoryResponse])
def list_generated_employee_ids(db: Session = Depends(get_db)):
    return db.query(models.EmployeeDirectory).order_by(models.EmployeeDirectory.id.desc()).all()


@app.delete("/admin/employees/{employee_id}")
def delete_generated_employee_id(employee_id: str, db: Session = Depends(get_db)):
    entry = db.query(models.EmployeeDirectory).filter(models.EmployeeDirectory.employee_id == employee_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Employee ID not found")
    if entry.is_registered:
        raise HTTPException(status_code=400, detail="This Employee ID has already been used to sign up and can't be removed")
    db.delete(entry)
    db.commit()
    return {"message": "Employee ID removed"}


@app.post("/signup")
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if email exists
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if employee ID exists
    if db.query(models.User).filter(models.User.employee_id == user.employeeId).first():
        raise HTTPException(status_code=400, detail="Employee ID already exists")

    # Employees must sign up with an Employee ID an Admin generated for them.
    directory_entry = None
    if user.role == "Employee":
        directory_entry = db.query(models.EmployeeDirectory).filter(
            models.EmployeeDirectory.employee_id == user.employeeId
        ).first()
        if not directory_entry:
            raise HTTPException(
                status_code=400,
                detail="This Employee ID was not issued by an Admin. Ask your HR admin to generate one for you."
            )
        if directory_entry.is_registered:
            raise HTTPException(
                status_code=400,
                detail="This Employee ID has already been used to sign up."
            )

    # Hash password (using your auth module's hash function)
    try:
        hashed_pwd = auth.hash_password(user.password)
    except AttributeError:
        # Fallback just in case your auth file uses the name get_password_hash instead
        hashed_pwd = auth.get_password_hash(user.password)

    new_user = models.User(
        employee_id=user.employeeId,
        email=user.email,
        hashed_password=hashed_pwd,
        role=user.role
    )
    db.add(new_user)
    db.flush()  # assigns new_user.id without committing yet

    full_name = directory_entry.full_name if directory_entry else user.employeeId
    new_profile = models.Profile(user_id=new_user.id, full_name=full_name, phone=user.phone)
    db.add(new_profile)

    if directory_entry:
        directory_entry.is_registered = True

    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully", "role": new_user.role}

@app.post("/signin")
def sign_in(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # form_data.username will automatically map to the email sent from the frontend
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    # Store the user's role in the JWT token so the frontend knows if they are an Admin or Employee
    token = auth.create_access_token(data={"sub": str(user.id), "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role,
        "user_id": user.id,
        "employee_id": user.employee_id,
    }


@app.get("/profile/{user_id}", response_model=schemas.ProfileResponse)
def get_profile(user_id: int, db: Session = Depends(get_db)):
    """Real profile data pulled straight from hrms.db - nothing here is
    invented, so a fresh/empty database returns nothing to show."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    profile = db.query(models.Profile).filter(models.Profile.user_id == user_id).first()
    return schemas.ProfileResponse(
        user_id=user.id,
        employee_id=user.employee_id,
        email=user.email,
        role=user.role,
        full_name=profile.full_name if profile else None,
        job_title=profile.job_title if profile else None,
        phone=profile.phone if profile else None,
        address=profile.address if profile else None,
        created_at=user.created_at,
    )


@app.put("/profile/{user_id}", response_model=schemas.ProfileResponse)
def update_profile(user_id: int, payload: schemas.ProfileUpdate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    profile = db.query(models.Profile).filter(models.Profile.user_id == user_id).first()
    if not profile:
        profile = models.Profile(user_id=user_id)
        db.add(profile)
    if payload.phone is not None:
        profile.phone = payload.phone
    if payload.address is not None:
        profile.address = payload.address
    db.commit()
    db.refresh(profile)
    return schemas.ProfileResponse(
        user_id=user.id,
        employee_id=user.employee_id,
        email=user.email,
        role=user.role,
        full_name=profile.full_name,
        job_title=profile.job_title,
        phone=profile.phone,
        address=profile.address,
        created_at=user.created_at,
    )


@app.get("/admin/users", response_model=List[schemas.EmployeeSummary])
def list_all_users(db: Session = Depends(get_db)):
    """Every real, signed-up user currently in hrms.db - no placeholder rows."""
    users = db.query(models.User).order_by(models.User.id.asc()).all()
    today = datetime.utcnow().date()
    results = []
    for u in users:
        profile = db.query(models.Profile).filter(models.Profile.user_id == u.id).first()
        latest_attendance = (
            db.query(models.Attendance)
            .filter(models.Attendance.user_id == u.id)
            .order_by(models.Attendance.date.desc())
            .first()
        )
        status = "No record"
        if latest_attendance and latest_attendance.date.date() == today:
            status = latest_attendance.status
        results.append(
            schemas.EmployeeSummary(
                user_id=u.id,
                employee_id=u.employee_id,
                email=u.email,
                role=u.role,
                full_name=profile.full_name if profile else None,
                job_title=profile.job_title if profile else None,
                phone=profile.phone if profile else None,
                address=profile.address if profile else None,
                attendance_status=status,
                created_at=u.created_at,
            )
        )
    return results


@app.get("/admin/leaves", response_model=List[schemas.LeaveRequestWithEmployee])
def list_all_leaves(status: Optional[str] = None, db: Session = Depends(get_db)):
    """Every real leave request in hrms.db, optionally filtered by status."""
    query = db.query(models.LeaveRequest)
    if status and status != "All":
        query = query.filter(models.LeaveRequest.status == status)
    leaves = query.order_by(models.LeaveRequest.id.desc()).all()

    results = []
    for lr in leaves:
        user = db.query(models.User).filter(models.User.id == lr.user_id).first()
        profile = db.query(models.Profile).filter(models.Profile.user_id == lr.user_id).first() if user else None
        results.append(
            schemas.LeaveRequestWithEmployee(
                id=lr.id,
                user_id=lr.user_id,
                employee_id=user.employee_id if user else None,
                employee_name=(profile.full_name if profile and profile.full_name else (user.employee_id if user else "Unknown")),
                leave_type=lr.leave_type,
                start_date=lr.start_date,
                end_date=lr.end_date,
                status=lr.status,
                remarks=lr.remarks,
            )
        )
    return results


@app.post("/attendance/check-in", response_model=schemas.AttendanceResponse)
def check_in(user_id: int, db: Session = Depends(get_db)):
    new_attendance = models.Attendance(
        user_id=user_id,
        date=datetime.utcnow(),
        status="Present",
        check_in_time=datetime.utcnow()
    )
    db.add(new_attendance)
    db.commit()
    db.refresh(new_attendance)
    return new_attendance


@app.put("/attendance/check-out/{attendance_id}", response_model=schemas.AttendanceResponse)
def check_out(attendance_id: int, db: Session = Depends(get_db)):
    attendance = db.query(models.Attendance).filter(models.Attendance.id == attendance_id).first()
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    
    attendance.check_out_time = datetime.utcnow()
    db.commit()
    db.refresh(attendance)
    return attendance


@app.get("/attendance/{user_id}", response_model=List[schemas.AttendanceResponse])
def get_user_attendance(user_id: int, db: Session = Depends(get_db)):
    records = db.query(models.Attendance).filter(models.Attendance.user_id == user_id).all()
    return records


@app.post("/leave/apply", response_model=schemas.LeaveRequestResponse)
def apply_leave(leave: schemas.LeaveRequestCreate, user_id: int, db: Session = Depends(get_db)):
    new_leave = models.LeaveRequest(
        user_id=user_id,
        leave_type=leave.leave_type,
        start_date=leave.start_date,
        end_date=leave.end_date,
        remarks=leave.remarks,
        status="Pending"
    )
    db.add(new_leave)
    db.commit()
    db.refresh(new_leave)
    return new_leave


@app.put("/leave/approve/{leave_id}", response_model=schemas.LeaveRequestResponse)
def update_leave_status(leave_id: int, status: str, db: Session = Depends(get_db)):
    leave_request = db.query(models.LeaveRequest).filter(models.LeaveRequest.id == leave_id).first()
    if not leave_request:
        raise HTTPException(status_code=404, detail="Leave request not found")
    
    leave_request.status = status 
    db.commit()
    db.refresh(leave_request)
    return leave_request


@app.get("/leave/{user_id}", response_model=List[schemas.LeaveRequestResponse])
def get_user_leaves(user_id: int, db: Session = Depends(get_db)):
    return db.query(models.LeaveRequest).filter(models.LeaveRequest.user_id == user_id).all()


@app.post("/payroll/create", response_model=schemas.PayrollResponse)
def create_payroll(user_id: int, payroll: schemas.PayrollCreate, db: Session = Depends(get_db)):
    net_salary = payroll.base_salary + payroll.bonuses - payroll.deductions
    new_payroll = models.Payroll(
        user_id=user_id,
        base_salary=payroll.base_salary,
        bonuses=payroll.bonuses,
        deductions=payroll.deductions,
        net_salary=net_salary,
        payment_date=payroll.payment_date
    )
    db.add(new_payroll)
    db.commit()
    db.refresh(new_payroll)
    return new_payroll


@app.get("/payroll/{user_id}", response_model=List[schemas.PayrollResponse])
def get_user_payroll(user_id: int, db: Session = Depends(get_db)):
    return db.query(models.Payroll).filter(models.Payroll.user_id == user_id).all()
