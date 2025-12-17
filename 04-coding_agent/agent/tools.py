"""Filesystem + Django aware helpers exposed as agent tools."""

from __future__ import annotations
from pathlib import Path
from typing import List
from pydantic_ai import Tool, tool

#import yaml settings

def list_files(state: AgentState) -> List[str]:
    """List files in a directory with an optional extension filter."""
    root = state.repository_path
    result: List[str] = []

    for path in root.rglob("*"):
        if path.is_dir() and path.name in DENY_FOLDERS:
            continue
        if any(part in DENY_FOLDERS for part in path.parts):
            continue
        if path.suffix not in ALLOWED_EXTENSIONS:
            continue
        # Get relative path for safety
        rel_path = path.relative_to(root)
        # Append to results
        result.append(str(rel_path))

    result.sort()
    return result
            


read_file(path)

run_django_check()