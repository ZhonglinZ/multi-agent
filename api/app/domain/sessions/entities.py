from dataclasses import dataclass
from datetime import datetime
from enum import StrEnum
from uuid import UUID


class SessionStatus(StrEnum):
    idle = "idle"
    running = "running"
    stopped = "stopped"
    failed = "failed"


@dataclass(slots=True)
class Session:
    id: UUID
    title: str
    status: SessionStatus
    unread_count: int
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None = None


class MessageRole(StrEnum):
    user = "user"
    assistant = "assistant"
    system = "system"


class SessionEventType(StrEnum):
    message_created = "message_created"


@dataclass(slots=True)
class SessionMessage:
    id: UUID
    session_id: UUID
    role: MessageRole
    content: str
    created_at: datetime


@dataclass(slots=True)
class SessionEvent:
    id: UUID
    session_id: UUID
    type: SessionEventType
    payload: dict
    created_at: datetime
