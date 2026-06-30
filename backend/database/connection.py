import sqlite3
import os
from dotenv import load_dotenv

load_dotenv()


def get_db_path() -> str:
    return os.getenv("DATABASE_PATH", "./dcpi.db")


def get_db() -> sqlite3.Connection:
    db_path = get_db_path()
    conn = sqlite3.connect(db_path, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    conn.execute("PRAGMA synchronous=NORMAL")
    return conn