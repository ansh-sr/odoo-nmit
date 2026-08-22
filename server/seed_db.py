import hashlib
from datetime import datetime, timedelta
from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
db = client["odoo_nmit"]

def hash_pw(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

def seed():
    print("Clearing old collections...")
    db.users.drop()
    db.attendance.drop()
    db.leaves.drop()

    # Users: Admin, HR Officer, Employee
    users = [
        {
            "emp_id": "ADM001",
            "name": "Admin User",
            "email": "admin@dayflow.com",
            "password": hash_pw("admin123"),
            "role": "Admin",
            "job_title": "System Administrator",
            "department": "Management",
            "phone": "+91 9876543210",
            "address": "Bangalore, India",
            "profile_pic": "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
            "basic_salary": 90000.0,
            "allowances": 20000.0,
            "deductions": 5000.0,
            "net_salary": 105000.0,
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        },
        {
            "emp_id": "HR001",
            "name": "Sarah Connor",
            "email": "hr@dayflow.com",
            "password": hash_pw("hr123456"),
            "role": "HR Officer",
            "job_title": "HR Manager",
            "department": "Human Resources",
            "phone": "+91 9876543211",
            "address": "Bangalore, India",
            "profile_pic": "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
            "basic_salary": 65000.0,
            "allowances": 15000.0,
            "deductions": 3000.0,
            "net_salary": 77000.0,
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        },
        {
            "emp_id": "EMP101",
            "name": "Alex Mercer",
            "email": "alex@dayflow.com",
            "password": hash_pw("alex1234"),
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
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
    ]
    db.users.insert_many(users)

    # Attendance
    today = datetime.now().strftime("%Y-%m-%d")
    yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
    attendance = [
        {
            "emp_id": "EMP101",
            "name": "Alex Mercer",
            "date": yesterday,
            "check_in": "09:05:00",
            "check_out": "18:00:00",
            "status": "Present"
        },
        {
            "emp_id": "EMP101",
            "name": "Alex Mercer",
            "date": today,
            "check_in": "09:02:14",
            "check_out": None,
            "status": "Present"
        }
    ]
    db.attendance.insert_many(attendance)

    # Leaves
    leaves = [
        {
            "emp_id": "EMP101",
            "name": "Alex Mercer",
            "leave_type": "Sick",
            "start_date": "2026-09-01",
            "end_date": "2026-09-02",
            "remarks": "Medical appointment",
            "status": "Pending",
            "admin_comment": "",
            "applied_on": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
    ]
    db.leaves.insert_many(leaves)
    print("Database seeded with sample users, attendance, and leaves.")

if __name__ == "__main__":
    seed()
