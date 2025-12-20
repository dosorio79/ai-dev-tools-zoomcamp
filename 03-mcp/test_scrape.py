from __future__ import annotations

import sys

from scrape import fetch_page


def main() -> None:
    url = sys.argv[1] if len(sys.argv) > 1 else "https://example.com"
    text = fetch_page(url)
    print(f"Fetched {len(text)} chars from {url}")
    print(text[:1000])


if __name__ == "__main__":
    main()
