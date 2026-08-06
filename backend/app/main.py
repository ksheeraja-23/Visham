from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from contextlib import asynccontextmanager

from app.database import engine, SessionLocal
from app.models.base import Base

import app.models

from app.routes.case import router as case_router
from app.routes.user import router as user_router
from app.routes.evidence import router as evidence_router
from app.routes.suspect import router as suspect_router
from app.routes.timeline import router as timeline_router
from app.routes.witness import router as witness_router
from app.routes.dashboard import router as dashboard_router
from app.routes.graph import router as graph_router
from app.ai.routes import router as ai_router
from app.core.neo4j import neo4j_conn
from app.routes.report import router as report_router
from app.routes.settings import router as settings_router
from app.services.seed_service import seed_isabella_case
from app.services.graph_sync import GraphSyncService

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Starting Visham...")
    Base.metadata.create_all(bind=engine)

    # Initialize Neo4j connection
    neo4j_conn.connect()

    db = SessionLocal()
    try:
        seeded = seed_isabella_case(db)
        if seeded:
            try:
                GraphSyncService().sync_all(db)
            except Exception as e:
                print(f"⚠️  Neo4j sync after seeding failed: {e}")
    finally:
        db.close()

    yield 

    # Clean up Neo4j connection
    neo4j_conn.close()
    print("🛑 Shutting down Visham...")


app = FastAPI(
    title="Visham API",
    version="1.0.0",
    description="AI-Powered Investigation Platform",
    lifespan=lifespan
)

# -------------------- CORS --------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------- Static Files --------------------

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)

# -------------------- Routers --------------------

app.include_router(ai_router)
app.include_router(timeline_router)
app.include_router(case_router)
app.include_router(user_router)
app.include_router(evidence_router)
app.include_router(suspect_router)
app.include_router(witness_router)
app.include_router(dashboard_router)
app.include_router(graph_router)
app.include_router(report_router)
app.include_router(settings_router)

# -------------------- Routes --------------------

@app.get("/")
def root():
    return {
        "message": "Welcome to Visham 🚀"
    }


@app.get("/test-db")
def test_db():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "Connected to PostgreSQL ✅"
        }

    except Exception as e:
        return {
            "status": "Connection Failed ❌",
            "error": str(e)
        }