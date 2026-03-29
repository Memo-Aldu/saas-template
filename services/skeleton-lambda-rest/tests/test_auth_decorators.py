"""
Unit tests for shared auth decorators.
"""

import pytest

from shared_core.auth import (
    requires_authenticated,
    requires_group,
    requires_iam_identity,
)
from shared_core.exceptions import ForbiddenError, UnauthorizedError


class _Identity:
    def __init__(self, **kwargs) -> None:
        self.__dict__.update(kwargs)


class _Authorizer:
    def __init__(self, claims=None) -> None:
        self.claims = claims


class _RequestContext:
    def __init__(self, claims=None, identity=None) -> None:
        self.authorizer = _Authorizer(claims)
        self.identity = _Identity(**(identity or {}))


class _Event:
    def __init__(self, claims=None, identity=None) -> None:
        self.request_context = _RequestContext(claims, identity)


class _Context:
    def __init__(self, claims=None, identity=None) -> None:
        self.current_event = _Event(claims, identity)


def test_requires_authenticated_allows_valid_claims() -> None:
    """requires_authenticated should pass claims through to the handler."""
    context = _Context(claims={"sub": "user-123"})

    @requires_authenticated(context)
    def handler(*, auth_claims: dict[str, str]) -> str:
        return auth_claims["sub"]

    assert handler(auth_claims={"sub": "user-123"}) == "user-123"


def test_requires_authenticated_rejects_missing_claims() -> None:
    """requires_authenticated should raise if claims are missing."""
    context = _Context()

    @requires_authenticated(context)
    def handler() -> str:
        return "ok"

    with pytest.raises(UnauthorizedError):
        handler()


def test_requires_group_allows_matching_group() -> None:
    """requires_group should pass claims through to the handler."""
    context = _Context(claims={"cognito:groups": ["admin"]})

    @requires_group(context, "admin")
    def handler(*, auth_claims: dict[str, list[str]]) -> list[str]:
        return auth_claims["cognito:groups"]

    assert handler(auth_claims={"cognito:groups": ["admin"]}) == ["admin"]


def test_requires_group_rejects_non_members() -> None:
    """requires_group should raise if the caller is not in the required group."""
    context = _Context(claims={"cognito:groups": ["viewer"]})

    @requires_group(context, "admin")
    def handler() -> str:
        return "ok"

    with pytest.raises(ForbiddenError):
        handler()


def test_requires_iam_identity_allows_signed_requests() -> None:
    """requires_iam_identity should pass IAM identity through to the handler."""
    context = _Context(identity={"userArn": "arn:aws:iam::123456789012:role/example"})

    @requires_iam_identity(context)
    def handler(*, iam_identity: dict[str, str | None]) -> str | None:
        return iam_identity["user_arn"]

    assert (
        handler(iam_identity={"user_arn": "arn:aws:iam::123456789012:role/example"})
        == "arn:aws:iam::123456789012:role/example"
    )


def test_requires_iam_identity_rejects_missing_identity() -> None:
    """requires_iam_identity should raise if IAM identity is missing."""
    context = _Context(identity={"sourceIp": "127.0.0.1"})

    @requires_iam_identity(context)
    def handler() -> str:
        return "ok"

    with pytest.raises(UnauthorizedError):
        handler()
