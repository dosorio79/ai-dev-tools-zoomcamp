from app.services.markdown_renderer import render_blocks_to_markdown
from app.models.agents import ContentBlock


def test_render_blocks_to_markdown():
    blocks = [
        ContentBlock(type="text", content="Intro text"),
        ContentBlock(type="python", content="print('hi')"),
        ContentBlock(type="exercise", content="Do something"),
    ]

    md = render_blocks_to_markdown(blocks)

    assert "Intro text" in md
    assert "```python" in md
    assert "print('hi')" in md
    assert ":::exercise:::" in md
