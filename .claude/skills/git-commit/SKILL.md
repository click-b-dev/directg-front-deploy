---
name: git-commit
description: Analyze git changes and create organized, scoped commits automatically. Use when (1) user has multiple uncommitted changes that should be separated into logical commits, (2) user asks to commit changes with automatic analysis, (3) user wants to split changes by scope/feature/type, or (4) user requests Conventional Commits formatting. Automatically groups related files, detects commit types (feat/fix/refactor/docs/etc), optimizes commit order based on dependencies, and generates descriptive commit messages following Conventional Commits specification.
version: 1.0.0
---

# Smart Git Commit

Automatically analyze git changes, group them by scope and type, and create well-organized commits following Conventional Commits specification.

## Core Workflow

### 1. Analyze Changes

Run the analysis script to group changes:

```bash
python3 .claude/skills/git-commit/scripts/analyze_changes.py
```

**Output**: JSON containing grouped changes with:

- `groups[]`: Array of commit groups
  - `type`: Conventional Commit type (feat/fix/refactor/docs/style/test/chore/perf)
  - `scope`: Inferred scope from file paths (e.g., "features/auth", "shared/ui")
  - `files[]`: List of files in this group with diff summaries
  - `priority`: Commit order priority (0 = first)
  - `layer`: FSD layer if applicable

**Grouping Logic**:

- Files with same commit type + scope are grouped together
- Commit type detected from file path, file content, and diff patterns
- Priority ensures dependencies commit first (package.json → shared → entities → features → pages)

### 2. Review Groups

Present the grouped changes to the user for review:

```
Found {total_files} changed files grouped into {group_count} commits:

Group 1: {type}({scope}): {description}
  Priority: {priority}
  Files: {file_count}
  - {filepath} (+{additions}/-{deletions})
  - ...

Group 2: ...
```

**IMPORTANT — 반드시 사용자 확인을 받은 후 진행한다.**

사용자에게 질문: "이 순서대로 커밋합니다. 진행할까요? (yes/edit/cancel)"

- `yes` → Step 3으로 진행
- `edit` → 사용자가 그룹 수정 요청을 하면 반영 후 다시 보여줌
- `cancel` → 커밋 중단

**절대로 사용자 응답 없이 커밋을 생성하지 않는다.**

### 3. Generate Commit Messages

For each group, generate a commit message:

```bash
python3 .claude/skills/git-commit/scripts/generate_commit_message.py '{group_json}'
```

**Output**: JSON with:

- `message`: Commit subject line (type(scope): description)
- `body`: Detailed commit body with file list and change counts
- `full_message`: Complete commit message

**Message Format**:

```
{type}({scope}): {description}

변경된 파일: {count}개
총 변경사항: +{additions} -{deletions}

파일 목록:
  - {file1} (+{add}/-{del})
  - {file2} (+{add}/-{del})
  ...
```

### 4. Create Commits

**IMPORTANT: Step 2에서 사용자가 `yes`로 승인한 경우에만 실행한다. 승인 없이 커밋 금지.**

For each group in priority order:

1. Stage the files:

```bash
git add {file1} {file2} ...
```

2. Create commit with generated message:

```bash
git commit -m "{commit_message}"
```

**Important**: Do NOT add `Co-Authored-By` trailer to commit messages.

**⛔ CRITICAL: `--no-verify` 절대 금지**

- `git commit --no-verify`를 **절대로 사용하지 않는다.**
- pre-commit 훅이 실패하면, 훅 에러의 원인을 분석하여 사용자에게 보고한다.
- 에러가 이번 변경과 무관한 기존 문제(다른 브랜치 싱크 문제 등)인 경우, 사용자에게 상황을 설명하고 해결 방법(develop 머지 등)을 제안한다.
- 사용자가 **직접 명시적으로** `--no-verify`를 요청한 경우에만 예외적으로 허용한다.
- AI가 스스로 판단하여 `--no-verify`를 제안하거나 실행하는 것은 금지한다.
- `--no-verify`로 커밋하는 경우, 커밋 body에 반드시 다음을 포함한다:
  ```
  ⚠️ --no-verify: pre-commit 훅을 건너뛴 커밋입니다.
  사유: {훅 실패 원인 간략 설명}
  ```

