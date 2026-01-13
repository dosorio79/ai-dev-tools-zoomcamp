"""Deterministic rendering from structured content blocks to Markdown."""

from app.models.agents import ContentBlock


def render_blocks_to_markdown(blocks: list[ContentBlock]) -> str:
    """
    Convert structured content blocks into Markdown expected by the frontend.

    Rules:
    - text      -> plain markdown
    - python    -> fenced python block
    - exercise  -> :::exercise::: block
    """
    parts: list[str] = []

    for block in blocks:
        if block.type == "text":
            parts.append(block.content.strip())
        elif block.type == "python":
            parts.append(
                "```python\n"
                f"{block.content.rstrip()}\n"
                "```"
            )
        elif block.type == "exercise":
            parts.append(
                ":::exercise:::\n"
                f"{block.content.strip()}\n"
                ":::exercise:::"
            )
        else:
            raise ValueError(f"Unsupported block type: {block.type}")

    return "\n\n".join(parts)
