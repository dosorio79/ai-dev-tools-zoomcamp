import io
import sys
import unittest
from contextlib import redirect_stdout
from pathlib import Path
from tempfile import TemporaryDirectory

import cli


class TestCliDryRun(unittest.TestCase):
    def test_dry_run_exits_before_agent(self) -> None:
        with TemporaryDirectory() as tmp_dir:
            tmp_path = Path(tmp_dir)
            repo_path = tmp_path / "repo"
            repo_path.mkdir()

            config_dir = tmp_path / "config"
            config_dir.mkdir()

            (config_dir / "agent.yaml").write_text(
                "\n".join(
                    [
                        "model: gpt-4.1-mini",
                        "max_steps: 5",
                        "dry_run: true",
                        "log_level: INFO",
                    ]
                ),
                encoding="utf-8",
            )
            (config_dir / "repository.yaml").write_text(
                "\n".join(
                    [
                        "deny_dirs:",
                        "  - .git",
                        "allowed_extensions:",
                        "  - .py",
                        "  - .md",
                    ]
                ),
                encoding="utf-8",
            )
            (config_dir / "workspace.yaml").write_text(
                f"workspace_root: {repo_path}",
                encoding="utf-8",
            )

            argv = [
                "cli.py",
                "--repo-path",
                str(repo_path),
                "--config-dir",
                str(config_dir),
                "read the README",
            ]

            with redirect_stdout(io.StringIO()) as buf:
                original_argv = sys.argv
                try:
                    sys.argv = argv
                    cli.main()
                finally:
                    sys.argv = original_argv

            output = buf.getvalue()
            self.assertIn("Dry run enabled; no agent execution performed.", output)


if __name__ == "__main__":
    unittest.main()
