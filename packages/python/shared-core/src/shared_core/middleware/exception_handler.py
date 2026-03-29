"""
Exception handling middleware
"""

from collections.abc import Callable

from aws_lambda_powertools.event_handler import Response
from aws_lambda_powertools.event_handler.middlewares import BaseMiddlewareHandler

from shared_core.api.errors import map_exception_to_response


class ExceptionHandlingMiddleware(BaseMiddlewareHandler):
    """
    Exception handling middleware
    """

    def handler(self, app, next_middleware: Callable[..., Response]) -> Response:
        """
        Handle exceptions
        Args:
            app: Application
            next_middleware (Callable[..., Response]): Next middleware
        Returns:
            Response: Response
        """
        try:
            return next_middleware(app)
        except Exception as exc:
            logger = app.context.get("logger")
            if logger is not None:
                logger.exception("Unhandled exception in request pipeline")
            return map_exception_to_response(exc)
