"""Create development users in Supabase Auth.

Run only with a service-role key stored in server/.env.  Roles belong in
app_metadata, which clients cannot edit; MongoDB remains the HRMS data store.
"""

import os

from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

USERS = (
    ("admin@dayflow.com", "ADM001", "Admin User", "admin", "SUPABASE_DEMO_ADMIN_PASSWORD"),
    ("hr@dayflow.com", "HR001", "Sarah Connor", "hr", "SUPABASE_DEMO_HR_PASSWORD"),
    ("alex@dayflow.com", "EMP101", "Alex Mercer", "employee", "SUPABASE_DEMO_EMPLOYEE_PASSWORD"),
)


def service_client():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        raise RuntimeError("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in server/.env")
    return create_client(url, key)


def seed_auth_users():
    client = service_client()
    response = client.auth.admin.list_users()
    existing = {user.email: user for user in (response.users if hasattr(response, 'users') else response)}

    for email, employee_id, full_name, role, password_variable in USERS:
        password = os.getenv(password_variable)
        if not password:
            raise RuntimeError(f"Set {password_variable} in server/.env before seeding")

        attributes = {
            "email_confirm": True,
            "user_metadata": {"full_name": full_name, "employee_id": employee_id},
            "app_metadata": {"role": role},
        }
        user = existing.get(email)
        if user:
            response = client.auth.admin.update_user_by_id(user.id, attributes)
        else:
            response = client.auth.admin.create_user({**attributes, "email": email, "password": password})

        print(f"{email} -> Supabase user id: {response.user.id}")


if __name__ == "__main__":
    seed_auth_users()
