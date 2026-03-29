"""
CORS utilities
"""


def cors_headers(
    allow_origin: str, allow_headers: str, allow_methods: str
) -> dict[str, str]:
    """
    Return CORS headers
    Args:
        allow_origin (str): Allow origin
        allow_headers (str): Allow headers
        allow_methods (str): Allow methods
    Returns:
        dict[str, str]: CORS headers
    """
    return {
        "Access-Control-Allow-Origin": allow_origin,
        "Access-Control-Allow-Headers": allow_headers,
        "Access-Control-Allow-Methods": allow_methods,
    }
