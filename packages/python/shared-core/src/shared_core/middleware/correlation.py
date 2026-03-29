"""
Correlation ID middleware
"""

from collections.abc import Callable

from aws_lambda_powertools.event_handler import Response
from aws_lambda_powertools.event_handler.middlewares import BaseMiddlewareHandler


class CorrelationIdMiddleware(BaseMiddlewareHandler):
    """
    Correlation ID middleware
    """

    def handler(self, app, next_middleware: Callable[..., Response]) -> Response:
        """
        Add correlation ID to logger
        Args:
            app: Application
            next_middleware (Callable[..., Response]): Next middleware
        Returns:
            Response: Response
        """
        correlation_id = app.current_event.headers.get("x-correlation-id", "missing")
        app.context["logger"].append_keys(correlation_id=correlation_id)
        return next_middleware(app)
