from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse
from datetime import datetime, timedelta, timezone
import json
import mimetypes
import os
import sys
import time


ROOT = Path(__file__).resolve().parent
DIST_DIR = ROOT / "frontend" / "dist"
HTML_FILE = ROOT / "promath_crm_dashboard_ui_upgraded (16) (1).html"
SERVE_FRONTEND_DIST = True


def load_dotenv(path):
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


load_dotenv(ROOT / ".env")

MONGO_URI = os.getenv("MONGODB_URI") or os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB = os.getenv("MONGO_DB", "promath_crm")
MONGO_STORAGE_COLLECTION = os.getenv("MONGO_STORAGE_COLLECTION", "app_storage")
MONGO_AUDIT_COLLECTION = os.getenv("MONGO_AUDIT_COLLECTION", "audit_log")
MONGO_USERS_COLLECTION = os.getenv("MONGO_USERS_COLLECTION", "users")
JWT_SECRET = os.getenv("JWT_SECRET", "dev-only-change-me")
JWT_EXPIRES_IN = os.getenv("JWT_EXPIRES_IN", "8h")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")
ADMIN_NAME = os.getenv("ADMIN_NAME", "Admin")
NEST_API_URL = os.getenv("NEST_API_URL", "")
APP_ENV = os.getenv("APP_ENV", "development")
CORS_ORIGINS = {
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://127.0.0.1:5173,http://localhost:5173").split(",")
    if origin.strip()
}
CRM_STORAGE_KEY = "promath_crm_v13"
USER_ROLES = {"admin", "content", "implementation", "engagement", "billing"}
STAGE_IDS = [
    "initial_meeting",
    "product_demo",
    "demo_followup",
    "pricing_negotiation",
    "mou_signing",
    "syllabus_submission",
    "coverage_check",
    "coverage_communication",
    "student_data",
    "license_creation",
    "impl_confirmation",
    "implementation",
    "impl_feedback",
    "orientation",
]


class MongoStore:
    def __init__(self):
        try:
            from pymongo import MongoClient, ASCENDING
        except ImportError as exc:
            raise RuntimeError(
                "pymongo is not installed. Run: python -m pip install -r requirements.txt"
            ) from exc

        self.client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=3000)
        self.db = self.client[MONGO_DB]
        self.storage = self.db[MONGO_STORAGE_COLLECTION]
        self.audit = self.db[MONGO_AUDIT_COLLECTION]
        self.users = self.db[MONGO_USERS_COLLECTION]
        self.storage.create_index([("key", ASCENDING)], unique=True)
        self.audit.create_index([("storage_key", ASCENDING), ("created_at", ASCENDING)])
        self.users.create_index([("email", ASCENDING)], unique=True)
        self.users.create_index([("role", ASCENDING)])

    def ping(self):
        self.client.admin.command("ping")

    def get(self, key):
        return self.storage.find_one({"key": key}, {"_id": 0})

    def set(self, key, value):
        now = datetime.now(timezone.utc).isoformat()
        self.storage.update_one(
            {"key": key},
            {
                "$set": {"key": key, "value": value, "updated_at": now},
                "$setOnInsert": {"created_at": now},
            },
            upsert=True,
        )

    def admin_exists(self):
        return self.users.find_one({"role": "admin"}, {"_id": 1}) is not None

    def find_user_by_email(self, email):
        return self.users.find_one({"email": str(email or "").strip().lower()})

    def find_user_by_id(self, user_id):
        from bson import ObjectId

        try:
            object_id = ObjectId(user_id)
        except Exception:
            return None
        return self.users.find_one({"_id": object_id})

    def create_user(self, data):
        now = datetime.now(timezone.utc)
        role = data.get("role")
        if role not in USER_ROLES:
            raise ValueError("Invalid role")
        password = data.get("password")
        if not password:
            raise ValueError("Password is required")
        password_hash = hash_password(password)
        row = {
            "name": str(data.get("name") or "").strip(),
            "email": str(data.get("email") or "").strip().lower(),
            "passwordHash": password_hash,
            "role": role,
            "isActive": bool(data.get("isActive", True)),
            "createdAt": now,
            "updatedAt": now,
        }
        if not row["name"] or not row["email"]:
            raise ValueError("Name and email are required")
        inserted = self.users.insert_one(row)
        row["_id"] = inserted.inserted_id
        return public_user(row)

    def list_users(self):
        return [public_user(row) for row in self.users.find().sort("createdAt", -1)]

    def update_user(self, user_id, data):
        from bson import ObjectId
        from pymongo import ReturnDocument

        try:
            object_id = ObjectId(user_id)
        except Exception as exc:
            raise KeyError("User not found") from exc
        updates = {"updatedAt": datetime.now(timezone.utc)}
        for key in ("name", "email", "role", "isActive"):
            if key in data:
                updates[key] = data[key]
        if "email" in updates:
            updates["email"] = str(updates["email"]).strip().lower()
        if "role" in updates and updates["role"] not in USER_ROLES:
            raise ValueError("Invalid role")
        if data.get("password"):
            updates["passwordHash"] = hash_password(data["password"])
        row = self.users.find_one_and_update(
            {"_id": object_id},
            {"$set": updates},
            return_document=ReturnDocument.AFTER,
        )
        if not row:
            raise KeyError("User not found")
        return public_user(row)

    def deactivate_user(self, user_id):
        return self.update_user(user_id, {"isActive": False})
        self.audit.insert_one(
            {
                "storage_key": key,
                "action": "upsert",
                "created_at": now,
            }
        )


