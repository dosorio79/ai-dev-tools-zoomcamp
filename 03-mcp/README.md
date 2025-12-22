# AI Dev Tools Zoomcamp - MCP Server (Homework 3)

This project builds a small MCP server with FastMCP. It downloads documentation
from a GitHub repo, indexes it with `minsearch`, and exposes tools to search the
docs and read files. It also includes a simple web scraping tool backed by Jina
Reader.

## What this server does

- Downloads a repo ZIP and extracts Markdown docs.
- Builds a search index over file paths and content.
- Exposes MCP tools:
  - `scrape(url: str)` fetches page text via Jina Reader.
  - `search_repo_index(query: str, top_k: int = 5)` returns relevant doc snippets.
  - `read_repo_file(filename: str, repo: str | None = None)` returns full file content.

## Project layout

- `main.py` - FastMCP server entrypoint and tool definitions.
- `server_config.yaml` - list of repos to index and storage paths.
- `search.py` - ZIP download, parse, indexing, and search helpers.
- `scrape.py` - Jina Reader fetch helper.
- `config.py` - YAML config loader.
- `data/` - cached ZIPs and index inputs.
- `test_search.py`, `test_scrape.py` - CLI-style sanity checks.

## Prerequisites

- Python 3.11+
- Network access (downloads repo ZIPs and fetches web pages)

## Setup

Use your preferred environment manager. Example with `venv`:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e .
```

If you use `uv`, install deps from `pyproject.toml`:

```bash
uv sync
```

Dependencies are listed in `pyproject.toml`.

## Configure indexed repositories

Edit `server_config.yaml` to point at one or more repos:

```yaml
storage:
  base_dir: data
  zips_dir: data/index

repos:
  - name: fastmcp
    url: https://github.com/jlowin/fastmcp
    branch: master
    docs_extensions:
      - .md
      - .mdx

search:
  snippet_size: 300
```

Notes:
- Each repo is downloaded as a ZIP and cached in `data/index`.
- `docs_extensions` controls which files are indexed.

## Run the MCP server

```bash
python main.py
```

On startup the server:
1. Loads `server_config.yaml`
2. Downloads repo ZIPs (idempotent)
3. Parses Markdown docs
4. Builds the search index
5. Waits for MCP tool calls over STDIO

## Using the tools

These are the server tools exposed to clients:

### `scrape`

Fetch page text via Jina Reader.

- Args: `url` (must start with `http://` or `https://`)
- Returns: raw page text

### `search_repo_index`

Search the indexed docs.

- Args: `query`, `top_k` (default 5)
- Returns: list of `{ "filename", "snippet" }`

### `read_repo_file`

Read a full file from the indexed repo.

- Args: `filename`, optional `repo`
- Returns: file content as string
- If multiple repos have the same filename, you must pass `repo`.

## Quick sanity checks

Run the ad-hoc scripts:

```bash
python test_search.py "demo" 5
python test_scrape.py "https://example.com"
```

These scripts are not unit tests; they just exercise the main code paths.

## Common issues

- If downloads fail, check network access.
- If you change `server_config.yaml`, restart the server to rebuild the index.
- If `read_repo_file` finds multiple matches, pass the `repo` argument.

