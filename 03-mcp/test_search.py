from __future__ import annotations

import sys

import search


def main() -> None:
    repo_url = "https://github.com/jlowin/fastmcp/archive/refs/heads/master.zip"
    zip_path = "data/index"
    zip_file = "mcp_index.zip"

    search.download_zip_file_from_url(repo_url, zip_path, zip_file)

    zip_root = search.discover_zip_root(zip_path, zip_file)
    md_files = search.parse_zip_file(zip_path, zip_file)
    docs = search.create_docs_from_zip_file(zip_path, zip_file, zip_root, md_files)

    index = search.create_search_index(docs)

    query = sys.argv[1] if len(sys.argv) > 1 else "demo"
    top_k = int(sys.argv[2]) if len(sys.argv) > 2 else 5
    results = search.search_index(index, query, top_k=top_k)

    print(f"Query: {query}")
    for i, result in enumerate(results):
        print(f"Result {i + 1}:")
        print(f"Filename: {result['filename']}")
        print(f"Content snippet: {result['content'][:200]}...")
        print("-" * 40)

if __name__ == "__main__":
    main()
