from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import SessionLocal
import models, schemas, auth

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