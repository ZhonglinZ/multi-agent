from fastapi import APIRouter

from app.api.routes import status
from app.api.routes import sessions

api_router = APIRouter()
api_router.include_router(status.router)
api_router.include_router(sessions.router)
