from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import Select, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.sessions.entities import Session, SessionStatus
from app.domain.sessions.repositories import SessionRepository
from app.infrastructure.database.models.session import SessionModel


class SqlAlchemySessionRepository(SessionRepository):
    def __init__(self, db_session: AsyncSession) -> None:
        self.db_session = db_session

    async def add(self, title: str) -> Session:
        model = SessionModel(
            title=title,
            status=SessionStatus.idle.value,
            unread_count=0,
        )
        self.db_session.add(model)
        await self.db_session.flush()
        await self.db_session.refresh(model)
        return model.to_entity()

    async def get(self, session_id: UUID) -> Session | None:
        stmt = self._active_stmt().where(SessionModel.id == session_id)
        result = await self.db_session.execute(stmt)
        model = result.scalar_one_or_none()
        return model.to_entity() if model else None

    async def list_active(self) -> list[Session]:
        stmt = self._active_stmt().order_by(SessionModel.updated_at.desc())
        result = await self.db_session.execute(stmt)
        return [model.to_entity() for model in result.scalars()]

    async def soft_delete(self, session_id: UUID) -> None:
        stmt = self._active_stmt().where(SessionModel.id == session_id)
        result = await self.db_session.execute(stmt)
        model = result.scalar_one_or_none()
        if model is not None:
            model.deleted_at = datetime.now(UTC)

    @staticmethod
    def _active_stmt() -> Select[tuple[SessionModel]]:
        return select(SessionModel).where(SessionModel.deleted_at.is_(None))
