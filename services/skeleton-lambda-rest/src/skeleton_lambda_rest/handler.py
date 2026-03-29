"""
Skeleton REST Lambda handler
"""

from typing import Any

from aws_lambda_powertools.logging import correlation_paths
from aws_lambda_powertools.utilities.typing import LambdaContext

from skeleton_lambda_rest.api.app import app, logger, tracer
from skeleton_lambda_rest.api.routes import API_PREFIX, ROUTERS

# Register routes with a shared versioned prefix.
for router in ROUTERS:
    app.include_router(router, prefix=API_PREFIX)


@logger.inject_lambda_context(
    log_event=True, correlation_id_path=correlation_paths.API_GATEWAY_REST
)
@tracer.capture_lambda_handler
def handler(event: dict, context: LambdaContext) -> dict[str, Any]:
    """Lambda handler"""
    app.append_context(logger=logger, tracer=tracer)
    return app.resolve(event, context)
