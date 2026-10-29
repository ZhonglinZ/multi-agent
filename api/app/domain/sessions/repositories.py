from typing import Protocol
from uuid import UUID
from app.domain.sessions.entities import Session


class SessionRepository(Protocol):
    async def add(self, title: str) -> Session:
        raise NotImplementedError

    async def get(self, session_id: UUID) -> Session | None:
        raise NotImplementedError

    async def list_active(self) -> list[Session]:
        raise NotImplementedError

    async def soft_delete(self, session_id: UUID) -> None:
        raise NotImplementedError
