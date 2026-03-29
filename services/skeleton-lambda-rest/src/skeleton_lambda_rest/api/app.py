"""
API Gateway REST resolver
"""

from shared_core.api.app import build_rest_app
from shared_core.observability import build_logger, build_tracer
from skeleton_lambda_rest.config import get_settings


settings = get_settings()
logger = build_logger(settings)
tracer = build_tracer(settings)

app = build_rest_app()
app.context["logger"] = logger
app.context["tracer"] = tracer
