#!/usr/bin/env python3
"""Create commits from analysis groups in priority order."""
import json
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[4]
ANALYSIS_PATH = Path("/Users/yuseonju/.cursor/projects/Users-yuseonju-cluvit-app-user/agent-tools/c4f49c3f-259c-4b4d-bb25-327e4eff7e74.txt")
GENERATE_SCRIPT = Path(__file__).parent / "generate_commit_message.py"
HIDDEN_PREFIXES = ("agents/", "claude/", "specify/", "husky/", "vscode/", "storybook/")


def resolve_path(p: str) -> str:
    """Ensure path exists; prepend dot for known hidden dirs if needed."""
    if (REPO_ROOT / p).exists():
        return p
    for prefix in HIDDEN_PREFIXES:
        if p.startswith(prefix):
            dotted = "." + p
            if (REPO_ROOT / dotted).exists():
                return dotted
    return p


def main():
    with open(ANALYSIS_PATH) as f:
        data = json.load(f)
    groups = data["groups"]
    indexed = [(i, g) for i, g in enumerate(groups)]
    indexed.sort(key=lambda x: (x[1].get("priority", 99), x[0]))
    created = []
    for idx, group in indexed:
        files = [resolve_path(f["path"]) for f in group["files"]]
        result = subprocess.run(
            [sys.executable, str(GENERATE_SCRIPT), json.dumps(group, ensure_ascii=False)],
            capture_output=True,
            text=True,
            cwd=REPO_ROOT,
        )
        if result.returncode != 0:
            print(f"Failed to generate message for group {idx}: {result.stderr}", file=sys.stderr)
            continue
        out = json.loads(result.stdout)
        subject = out["message"].strip().lower()
        add_result = subprocess.run(
            ["git", "add", "--"] + files,
            cwd=REPO_ROOT,
            capture_output=True,
            text=True,
        )
        if add_result.returncode != 0:
            print(f"git add failed: {add_result.stderr}", file=sys.stderr)
            continue
        commit_result = subprocess.run(
            ["git", "commit", "-m", subject],
            cwd=REPO_ROOT,
            capture_output=True,
            text=True,
        )
        if commit_result.returncode != 0:
            if "nothing added" in commit_result.stderr or "no changes added" in commit_result.stderr or "working tree clean" in commit_result.stderr:
                continue
            print(f"git commit failed: {commit_result.stderr}", file=sys.stderr)
            continue
        log_result = subprocess.run(
            ["git", "rev-parse", "HEAD"],
            cwd=REPO_ROOT,
            capture_output=True,
            text=True,
        )
        short_hash = log_result.stdout.strip()[:7] if log_result.returncode == 0 else "?"
        created.append((short_hash, subject))
    print(json.dumps({"created": len(created), "commits": created}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
