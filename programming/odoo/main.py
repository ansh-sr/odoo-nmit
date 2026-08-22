from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import SessionLocal
import models, schemas, auth
from datetime import datetime
from typing import List

app = FastAPI(title="HRMS API")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/signup", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def sign_up(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(models.User).filter(models.User.employee_id == user.employee_id).first():
        raise HTTPException(status_code=400, detail="Employee ID already exists")

    hashed_pwd = auth.hash_password(user.password)
    new_user = models.User(
        employee_id=user.employee_id,
        email=user.email,
        hashed_password=hashed_pwd,
        is_admin=user.is_admin
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/signin", response_model=schemas.Token)
def sign_in(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    if not user or not auth.verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = auth.create_access_token(data={"sub": str(user.id), "is_admin": user.is_admin})
    return {"access_token": token, "token_type": "bearer"}


@app.post("/attendance/check-in", response_model=schemas.AttendanceResponse)
def check_in(user_id: int, db: Session = Depends(get_db)):
    # Check if the user already checked in today (simplified logic)
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
    
    leave_request.status = status # Approved or Rejected
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