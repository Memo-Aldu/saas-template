"""
Shared authentication and authorization helpers.
"""

import json
from collections.abc import Callable
from functools import wraps
from typing import Any, ParamSpec, Protocol, TypeVar

from shared_core.exceptions import ForbiddenError, UnauthorizedError

P = ParamSpec("P")
R = TypeVar("R")


class SupportsCurrentEvent(Protocol):
    """Protocol for Powertools resolvers/routers that expose the current event."""

    @property
    def current_event(self) -> Any: ...


def _context_value(source: Any, *names: str) -> Any:
    """Read a value from an event helper using snake_case or camelCase names."""
    for name in names:
        if hasattr(source, name):
            value = getattr(source, name)
            if value is not None:
                return value
    return None


def claims_from_context(context: SupportsCurrentEvent) -> dict[str, Any]:
    """Extract Cognito claims from the current API Gateway REST request."""
    claims = context.current_event.request_context.authorizer.claims
    if not claims:
        raise UnauthorizedError("Authentication is required for this endpoint.")
    return claims


def identity_from_context(context: SupportsCurrentEvent) -> dict[str, Any]:
    """Extract IAM identity details from the current API Gateway REST request."""
    identity = context.current_event.request_context.identity

    data = {
        "account_id": _context_value(identity, "account_id", "accountId"),
        "access_key": _context_value(identity, "access_key", "accessKey"),
        "caller": _context_value(identity, "caller"),
        "source_ip": _context_value(identity, "source_ip", "sourceIp"),
        "user": _context_value(identity, "user"),
        "user_arn": _context_value(identity, "user_arn", "userArn"),
    }

    if not any([data["user_arn"], data["user"], data["caller"], data["access_key"]]):
        raise UnauthorizedError("IAM authentication is required for this endpoint.")

    return data


def normalize_groups(raw_groups: Any) -> list[str]:
    """Normalize Cognito group claims into a predictable lowercase list."""
    if raw_groups is None:
        return []

    if isinstance(raw_groups, list):
        return [
            str(group).strip().lower() for group in raw_groups if str(group).strip()
        ]

    if isinstance(raw_groups, str):
        value = raw_groups.strip()
        if not value:
            return []

        if value.startswith("[") and value.endswith("]"):
            try:
                parsed = json.loads(value)
            except json.JSONDecodeError:
                parsed = [item.strip() for item in value.strip("[]").split(",")]
            return normalize_groups(parsed)

        if "," in value:
            return [item.strip().lower() for item in value.split(",") if item.strip()]

        return [value.lower()]

    normalized = str(raw_groups).strip().lower()
    return [normalized] if normalized else []


def get_current_claims(context: SupportsCurrentEvent) -> dict[str, Any]:
    """Return claims for the currently authenticated user."""
    return claims_from_context(context)


def has_group(claims: dict[str, Any], group_name: str) -> bool:
    """Return whether the caller belongs to the requested Cognito group."""
    expected_group = group_name.strip().lower()
    return expected_group in normalize_groups(claims.get("cognito:groups"))


def require_group(context: SupportsCurrentEvent, group_name: str) -> dict[str, Any]:
    """Require membership in a Cognito group before continuing."""
    claims = claims_from_context(context)

    if not has_group(claims, group_name):
        raise ForbiddenError(
            "You do not have access to this endpoint.",
            details={"required_group": group_name},
        )

    return claims


def requires_authenticated(
    context: SupportsCurrentEvent,
) -> Callable[[Callable[P, R]], Callable[P, R]]:
    """Decorator that requires Cognito-authenticated API Gateway claims."""

    def decorator(handler: Callable[P, R]) -> Callable[P, R]:
        @wraps(handler)
        def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
            kwargs.setdefault("auth_claims", claims_from_context(context))
            return handler(*args, **kwargs)

        return wrapper

    return decorator


def requires_group(
    context: SupportsCurrentEvent, group_name: str
) -> Callable[[Callable[P, R]], Callable[P, R]]:
    """Decorator that requires Cognito group membership."""

    def decorator(handler: Callable[P, R]) -> Callable[P, R]:
        @wraps(handler)
        def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
            kwargs.setdefault("auth_claims", require_group(context, group_name))
            return handler(*args, **kwargs)

        return wrapper

    return decorator


def requires_iam_identity(
    context: SupportsCurrentEvent,
) -> Callable[[Callable[P, R]], Callable[P, R]]:
    """Decorator that requires API Gateway IAM identity context."""

    def decorator(handler: Callable[P, R]) -> Callable[P, R]:
        @wraps(handler)
        def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
            kwargs.setdefault("iam_identity", identity_from_context(context))
            return handler(*args, **kwargs)

        return wrapper

    return decorator
