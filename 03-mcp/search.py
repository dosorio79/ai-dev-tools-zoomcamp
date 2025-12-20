import requests
import os
import zipfile
from pathlib import PurePosixPath


def download_zip_file_from_url(url: str, path: str, filename: str) -> None:
    """
    Download a ZIP file from a URL and save it locally if it does not already exist.

    Args:
        url (str): URL of the ZIP file.
        path (str): Local directory where the ZIP will be saved.
        filename (str): Name of the ZIP file (must end with .zip).
    """
    if not filename.endswith(".zip"):
        raise ValueError("Filename must end with .zip")

    os.makedirs(path, exist_ok=True)
    zip_path = os.path.join(path, filename)

    if os.path.exists(zip_path):
        return  # idempotent by design

    with requests.get(url, stream=True, timeout=30) as response:
        response.raise_for_status()
        with open(zip_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:  # avoid keep-alive chunks
                    f.write(chunk)


def parse_zip_file(path: str, filename: str) -> list[str]:
    """
    Parse a ZIP file and return normalized POSIX paths of Markdown files (.md, .mdx),
    with the top-level directory removed.

    Args:
        path (str): Local directory containing the ZIP file.
        filename (str): ZIP file name.

    Returns:
        list[str]: Normalized POSIX paths of Markdown files.
    """
    zip_file_path = os.path.join(path, filename)
    if not os.path.exists(zip_file_path):
        raise FileNotFoundError(f"The file {zip_file_path} does not exist.")

    md_files: list[str] = []

    with zipfile.ZipFile(zip_file_path, "r") as zip_ref:
        for name in zip_ref.namelist():
            if not name.endswith((".md", ".mdx")):
                continue

            parts = PurePosixPath(name).parts

            # Remove the first path component (e.g. "fastmcp-main/")
            if len(parts) < 2:
                continue

            normalized_path = PurePosixPath(*parts[1:])
            md_files.append(str(normalized_path))

    return md_files



