"""AWS session utilities"""

import boto3


# TODO: Should we cache this?
def get_boto3_session(region_name: str | None = None) -> boto3.session.Session:
    """
    Get a boto3 session
    Args:
        region_name (str | None, optional): AWS region name. Defaults to None.
    Returns:
        boto3.session.Session: boto3 session
    """
    return boto3.session.Session(region_name=region_name)
