"""
API models
"""

from typing import Generic, TypeVar

from pydantic import BaseModel, Field
from domain_models.errors import ErrorDetail

T = TypeVar("T")


class SuccessResponse(BaseModel):
    """
    API Success response
    """

    message: str = Field(..., description="Success message")
    data: dict | None = Field(None, description="Response data")


class ErrorResponse(BaseModel):
    """
    API Error response
    """

    code: str = Field(..., description="Error code")
    message: str = Field(..., description="Error message")
    details: list[ErrorDetail] | None = Field(None, description="Error details")


class PaginatedResult(BaseModel, Generic[T]):
    """
    Paginated result
    """

    items: list[T] = Field(..., description="Items in the current page")
    next_cursor: str | None = Field(..., description="Cursor for the next page")
    total_pages: int | None = Field(..., description="Total number of pages")
    total_items: int | None = Field(..., description="Total number of items")
    page_size: int | None = Field(..., description="Number of items per page")
