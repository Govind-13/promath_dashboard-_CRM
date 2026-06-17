from pathlib import Path
import os


ROOT = Path(__file__).resolve().parents[3]


def load_dotenv(path: Path) -> None:
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


load_dotenv(ROOT / ".env")

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB = os.getenv("MONGO_DB", "promath_crm")
MONGO_STORAGE_COLLECTION = os.getenv("MONGO_STORAGE_COLLECTION", "app_storage")
MONGO_AUDIT_COLLECTION = os.getenv("MONGO_AUDIT_COLLECTION", "audit_log")
