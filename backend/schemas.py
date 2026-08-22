from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime
import re

class UserCreate(BaseModel):
    employeeId: str
    email: EmailStr
    password: str
    role: str

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