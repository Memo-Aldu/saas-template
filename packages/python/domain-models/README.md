# domain-models

Shared pydantic models and enums used across services.

## What it provides

- API response models: `SuccessResponse`, `ErrorResponse`, `PaginatedResult[T]`
- Error envelope models: `ErrorEnvelope`, `ErrorDetail`
- Shared enums/events modules for domain contracts

## Why this package exists

Keeping shared request/response and domain contracts in one package:
- reduces duplication across services
- prevents contract drift between producers/consumers
- improves consistency for API and event payloads

## Usage example

```python
from domain_models.api import SuccessResponse

payload = SuccessResponse(
    message="OK",
    data={"service": "orders"},
).model_dump()
```
