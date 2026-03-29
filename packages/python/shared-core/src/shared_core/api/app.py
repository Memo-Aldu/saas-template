"""
API Gateway REST resolver
"""

from aws_lambda_powertools.event_handler import APIGatewayRestResolver

from shared_core.middleware.correlation import CorrelationIdMiddleware
from shared_core.middleware.exception_handler import ExceptionHandlingMiddleware
from shared_core.middleware.request_logging import RequestLoggingMiddleware


def build_rest_app(enable_validation: bool = False) -> APIGatewayRestResolver:
    """
    Build a REST API application
    Args:
        enable_validation (bool, optional): Enable request validation. Defaults to False.
    Returns:
        APIGatewayRestResolver: REST API application
    """
    app = APIGatewayRestResolver(enable_validation=enable_validation)
    app.use(
        [
            ExceptionHandlingMiddleware(),
            CorrelationIdMiddleware(),
            RequestLoggingMiddleware(),
        ]
    )
    return app
