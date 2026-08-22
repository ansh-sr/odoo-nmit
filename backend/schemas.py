from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime
import re

class UserCreate(BaseModel):
    employeeId: str
    email: EmailStr
    password: str
    role: str
    phone: Optional[str] = None

    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError('Password must contain at least one special character')
        return v

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v.strip() == '':
            return None
        digits = re.sub(r'\D', '', v)
        if len(digits) < 7:
            raise ValueError('Enter a valid mobile number')
        return v.strip()

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class AttendanceCheckIn(BaseModel):
    status: str = "Present"

class AttendanceResponse(BaseModel):
    id: int
    user_id: int
    date: datetime
    status: str
    check_in_time: Optional[datetime] = None
    check_out_time: Optional[datetime] = None

    class Config:
        from_attributes = True

class LeaveRequestCreate(BaseModel):
    leave_type: str
    start_date: datetime
    end_date: datetime
    remarks: Optional[str] = None

class LeaveRequestResponse(BaseModel):
    id: int
    user_id: int
    leave_type: str
    start_date: datetime
    end_date: datetime
    status: str
    remarks: Optional[str] = None

    class Config:
        from_attributes = True

class PayrollCreate(BaseModel):
    base_salary: float
    bonuses: Optional[float] = 0.0
    deductions: Optional[float] = 0.0
    payment_date: datetime

class PayrollResponse(BaseModel):
    id: int
    user_id: int
    base_salary: float
    bonuses: float
    deductions: float
    net_salary: float
    payment_date: datetime

    class Config:
        from_attributes = True

class EmployeeIdGenerateRequest(BaseModel):
    full_name: str

    @field_validator('full_name')
    @classmethod
    def validate_full_name(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('Name is required')
        return v.strip()

class EmployeeDirectoryResponse(BaseModel):
    id: int
    employee_id: str
    full_name: str
    role: str
    is_registered: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ProfileUpdate(BaseModel):
    phone: Optional[str] = None
    address: Optional[str] = None


class ProfileResponse(BaseModel):
    user_id: int
    employee_id: str
    email: str
    role: str
    full_name: Optional[str] = None
    job_title: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class EmployeeSummary(BaseModel):
    user_id: int
    employee_id: str
    email: str
    role: str
    full_name: Optional[str] = None
    job_title: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    attendance_status: str = "No record"
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class LeaveRequestWithEmployee(BaseModel):
    id: int
    user_id: int
    employee_id: Optional[str] = None
    employee_name: Optional[str] = None
    leave_type: str
    start_date: datetime
    end_date: datetime
    status: str
    remarks: Optional[str] = None

    class Config:
        from_attributes = True