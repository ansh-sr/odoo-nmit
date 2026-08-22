from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    employee_id: str
    email: EmailStr
    password: str
    is_admin: bool = False

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: int
    employee_id: str
    email: EmailStr
    is_admin: bool

    class Config:
        from_attributes = True

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