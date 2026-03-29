"""
Application settings
"""

from functools import lru_cache

from shared_core.settings import ApiAppSettings


class Settings(ApiAppSettings):
    """Application settings"""

    pass


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Get application settings"""
    return Settings()  # type: ignore[call-arg]
