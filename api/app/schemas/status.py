from pydantic import BaseModel


class StatusResponse(BaseModel):
    service: str
    environment: str
    status: str
    version: str