3. Show commit result to user

### 5. Summary

After all commits:

```
✅ Created {count} commits:
  - {commit_hash}: {commit_message_1}
  - {commit_hash}: {commit_message_2}
  ...

Run `git log` to review commits.
```

## Commit Type Detection

The script automatically detects Conventional Commit types based on:

**File-based detection**:

- `.test.`, `.spec.`, `__tests__/` → `test`
- `README`, `.md`, `docs/` → `docs`
- `package.json`, lock files → `chore`

**Content-based detection**:

- New files → `feat`
- Keywords in diff: "fix", "bug", "error" → `fix`
- Keywords: "refactor", "restructure" → `refactor`
- Performance keywords → `perf`

**Default**: `chore`

## Commit Order Optimization

Files are prioritized to ensure dependencies commit first:

0. Dependencies (`package.json`, lock files)
1. Config files (`tsconfig.json`, `vite.config.*`, `.env`)
2. Shared layer (`src/shared/`, `src/lib/`)
3. Entities layer (`src/entities/`)
4. Features layer (`src/features/`)
5. Widgets layer (`src/widgets/`)
6. Pages/Routes layer (`src/pages/`, `src/routes/`)
7. Other files (default priority: 99)

## Scope Extraction

Scope is extracted from file paths:

- `src/features/auth/LoginForm.tsx` → scope: `features/auth`
- `src/shared/ui/Button.tsx` → scope: `shared/ui`
- `docs/api.md` → scope: `docs`
- `package.json` → scope: `deps` or no scope

Scopes are automatically shortened if too long (e.g., `features/auth/components` → `features/...`).

## Examples

**Example 1: Multiple Features**

```
User: "커밋 작성해줘"

Assistant runs: python3 .claude/skills/git-commit/scripts/analyze_changes.py

Output:
{
  "total_files": 8,
  "groups": [
    {
      "type": "feat",
      "scope": "features/auth",
      "files": [
        {"path": "src/features/auth/LoginForm.tsx", "diff_summary": {...}},
        {"path": "src/features/auth/api.ts", "diff_summary": {...}}
      ],
      "priority": 4
    },
    {
      "type": "feat",
      "scope": "shared/ui",
      "files": [
        {"path": "src/shared/ui/Button.tsx", "diff_summary": {...}}
      ],
      "priority": 2
    }
  ]
}

Assistant presents:
"Found 8 changed files grouped into 2 commits:

Group 1 (Priority 2): feat(shared/ui): Button.tsx 추가
  Files: 1
  - src/shared/ui/Button.tsx (+50/-0)

Group 2 (Priority 4): feat(features/auth): 로그인 기능 구현
  Files: 2
  - src/features/auth/LoginForm.tsx (+120/-0)
  - src/features/auth/api.ts (+45/-0)

Commits will be created in this order (shared first, then features).
Proceed? (yes/edit/cancel)"

User: "yes"

Assistant creates commits in order.
```

**Example 2: Mixed Types**

```
Changes include:
- src/shared/ui/Button.tsx (new component)
- src/features/auth/LoginForm.tsx (bug fix)
- README.md (documentation update)
- package.json (dependency update)

Groups:
1. chore(deps): package.json 업데이트 (Priority 0)
2. docs: README 업데이트 (Priority 99)
3. feat(shared/ui): Button 컴포넌트 추가 (Priority 2)
4. fix(features/auth): 로그인 폼 오류 수정 (Priority 4)
```

## Error Handling

If analysis fails:

- Check git status: `git status`
- Verify repository has changes
- Check script permissions: `chmod +x .claude/skills/git-commit/scripts/*.py`

If grouping seems wrong:

- User can request regrouping with different criteria
- User can manually specify which files go together
- Fall back to manual commit workflow
