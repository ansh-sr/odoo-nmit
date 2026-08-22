from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Float
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="Employee")
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Profile(Base):
    __tablename__ = 'profiles'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    full_name = Column(String)
    job_title = Column(String)
    phone = Column(String)
    address = Column(String)
    profile_picture_url = Column(String)

class Attendance(Base):
    __tablename__ = 'attendance'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    date = Column(DateTime, default=datetime.utcnow)
    status = Column(String) 
    check_in_time = Column(DateTime, nullable=True)
    check_out_time = Column(DateTime, nullable=True)

class LeaveRequest(Base):
    __tablename__ = 'leave_requests'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    leave_type = Column(String) 
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    status = Column(String, default="Pending") 
    remarks = Column(String, nullable=True)

class Payroll(Base):
    __tablename__ = 'payroll'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    base_salary = Column(Float)
    bonuses = Column(Float, default=0.0)
    deductions = Column(Float, default=0.0)
    net_salary = Column(Float)
    payment_date = Column(DateTime)

class EmployeeDirectory(Base):
    """Employee IDs issued by an Admin. An employee can only sign up if their
    Employee ID exists here and hasn't been used yet."""
    __tablename__ = 'employee_directory'

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, unique=True, index=True)
    full_name = Column(String)
    role = Column(String, default="Employee")
    is_registered = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)