import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

from database.schema import init_db
from routers import upload, compliance, schedule, rfi, dashboard

load_dotenv()
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s — %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting DCPI API — initializing database...")
    init_db()
    logger.info("Database initialized")
    uploads_path = os.getenv("UPLOADS_PATH", "./uploads")
    os.makedirs(uploads_path, exist_ok=True)
    os.makedirs(os.getenv("CHROMA_PATH", "./chroma_db"), exist_ok=True)
    logger.info("DCPI API ready")
    yield
    logger.info("DCPI API shutting down")


app = FastAPI(
    title="DCPI — Data Centre Project Intelligence API",
    version="1.0.0",
    description="AI-powered EPC project intelligence for data centre construction",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api/upload", tags=["Upload"])
app.include_router(compliance.router, prefix="/api/compliance", tags=["Compliance"])
app.include_router(schedule.router, prefix="/api/schedule", tags=["Schedule"])
app.include_router(rfi.router, prefix="/api/rfi", tags=["RFI"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])

uploads_path = os.getenv("UPLOADS_PATH", "./uploads")
os.makedirs(uploads_path, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_path), name="uploads")


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url}: {str(exc)}")
    return JSONResponse(status_code=500, content={"error": str(exc)})


@app.get("/")
async def health_check():
    return {"status": "running", "version": "1.0.0", "service": "DCPI API"}