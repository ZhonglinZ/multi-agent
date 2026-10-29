from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class SessionCreateRequest(BaseModel):
    title: str = Field(min_length=1, max_length=200)


class SessionResponse(BaseModel):
    id: UUID
    title: str
    status: str
    unread_count: int
    created_at: datetime
    updated_at: datetime


class SessionListResponse(BaseModel):
    items: list[SessionResponse]


class MessageCreateRequest(BaseModel):
    content: str = Field(min_length=1, max_length=8000)


class MessageResponse(BaseModel):
    id: UUID
    session_id: UUID
    role: str
    content: str
    created_at: datetime


class SessionEventResponse(BaseModel):
    id: UUID
    session_id: UUID
    type: str
    payload: dict
    created_at: datetime


class MessageCreateResponse(BaseModel):
    message: MessageResponse
    event: SessionEventResponse
