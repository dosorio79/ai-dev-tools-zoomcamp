import requests

JINA_READER_PREFIX = "https://r.jina.ai/"


def fetch_page(url: str, timeout: int = 30) -> str:
    """
    Fetch the content of a web page using the Jina render service.

    Args:
        url (str): The URL of the page to fetch.

    Returns:
        str: The HTML content of the page.

    Raises:
        ValueError: If the URL does not start with http or https.
        requests.exceptions.RequestException: If the request to Jina fails.
    """
    # Validate the URL starts with http or https
    if not url.startswith(("http://", "https://")):
        raise ValueError("URL must start with http or https")
    # Construct the full Jina URL
    jina_url = f"{JINA_READER_PREFIX}{url}"
    # Make the GET request to fetch the page content
    response: requests.Response = requests.get(
        jina_url,
        headers={"User-Agent": "Mozilla/5.0"},
        timeout=timeout,
    )
    response.raise_for_status()  # Raise an error for bad responses
    return response.text
