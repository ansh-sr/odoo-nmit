"""Small server-side helpers for Supabase Auth.

Use the publishable key to validate an incoming bearer token. Never send the
service-role key to a browser or use it for normal user requests.
"""

import os

from dotenv import load_dotenv
from supabase import create_client

load_dotenv()


def _client():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_PUBLISHABLE_KEY")
    if not url or not key:
        raise RuntimeError("Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY in server/.env")
    return create_client(url, key)


def get_authenticated_user(access_token: str):
    """Validate a bearer token before any MongoDB request.

    The returned user's immutable role is in ``app_metadata.role``. The caller
    must map the user ID or email to the corresponding MongoDB employee record.
    """
    if not access_token:
        raise ValueError("Missing Supabase access token")
    return _client().auth.get_user(access_token).user