_store = None


def get_store():
    global _store
    if _store is None:
        _store = MongoStore()
    return _store


def hash_password(password):
    import bcrypt

    return bcrypt.hashpw(str(password).encode("utf-8"), bcrypt.gensalt(rounds=12)).decode("utf-8")


def check_password(password, password_hash):
    import bcrypt

    return bcrypt.checkpw(str(password or "").encode("utf-8"), str(password_hash).encode("utf-8"))


def jwt_seconds(value):
    text = str(value or "8h").strip().lower()
    try:
        return int(text)
    except ValueError:
        pass
    amount = int(text[:-1] or "8")
    unit = text[-1]
    if unit == "d":
        return amount * 86400
    if unit == "m":
        return amount * 60
    if unit == "s":
        return amount
    return amount * 3600


def sign_token(user):
    import jwt

    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user["_id"]),
        "email": user["email"],
        "role": user["role"],
        "name": user["name"],
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(seconds=jwt_seconds(JWT_EXPIRES_IN))).timestamp()),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def verify_token(token):
    import jwt

    return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])


def public_user(user):
    return {
        "id": str(user["_id"]),
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "role": user.get("role", ""),
        "isActive": bool(user.get("isActive", True)),
        "createdAt": user.get("createdAt").isoformat() if user.get("createdAt") else None,
        "updatedAt": user.get("updatedAt").isoformat() if user.get("updatedAt") else None,
    }


def authenticate(handler):
    header = handler.headers.get("Authorization", "")
    if not header.startswith("Bearer "):
        json_response(handler, 401, {"error": "unauthorized", "message": "Missing bearer token"})
        return None
    try:
        payload = verify_token(header.removeprefix("Bearer ").strip())
        user = get_store().find_user_by_id(payload.get("sub"))
    except Exception:
        json_response(handler, 401, {"error": "unauthorized", "message": "Invalid bearer token"})
        return None
    if not user or not user.get("isActive", True):
        json_response(handler, 401, {"error": "unauthorized", "message": "User is inactive"})
        return None
    return user


def require_role(handler, roles):
    user = authenticate(handler)
    if not user:
        return None
    if user.get("role") not in roles:
        json_response(handler, 403, {"error": "forbidden", "message": "Insufficient role"})
        return None
    return user


def ensure_default_admin():
    if not ADMIN_EMAIL or not ADMIN_PASSWORD:
        return
    store = get_store()
    if store.find_user_by_email(ADMIN_EMAIL):
        return
    store.create_user(
        {
            "name": ADMIN_NAME,
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD,
            "role": "admin",
            "isActive": True,
        }
    )


def read_json_body(handler):
    length = int(handler.headers.get("Content-Length", "0"))
    body = handler.rfile.read(length).decode("utf-8")
    return json.loads(body or "{}")


def default_crm_data():
    return {"colleges": [], "notifications": []}


def default_stages():
    return {
        stage_id: {"status": "not_started", "data": {}, "completed_at": None}
        for stage_id in STAGE_IDS
    }


def normalize_college(college):
    normalized = dict(college or {})
    normalized["stages"] = {**default_stages(), **(normalized.get("stages") or {})}
    return normalized


def normalize_crm_data(data):
    data = data or default_crm_data()
    data.setdefault("colleges", [])
    data.setdefault("notifications", [])
    data["colleges"] = [normalize_college(college) for college in data["colleges"]]
    return data


