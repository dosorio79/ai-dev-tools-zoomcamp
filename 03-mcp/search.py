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
                    
                    
def discover_zip_root(path: str, filename: str) -> str:
    """
    Discover the single top-level directory inside a ZIP file.

    Args:
        path (str): Local directory containing the ZIP file.
        filename (str): ZIP file name.

    Returns:
        str: The root directory name inside the ZIP.

    Raises:
        ValueError: If the ZIP is empty or does not contain a single root directory.
    """
    zip_file_path = os.path.join(path, filename)
    with zipfile.ZipFile(zip_file_path, "r") as zip_ref:
        namelist = zip_ref.namelist()
        if not namelist:
            raise ValueError("The ZIP file is empty.")

        roots = {
            PurePosixPath(name).parts[0]
            for name in namelist
            if PurePosixPath(name).parts
        }

        if len(roots) != 1:
            raise ValueError(f"Expected a single root directory, found: {roots}")

        return roots.pop()
    

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


def create_docs_from_zip_file(
    zip_archive_path: str,
    zip_archive_filename: str,
    root_directory: str,
    markdown_file_paths: list[str],
) -> list[dict[str, str]]:
    """
    Create a list of doc dictionaries mapping normalized markdown paths to file content
    read from a ZIP archive.

    Args:
        zip_archive_path (str): Path to the directory containing the ZIP file.
        zip_archive_filename (str): ZIP file name.
        root_directory (str): Root directory inside the ZIP.
        markdown_file_paths (list[str]): Normalized markdown paths.

    Returns:
        list[dict[str, str]]: [{"file": normalized_path, "content": content}]
    """
    docs_list: list[dict[str, str]] = []
    
    zip_archive_path = os.path.join(zip_archive_path, zip_archive_filename)

    with zipfile.ZipFile(zip_archive_path, "r") as zip_ref:
        for markdown_file_path in markdown_file_paths:
            doc: dict = {}
            zip_entry_path = PurePosixPath(root_directory) / markdown_file_path

            if str(zip_entry_path) not in zip_ref.namelist():
                continue  # defensive; should not happen if earlier steps are correct

            with zip_ref.open(str(zip_entry_path)) as f:
                content = f.read().decode("utf-8", errors="replace")
                doc["filename"] = markdown_file_path
                doc["content"] = content
                docs_list.append(doc)

    return docs_list

from minsearch import Index
def create_search_index(documents: list[dict[str, str]]) -> Index:
    """
    Create a search index from a list of document dictionaries.

    Args:
        documents (list[dict[str, str]]): List of documents with 'filename' and 'content' fields.

    Returns:
        Index: The search index.
    """
    # Sort the documents by filename
    sorted_documents = sorted(documents, key=lambda doc: doc['filename'])

    # Create the search index
    text_fields = ['filename', 'content']
    index = Index(text_fields=text_fields)
    index.fit(sorted_documents)
    return index


def search_index(
    index: Index, query: str, top_k: int = 5
) -> list[dict]:
    """
    Search the minsearch index for the given query and return the top_k results.

    Args:
        index (Index): The search index.
        query (str): The search query.
        top_k (int): Number of top results to return.

    Returns:
        list[dict]: Ranked search results from minsearch.
    """
    # Search the index for the given query
    # and return the top_k results
    return index.search(query, num_results=top_k)
