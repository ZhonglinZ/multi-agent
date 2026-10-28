from uuid import UUID

from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.session_service import SessionService
from app.application.unit_of_work import UnitOfWork
from app.domain.sessions.entities import Session
from app.infrastructure.database.session import get_db_session
from app.schemas.common import ApiResponse
from app.schemas.session import (
    SessionCreateRequest,
    SessionListResponse,
    SessionResponse,
)

router = APIRouter(prefix="/sessions", tags=["sessions"])


def build_session_service(
    db_session: AsyncSession = Depends(get_db_session),
) -> SessionService:
    return SessionService(UnitOfWork(db_session))


def to_session_response(session: Session) -> SessionResponse:
    return SessionResponse(
        id=session.id,
        title=session.title,
        status=session.status.value,
        unread_count=session.unread_count,
        created_at=session.created_at,
        updated_at=session.updated_at,
    )


@router.post("", response_model=ApiResponse[SessionResponse])
async def create_session(
    payload: SessionCreateRequest,
    service: SessionService = Depends(build_session_service),
) -> ApiResponse[SessionResponse]:
    session = await service.create_session(payload.title)
    return ApiResponse(data=to_session_response(session))


@router.get("", response_model=ApiResponse[SessionListResponse])
async def list_sessions(
    service: SessionService = Depends(build_session_service),
) -> ApiResponse[SessionListResponse]:
    sessions = await service.list_sessions()
    return ApiResponse(
        data=SessionListResponse(
            items=[to_session_response(session) for session in sessions],
        )
    )


@router.delete("/{session_id}", status_code=204)
async def delete_session(
    session_id: UUID,
    service: SessionService = Depends(build_session_service),
) -> Response:
    await service.delete_session(session_id)
    return Response(status_code=204)