def get_crm_data():
    row = get_store().get(CRM_STORAGE_KEY)
    if not row or not row.get("value"):
        return default_crm_data()
    try:
        data = json.loads(row["value"])
    except json.JSONDecodeError:
        data = default_crm_data()
    return normalize_crm_data(data)


def save_crm_data(data):
    data = normalize_crm_data(data)
    get_store().set(CRM_STORAGE_KEY, json.dumps(data))
    return data


def new_college(data):
    now_ms = int(time.time() * 1000)
    random_part = os.urandom(3).hex()
    return {
        "id": data.get("id") or f"col_{now_ms}_{random_part}",
        "name": data.get("name", "").strip(),
        "college_type": data.get("college_type", ""),
        "academic_year": data.get("academic_year", ""),
        "contact_name": data.get("contact_name", ""),
        "contact_designation": data.get("contact_designation", ""),
        "phone": data.get("phone", ""),
        "email": data.get("email", ""),
        "location": data.get("location", ""),
        "total_students": data.get("total_students", ""),
        "current_status": data.get("current_status", ""),
        "additional_comments": data.get("additional_comments", ""),
        "created_at": data.get("created_at") or datetime.now(timezone.utc).isoformat(),
        "stages": {**default_stages(), **(data.get("stages") or {})},
    }


def json_response(handler, status, payload, extra_headers=None):
    body = json.dumps(payload).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.send_header("Cache-Control", "no-store")
    for key, value in (extra_headers or {}).items():
        handler.send_header(key, value)
    handler.end_headers()
    handler.wfile.write(body)


def mask_uri(uri):
    if "://" not in uri or "@" not in uri:
        return uri
    scheme, rest = uri.split("://", 1)
    return scheme + "://***@" + rest.split("@", 1)[1]


