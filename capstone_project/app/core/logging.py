"""Application logging configuration."""

import logging


def setup_logging() -> None:
    """Configure default logging for the app."""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )
