"""Secrets utilities"""

import json

import boto3


def get_secret_value(secret_id: str) -> dict:
    """
    Get a secret value
    Args:
        secret_id (str): Secret ID
    Returns:
        dict: Secret value
    """
    client = boto3.client("secretsmanager")
    response = client.get_secret_value(SecretId=secret_id)
    secret_string = response.get("SecretString", "{}")
    return json.loads(secret_string)
