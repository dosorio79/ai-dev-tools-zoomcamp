# AI Dev Tools Zoomcamp – MCP Server (Homework 3)

This project builds a small MCP server with FastMCP. It downloads documentation
from one or more GitHub repositories, indexes it with `minsearch`, and exposes MCP
tools to search the docs and read files. It also includes a simple web scraping
tool backed by Jina Reader.

## What this server does

- Downloads documentation repositories as ZIP archives.
- Indexes Markdown files using `minsearch`.
- Exposes MCP tools for search and document access:
  - `scrape(url: str)` fetches page text via Jina Reader.
  - `search_repo_index(query: str, top_k: int = 5)` returns relevant doc snippets.
  - `read_repo_file(filename: str, repo: str | None = None)` returns full file content.

## Project layout

- `main.py` – FastMCP server entrypoint and tool definitions.
- `server_config.yaml` – repositories to index and storage/search settings.
- `search.py` – ZIP download, parsing, indexing, and search helpers.
- `scrape.py` – Jina Reader fetch helper.
- `config.py` – YAML configuration loader.
- `data/` – cached ZIP files and intermediate data.
- `test_search.py`, `test_scrape.py` – CLI-style sanity checks.

## Prerequisites

- Python 3.11+
- Network access (downloads repo ZIPs and fetches web pages)
- Node.js (only required to run MCP Inspector)

## Setup

This project is packaged using **uv** and exposes a console entry point.

Install dependencies and the local package:

```bash
uv sync
```

This performs a development install and makes the MCP server available as
the `hw3-mcp` command.

## Configure indexed repositories

Edit `server_config.yaml` to control which repositories are indexed:

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
- Each repository is downloaded as a ZIP and cached in `data/index`.
- `docs_extensions` controls which files are indexed.
- The index is built at server startup.

## Run the MCP server (manual)

You can start the server directly to verify startup and indexing:

```bash
uv run hw3-mcp
```

On startup the server:
1. Loads `server_config.yaml`
2. Downloads repository ZIPs (idempotent)
3. Parses Markdown documentation
4. Builds the search index
5. Waits for MCP tool calls over STDIO

## Demo with MCP Inspector (recommended)

The intended way to interact with this server is via **MCP Inspector**, which
forces tool-based interaction and makes MCP usage explicit.

Start the Inspector and let it launch the server:

```bash
npx @modelcontextprotocol/inspector \
  uv \
  --directory path/to/03-mcp \
  run \
  hw3-mcp
```

In the Inspector UI:
1. Connect using the default `stdio` transport.
2. Open the **Tools** tab.
3. Use:
   - `search_repo_index` to search documentation.
   - `read_repo_file` to retrieve full file contents.

This demonstrates a Context7-style documentation MCP server.

## Using the tools

### `scrape`

Fetch page text via Jina Reader.

- Args: `url` (must start with `http://` or `https://`)
- Returns: raw page text

### `search_repo_index`

Search the indexed documentation.

- Args: `query`, `top_k` (default: 5)
- Returns: list of `{ "filename", "snippet" }`

### `read_repo_file`

Read a full file from the indexed repository.

- Args: `filename`, optional `repo`
- Returns: full file content as a string
- If multiple repos contain the same filename, `repo` must be provided.

## Quick sanity checks

You can exercise the main logic without MCP using the helper scripts:

```bash
python test_search.py "demo" 5
python test_scrape.py "https://example.com"
```

These are not unit tests; they are simple end-to-end checks.

## Common issues

- If downloads fail, check network access.
- If `server_config.yaml` changes, restart the server to rebuild the index.
- If `read_repo_file` reports multiple matches, pass the `repo` argument.
