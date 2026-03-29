# aws-utils

Lightweight AWS helper functions shared across Lambda services.

## What it provides

- `get_boto3_session(region_name=None)`
- `get_s3_client()` with simple process-level caching
- `get_secret_value(secret_id)` for JSON secrets from Secrets Manager

## Usage examples

```python
from aws_utils.s3 import get_s3_client
from aws_utils.secrets import get_secret_value

s3 = get_s3_client()
config = get_secret_value("my/app/config")
```

## Notes

- `get_secret_value` expects `SecretString` to be JSON and returns a `dict`.
- For binary or non-JSON secrets, wrap this helper or add a separate function.