class PromathHandler(BaseHTTPRequestHandler):
    server_version = "PromathCRM/1.0"

    def log_message(self, fmt, *args):
        sys.stdout.write("[%s] %s\n" % (self.log_date_time_string(), fmt % args))

    def do_OPTIONS(self):
        self.send_response(204)
        origin = self.headers.get("Origin")
        if origin in CORS_ORIGINS:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/health":
            try:
                get_store().ping()
            except Exception as exc:
                json_response(
                    self,
                    503,
                    {
                        "ok": False,
                        "database": "mongodb",
                        "mongo_db": MONGO_DB,
                        "error": str(exc),
                        "timestamp": int(time.time()),
                    },
                )
                return
            json_response(
                self,
                200,
                {
                    "ok": True,
                    "database": "mongodb",
                    "mongo_db": MONGO_DB,
                    "timestamp": int(time.time()),
                },
            )
            return

        if parsed.path == "/api/frontend-config":
            json_response(self, 200, {"apiBaseUrl": NEST_API_URL.rstrip("/")})
            return

        if parsed.path == "/auth/me":
            user = authenticate(self)
            if not user:
                return
            json_response(self, 200, public_user(user))
            return

        if parsed.path == "/users":
            if not require_role(self, {"admin"}):
                return
            try:
                json_response(self, 200, {"users": get_store().list_users()})
            except Exception as exc:
                json_response(self, 503, {"error": "database_unavailable", "message": str(exc)})
            return

        if parsed.path == "/api/colleges":
            if not authenticate(self):
                return
            try:
                data = get_crm_data()
            except Exception as exc:
                json_response(self, 503, {"error": "database_unavailable", "message": str(exc)})
                return
            json_response(self, 200, {"colleges": data["colleges"], "count": len(data["colleges"])})
            return

        if parsed.path.startswith("/api/storage/"):
            # Deprecated compatibility path retained for migration and emergency backup only.
            if not require_role(self, {"admin"}):
                return
            key = unquote(parsed.path.removeprefix("/api/storage/"))
            try:
                row = get_store().get(key)
            except Exception as exc:
                json_response(self, 503, {"error": "database_unavailable", "message": str(exc)})
                return
            if not row:
                json_response(self, 404, {"error": "not_found", "key": key})
                return
            json_response(
                self,
                200,
                {"key": row["key"], "value": row["value"], "updated_at": row.get("updated_at")},
                {"Deprecation": "true", "Sunset": "Wed, 31 Dec 2026 23:59:59 GMT"},
            )
            return

        # Serve React dist only when explicitly enabled. Dashboard-only mode serves legacy HTML.
        if SERVE_FRONTEND_DIST and DIST_DIR.exists():
            if parsed.path in ("/", "/index.html"):
                self.serve_file(DIST_DIR / "index.html", "text/html; charset=utf-8")
                return
            # Serve static assets (JS, CSS, images)
            asset_path = (DIST_DIR / parsed.path.lstrip("/")).resolve()
            if DIST_DIR in asset_path.parents and asset_path.is_file():
                self.serve_file(asset_path)
                return
            # SPA fallback — all unknown routes → index.html (React Router handles it)
            self.serve_file(DIST_DIR / "index.html", "text/html; charset=utf-8")
            return

        # Legacy HTML fallback
        if parsed.path in ("/", "/index.html"):
            self.serve_file(HTML_FILE, "text/html; charset=utf-8")
            return

        safe_path = (ROOT / parsed.path.lstrip("/")).resolve()
        if ROOT not in safe_path.parents and safe_path != ROOT:
            json_response(self, 403, {"error": "forbidden"})
            return
        if safe_path.is_file():
            self.serve_file(safe_path)
            return
        json_response(self, 404, {"error": "not_found"})

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path == "/auth/login":
            try:
                payload = read_json_body(self)
                user = get_store().find_user_by_email(payload.get("email"))
                if not user or not user.get("isActive", True):
                    json_response(self, 401, {"error": "unauthorized", "message": "Invalid credentials"})
                    return
                if not check_password(payload.get("password"), user.get("passwordHash", "")):
                    json_response(self, 401, {"error": "unauthorized", "message": "Invalid credentials"})
                    return
            except Exception as exc:
                json_response(self, 503, {"error": "auth_unavailable", "message": str(exc)})
                return
            json_response(self, 200, {"accessToken": sign_token(user), "user": public_user(user)})
            return

        if parsed.path == "/users":
            if not require_role(self, {"admin"}):
                return
            try:
                payload = read_json_body(self)
                user = get_store().create_user(payload)
            except ValueError as exc:
                json_response(self, 400, {"error": "validation_error", "message": str(exc)})
                return
            except Exception as exc:
                json_response(self, 503, {"error": "database_unavailable", "message": str(exc)})
                return
            json_response(self, 201, user)
            return

        if parsed.path == "/api/colleges":
            if not require_role(self, {"admin"}):
                return
            try:
                payload = read_json_body(self)
                college_input = payload.get("college", payload)
                college = new_college(college_input)
                if not college["name"]:
                    json_response(self, 400, {"error": "validation_error", "message": "College name is required"})
                    return
                data = get_crm_data()
                data["colleges"] = [college] + data["colleges"]
                save_crm_data(data)
            except Exception as exc:
                json_response(self, 503, {"error": "database_unavailable", "message": str(exc)})
                return
            json_response(self, 201, {"college": college, "data": data})
            return

        if parsed.path == "/api/colleges/bulk":
            if not require_role(self, {"admin"}):
                return
            try:
                payload = read_json_body(self)
                rows = payload.get("colleges", [])
                if not isinstance(rows, list):
                    json_response(self, 400, {"error": "validation_error", "message": "colleges must be a list"})
                    return
                data = get_crm_data()
                existing = {str(c.get("name", "")).strip().lower() for c in data["colleges"]}
                imported = []
                skipped = []
                for row in rows:
                    college = new_college(row if isinstance(row, dict) else {})
                    name_key = college["name"].strip().lower()
                    if not name_key or name_key in existing:
                        skipped.append(college.get("name", ""))
                        continue
                    existing.add(name_key)
                    imported.append(college)
                data["colleges"] = imported + data["colleges"]
                save_crm_data(data)
            except Exception as exc:
                json_response(self, 503, {"error": "database_unavailable", "message": str(exc)})
                return
            json_response(self, 200, {"imported": len(imported), "skipped": len(skipped), "data": data})
            return

        json_response(self, 404, {"error": "not_found"})

    def do_PATCH(self):
        parsed = urlparse(self.path)
        if parsed.path.startswith("/users/"):
            if not require_role(self, {"admin"}):
                return
            user_id = unquote(parsed.path.removeprefix("/users/"))
            try:
                user = get_store().update_user(user_id, read_json_body(self))
            except KeyError as exc:
                json_response(self, 404, {"error": "not_found", "message": str(exc)})
                return
            except ValueError as exc:
                json_response(self, 400, {"error": "validation_error", "message": str(exc)})
                return
            except Exception as exc:
                json_response(self, 503, {"error": "database_unavailable", "message": str(exc)})
                return
            json_response(self, 200, user)
            return

        if parsed.path.startswith("/api/colleges/"):
            user = require_role(self, {"admin"})
            if not user:
                return
            college_id = unquote(parsed.path.removeprefix("/api/colleges/"))
            try:
                updates = read_json_body(self)
                data = get_crm_data()
                updated = None
                next_colleges = []
                for college in data["colleges"]:
                    if college.get("id") == college_id:
                        merged = {**college, **updates, "id": college_id}
                        if "stages" in college and "stages" not in updates:
                            merged["stages"] = college["stages"]
                        updated = merged
                        next_colleges.append(merged)
                    else:
                        next_colleges.append(college)
                if not updated:
                    json_response(self, 404, {"error": "not_found", "id": college_id})
                    return
                data["colleges"] = next_colleges
                save_crm_data(data)
            except Exception as exc:
                json_response(self, 503, {"error": "database_unavailable", "message": str(exc)})
                return
            json_response(self, 200, {"college": updated, "data": data})
            return

        json_response(self, 404, {"error": "not_found"})

    def do_DELETE(self):
        parsed = urlparse(self.path)
        if parsed.path.startswith("/users/"):
            if not require_role(self, {"admin"}):
                return
            user_id = unquote(parsed.path.removeprefix("/users/"))
            try:
                user = get_store().deactivate_user(user_id)
            except KeyError as exc:
                json_response(self, 404, {"error": "not_found", "message": str(exc)})
                return
            except Exception as exc:
                json_response(self, 503, {"error": "database_unavailable", "message": str(exc)})
                return
            json_response(self, 200, user)
            return

        if parsed.path.startswith("/api/colleges/"):
            user = require_role(self, {"admin"})
            if not user:
                return
            college_id = unquote(parsed.path.removeprefix("/api/colleges/"))
            try:
                data = get_crm_data()
                before = len(data["colleges"])
                data["colleges"] = [c for c in data["colleges"] if c.get("id") != college_id]
                if len(data["colleges"]) == before:
                    json_response(self, 404, {"error": "not_found", "id": college_id})
                    return
                save_crm_data(data)
            except Exception as exc:
                json_response(self, 503, {"error": "database_unavailable", "message": str(exc)})
                return
            json_response(self, 200, {"deleted": True, "id": college_id, "data": data})
            return

        json_response(self, 404, {"error": "not_found"})

    def do_PUT(self):
        parsed = urlparse(self.path)
        if not parsed.path.startswith("/api/storage/"):
            json_response(self, 404, {"error": "not_found"})
            return

        # Deprecated compatibility path retained for migration and emergency backup only.
        if not require_role(self, {"admin"}):
            return

        key = unquote(parsed.path.removeprefix("/api/storage/"))
        try:
            length = int(self.headers.get("Content-Length", "0"))
            body = self.rfile.read(length).decode("utf-8")
            payload = json.loads(body or "{}")
            value = payload["value"]
            if not isinstance(value, str):
                value = json.dumps(value)
        except Exception as exc:
            json_response(self, 400, {"error": "bad_request", "message": str(exc)})
            return

        try:
            get_store().set(key, value)
        except Exception as exc:
            json_response(self, 503, {"error": "database_unavailable", "message": str(exc)})
            return

        json_response(
            self,
            200,
            {"key": key, "saved": True},
            {"Deprecation": "true", "Sunset": "Wed, 31 Dec 2026 23:59:59 GMT"},
        )

    def serve_file(self, path, content_type=None):
        if not path.exists():
            json_response(self, 404, {"error": "not_found"})
            return
        body = path.read_bytes()
        content_type = content_type or mimetypes.guess_type(path.name)[0] or "application/octet-stream"
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def main():
    if APP_ENV == "production" and (JWT_SECRET == "dev-only-change-me" or len(JWT_SECRET) < 32):
        raise RuntimeError("JWT_SECRET must be set to at least 32 characters in production")
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", sys.argv[1] if len(sys.argv) > 1 else 8000))
    server = ThreadingHTTPServer((host, port), PromathHandler)
    try:
        ensure_default_admin()
    except Exception as exc:
        print(f"Default admin setup skipped: {exc}")
    print(f"Promath CRM backend running at http://{host}:{port}")
    print(f"MongoDB: {mask_uri(MONGO_URI)}/{MONGO_DB}")
    if SERVE_FRONTEND_DIST and (DIST_DIR / "index.html").exists():
        print(f"Frontend: serving React build from {DIST_DIR}")
    else:
        print(f"Frontend: React build not found, serving legacy HTML from {HTML_FILE}")
    print("MongoDB connection is checked by /api/health and storage requests.")
    server.serve_forever()


if __name__ == "__main__":
    main()
