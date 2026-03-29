"""S3 utilities"""

from functools import lru_cache

import boto3


@lru_cache(maxsize=1)
def get_s3_client() -> boto3.client:
    """
    Get an S3 client
    Returns:
        boto3.client: S3 client
    """
    return boto3.client("s3")
