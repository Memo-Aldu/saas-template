"""
Health check route
"""

from aws_lambda_powertools.event_handler import Response
from aws_lambda_powertools.event_handler.router import APIGatewayRouter

from shared_core.cors import cors_headers
from domain_models.api import SuccessResponse
from shared_core.responses import json_response

from skeleton_lambda_rest.config import get_settings

settings = get_settings()
router = APIGatewayRouter()


@router.get("/skeleton/health")
def get_health() -> Response:
    """Health check"""
    return json_response(
        SuccessResponse(
            message="OK",
            data={
                "version": settings.version,
                "service": settings.service_name,
                "environment": settings.environment,
            },
        ).model_dump(),
        headers=cors_headers(
            settings.cors_allow_origin,
            settings.cors_allow_headers,
            settings.cors_allow_methods,
        ),
    )
