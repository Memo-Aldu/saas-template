"""
Application exceptions
"""


class AppError(Exception):
    """
    Base application error
    """

    code = "app_error"
    status_code = 500

    def __init__(self, message: str, details: dict | None = None):
        super().__init__(message)
        self.message = message
        self.details = details or {}


class ValidationError(AppError):
    """
    Validation error
    """

    code = "validation_error"
    status_code = 400


class UnauthorizedError(AppError):
    """
    Unauthorized error
    """

    code = "unauthorized"
    status_code = 401


class ForbiddenError(AppError):
    """
    Forbidden error
    """

    code = "forbidden"
    status_code = 403


class NotFoundError(AppError):
    """
    Not found error
    """

    code = "not_found"
    status_code = 404


class ConflictError(AppError):
    """
    Conflict error
    """

    code = "conflict"
    status_code = 409


class UpstreamServiceError(AppError):
    """
    Upstream service error
    """

    code = "upstream_service_error"
    status_code = 502
