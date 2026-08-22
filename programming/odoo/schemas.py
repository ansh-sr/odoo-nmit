from pydantic import BaseModel, EmailStr
from typing import Optional

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