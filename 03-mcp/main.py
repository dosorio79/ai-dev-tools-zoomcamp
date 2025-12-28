from pathlib import Path

from fastmcp import FastMCP

from config import create_config
from scrape import fetch_page
from search import (
    download_zip_file_from_url,
    discover_zip_root,
    parse_zip_file,
    create_docs_from_zip_file,
    create_search_index,
    search_index,
)

# ---------------------------------------------------------------------
# MCP initialization
# ---------------------------------------------------------------------

mcp = FastMCP("AI Dev Tools Zoomcamp MCP")

print("Starting MCP server...")

# ---------------------------------------------------------------------
# Load configuration
# ---------------------------------------------------------------------

config = create_config("server_config.yaml")

zips_dir = config["storage"]["zips_dir"]
snippet_size = config.get("search", {}).get("snippet_size", 300)
repos = config["repos"]

Path(zips_dir).mkdir(parents=True, exist_ok=True)

print(f"Configured repositories: {len(repos)}")

# ---------------------------------------------------------------------
# Ingest repositories and collect documents
# ---------------------------------------------------------------------

all_documents: list[dict[str, str]] = []
doc_lookup: dict[tuple[str, str], str] = {}

for repo in repos:
    repo_name = repo["name"]
    repo_url = repo["url"]
    branch = repo.get("branch", "master")
    md_extensions = repo.get("docs_extensions")

    zip_filename = f"{repo_name}.zip"

    print(f"\nIndexing repository: {repo_name}")

    # 1. Download ZIP (idempotent)
    print("  Downloading ZIP...")
    download_zip_file_from_url(
        f"{repo_url}/archive/refs/heads/{branch}.zip",
        zips_dir,
        zip_filename,
    )
    print(f"  ZIP ready: {zip_filename}")

    # 2. Discover ZIP root
    root_dir = discover_zip_root(zips_dir, zip_filename)

    # 3. Parse markdown files
    md_file_paths = parse_zip_file(
        zips_dir,
        zip_filename,
        extensions=md_extensions,
    )
    print(f"  Found {len(md_file_paths)} markdown files")

    # 4. Read contents
    documents = create_docs_from_zip_file(
        zips_dir,
        zip_filename,
        root_dir,
        md_file_paths,
    )
    print(f"  Loaded {len(documents)} documents")

    # Annotate documents with repo name
    for doc in documents:
        doc["repo"] = repo_name
        doc_lookup[(repo_name, doc["filename"])] = doc["content"]

    all_documents.extend(documents)

# ---------------------------------------------------------------------
# Build search index
# ---------------------------------------------------------------------

print(f"\nBuilding search index from {len(all_documents)} documents...")
index = create_search_index(all_documents)
print("Search index ready")

# ---------------------------------------------------------------------
# MCP tools
# ---------------------------------------------------------------------

@mcp.tool
def scrape(url: str) -> str:
    """Fetch page text via Jina Reader."""
    return fetch_page(url)


@mcp.tool
def search_repo_index(query: str, top_k: int = 5):
    """
    Search the repository index for relevant information.

    Args:
        query (str): Search query.
        top_k (int): Number of results to return.

    Returns:
        list[dict]: Search results with filename and snippet.
    """
    results = search_index(index, query, top_k=top_k)

    return [
        {
            "filename": r["filename"],
            "snippet": r["content"][:snippet_size],
        }
        for r in results
    ]


@mcp.tool
def read_repo_file(filename: str, repo: str | None = None) -> str:
    """Read a file from the indexed repository by filename (and optional repo)."""
    if repo is not None:
        content = doc_lookup.get((repo, filename))
        if content is None:
            raise ValueError(f"File not found: {repo}:{filename}")
        return content

    matches = [(r, f) for (r, f) in doc_lookup.keys() if f == filename]
    if not matches:
        raise ValueError(f"File not found: {filename}")
    if len(matches) > 1:
        repos = sorted({r for (r, _) in matches})
        raise ValueError(f"Multiple repos match {filename}: {', '.join(repos)}")

    repo_name = matches[0][0]
    return doc_lookup[(repo_name, filename)]

# ---------------------------------------------------------------------
# Run MCP server
# ---------------------------------------------------------------------

print("\nMCP server is ready. Waiting for tool calls...")
def main()->None:
    mcp.run()
    
if __name__ == "__main__":
    main()
