"""
API Error models
"""

from pydantic import BaseModel, Field


class ErrorDetail(BaseModel):
    """
    API Error detail
    """

    field: str | None = Field(None, description="Field name")
    reason: str = Field(..., description="Error message")


class ErrorEnvelope(BaseModel):
    """
    API Error envelope
    """

    code: str = Field(..., description="Error code")
    message: str = Field(..., description="Error message")
    details: list[ErrorDetail] | None = Field(None, description="Error details")
