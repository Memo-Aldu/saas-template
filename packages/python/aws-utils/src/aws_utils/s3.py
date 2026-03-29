"""S3 utilities"""

from functools import lru_cache

import boto3
from botocore.client import BaseClient


@lru_cache(maxsize=1)
def get_s3_client() -> BaseClient:
    """
    Get an S3 client
    Returns:
        BaseClient: S3 client
    """
    return boto3.client("s3")
