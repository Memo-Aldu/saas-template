"""
Routes
"""

from skeleton_lambda_rest.api.routes.auth import router as auth_router
from skeleton_lambda_rest.api.routes.health import router as health_router

API_PREFIX = "/api/v1"
ROUTERS = (health_router, auth_router)

__all__ = ["API_PREFIX", "ROUTERS"]
