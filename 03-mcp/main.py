from fastmcp import FastMCP

from scrape import fetch_page

mcp = FastMCP("AI Dev Tools Zoomcamp MCP")

@mcp.tool
def add(a: int, b: int) -> int:
    """Add two numbers"""
    return a + b


@mcp.tool
def scrape(url: str) -> str:
    """Fetch page text via Jina Reader."""
    return fetch_page(url)

if __name__ == "__main__":
    mcp.run()
