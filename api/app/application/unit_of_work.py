from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.repositories.session_repository import (
    SqlAlchemySessionRepository,
)


class UnitOfWork:
    def __init__(self, db_session: AsyncSession) -> None:
        self.db_session = db_session
        self.sessions = SqlAlchemySessionRepository(db_session)

    async def commit(self) -> None:
        await self.db_session.commit()

    async def rollback(self) -> None:
        await self.db_session.rollback()
