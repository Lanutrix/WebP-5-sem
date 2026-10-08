"""Точка входа: FastAPI-приложение ЛР4 «Зелёный Берег»."""
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.database import Base, SessionLocal, engine
from app.routers import admin, auth, orders, services
from app.seed import seed

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
]


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed(db)
    yield


app = FastAPI(
    title="Зелёный Берег API",
    description="REST API для заявок на полив и ландшафт (ЛР4, FastAPI + SQLite)",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(services.router)
app.include_router(orders.router)
app.include_router(admin.router)


@app.exception_handler(Exception)
async def unhandled_exception_handler(_: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"detail": f"Внутренняя ошибка сервера: {exc}"})


@app.get("/api/health", tags=["system"])
def health():
    return {"status": "ok"}
