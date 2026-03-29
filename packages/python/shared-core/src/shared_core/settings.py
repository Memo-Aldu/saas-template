from enum import Enum
from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class AppEnvironment(str, Enum):
    """Application environment."""

    LOCAL = "local"
    DEV = "dev"
    QA = "qa"
    STAGING = "staging"
    PROD = "prod"


class BaseAppSettings(BaseSettings):
    """Base application settings."""

    service_name: str = Field(
        description="Service name", alias="POWERTOOLS_SERVICE_NAME"
    )
    version: str = Field(description="Service version", alias="SERVICE_VERSION")
    environment: AppEnvironment = Field(description="Environment", alias="ENVIRONMENT")
    log_level: str = Field(
        default="INFO", description="Log level", alias="POWERTOOLS_LOG_LEVEL"
    )
    log_sampling_rate: float = Field(
        default=1.0,
        ge=0.0,
        le=1.0,
        description="Log sampling rate",
        alias="POWERTOOLS_LOG_SAMPLING_RATE",
    )
    region: str = Field(
        default="us-east-1", description="AWS region", alias="APP_AWS_REGION"
    )
    cloudwatch_namespace: str = Field(
        default="SAASTemplate/Lambda",
        description="CloudWatch namespace",
        alias="CLOUDWATCH_NAMESPACE",
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        validate_assignment=True,
        extra="ignore",
        case_sensitive=False,
        str_strip_whitespace=True,
    )


class ApiAppSettings(BaseAppSettings):
    """API application settings."""

    cors_allow_origin: str = Field(
        description="CORS allow origin. Must be set explicitly - no default to prevent open CORS in production.",
        alias="CORS_ALLOW_ORIGIN",
    )
    cors_allow_headers: str = Field(
        default="Content-Type,Authorization,X-Correlation-Id",
        description="CORS allow headers",
        alias="CORS_ALLOW_HEADERS",
    )
    cors_allow_methods: str = Field(
        default="GET,POST,PUT,PATCH,DELETE,OPTIONS",
        description="CORS allow methods",
        alias="CORS_ALLOW_METHODS",
    )


class WorkerAppSettings(BaseAppSettings):
    """Worker application settings."""


@lru_cache(maxsize=1)
def load_settings(settings_cls: type[BaseAppSettings]) -> BaseAppSettings:
    """Load a settings instance for the provided settings class."""
    return settings_cls()
