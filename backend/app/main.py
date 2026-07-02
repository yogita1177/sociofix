from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logger import logger
from app.database.mongodb import connect_to_mongo, close_mongo_connection
from app.utils.response import success_response


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting SocioFix Backend")
    connect_to_mongo()

    yield

    close_mongo_connection()


app = FastAPI(
    title=settings.APP_NAME,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return success_response(
        message="SocioFix Backend Running"
    )


@app.get("/health")
async def health():
    return success_response(
        message="Healthy"
    )