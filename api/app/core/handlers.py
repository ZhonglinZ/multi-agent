from fastapi.responses import JSONResponse
from fastapi import FastAPI, Request
from fastapi.exceptions import HTTPException, RequestValidationError

from app.schemas.common import ApiResponse
from app.core.exceptions import AppException


def build_error_response(code: int, message: str, status_code: int) -> JSONResponse:
    payload = ApiResponse[None](code=code, message=message, data=None)
    return JSONResponse(status_code=status_code, content=payload.model_dump())


def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    return build_error_response(exc.code, exc.message, exc.status_code)


def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    return build_error_response(exc.status_code, exc.detail, exc.status_code)


def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    return build_error_response(422, "Validation error", 422)


def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    return build_error_response(500, "Internal server error", 500)


def register_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(AppException, app_exception_handler)  # type: ignore[arg-type]
    app.add_exception_handler(HTTPException, http_exception_handler)  # type: ignore[arg-type]
    app.add_exception_handler(RequestValidationError, validation_exception_handler)  # type: ignore[arg-type]
    app.add_exception_handler(Exception, unhandled_exception_handler)
