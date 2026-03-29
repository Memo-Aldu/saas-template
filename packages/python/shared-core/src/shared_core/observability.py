"""
Observability utilities
"""

import json
from aws_lambda_powertools import Logger, Tracer

from shared_core.settings import BaseAppSettings, AppEnvironment


def build_logger(settings: BaseAppSettings) -> Logger:
    """
    Build a logger
    Args:
        settings (BaseAppSettings): Application settings
    Returns:
        Logger: Logger instance
    """
    return Logger(
        service=settings.service_name,
        level=settings.log_level,
        sampling_rate=settings.log_sampling_rate,
        json_serializer=lambda obj: json.dumps(obj, default=str),
    )


def build_tracer(settings: BaseAppSettings) -> Tracer:
    """
    Build a tracer
    Args:
        settings (BaseAppSettings): Application settings
    Returns:
        Tracer: Tracer instance
    """
    return Tracer(
        service=settings.service_name,
        disabled=settings.environment == AppEnvironment.LOCAL,
    )
