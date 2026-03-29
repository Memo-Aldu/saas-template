"""
Request logging middleware
"""

from collections.abc import Callable
from typing import Any

from aws_lambda_powertools.event_handler import Response
from aws_lambda_powertools.event_handler.middlewares import BaseMiddlewareHandler


class RequestLoggingMiddleware(BaseMiddlewareHandler):
    """
    Request logging middleware
    """

    def handler(
        self, app, next_middleware: Callable[..., Response | dict[str, Any]]
    ) -> Response | dict[str, Any]:
        """
        Log request start and end
        Args:
            app: Application
            next_middleware (Callable[..., Response]): Next middleware
        Returns:
            Response: Response
        """
        logger = app.context["logger"]
        logger.info(
            "request_started",
            extra={
                "path": app.current_event.path,
                "method": app.current_event.http_method,
            },
        )
        response = next_middleware(app)
        status_code: int | str = "unknown"
        if hasattr(response, "status_code"):
            status_code = response.status_code
        elif isinstance(response, dict):
            status_code = response.get("statusCode", "unknown")
        logger.info(
            "request_finished",
            extra={"status_code": status_code},
        )
        return response
