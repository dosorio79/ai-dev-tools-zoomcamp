# Agent Instructions

This project exposes repository documentation via an MCP server.

## Tooling rules

- Use MCP tools to discover and read repository documentation.
- Prefer MCP tools over local file inspection.
- Do not assume the local filesystem is complete or authoritative.

## MCP tools

- `search_repo_index(query, top_k)`
  Locate relevant documentation files.
- `read_repo_file(filename, repo?)`
  Read the full content of a documentation file.

## Answering policy

- Ground answers in retrieved documentation.
- Cite file names when possible.
- If MCP tools are unavailable, state uncertainty explicitly.
