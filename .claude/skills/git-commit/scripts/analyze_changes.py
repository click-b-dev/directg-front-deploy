#!/usr/bin/env python3
"""
Git 변경사항 분석 및 스코프별 그룹핑 스크립트

이 스크립트는:
1. git diff를 분석하여 변경사항을 파악
2. 파일 경로, 변경 유형, 관련성을 기반으로 자동 그룹핑
3. Conventional Commits 타입 자동 분류
4. 커밋 순서 최적화 (의존성 고려)
5. JSON 형태로 결과 출력
"""

import subprocess
import json
import re
from pathlib import Path
from typing import List, Dict, Set, Tuple
from collections import defaultdict

class GitAnalyzer:
    def __init__(self):
        self.commit_types = {
            'feat': ['new', 'add', 'implement', 'create'],
            'fix': ['fix', 'bug', 'error', 'correct', 'resolve'],
            'refactor': ['refactor', 'restructure', 'reorganize', 'simplify'],
            'docs': ['doc', 'readme', 'comment', 'documentation'],
            'style': ['style', 'format', 'prettier', 'lint'],
            'test': ['test', 'spec', 'coverage'],
            'chore': ['chore', 'update', 'upgrade', 'dependency', 'config'],
            'perf': ['perf', 'performance', 'optimize'],
        }

        # FSD 레이어 정의
        self.fsd_layers = ['shared', 'entities', 'features', 'widgets', 'pages', 'app']

        # 우선순위 패턴 (의존성 순서)
        self.priority_patterns = {
            0: [r'package\.json', r'pnpm-lock\.yaml', r'yarn\.lock', r'package-lock\.json'],
            1: [r'tsconfig\.json', r'vite\.config', r'\.env'],
            2: [r'src/shared/', r'src/lib/'],
            3: [r'src/entities/'],
            4: [r'src/features/'],
            5: [r'src/widgets/'],
            6: [r'src/pages/', r'src/routes/'],
        }

    def run_git_command(self, args: List[str]) -> str:
        """Git 명령어 실행"""
        try:
            result = subprocess.run(
                ['git'] + args,
                capture_output=True,
                text=True,
                check=True
            )
            return result.stdout.strip()
        except subprocess.CalledProcessError as e:
            raise Exception(f"Git command failed: {e.stderr}")

    def get_file_status(self) -> Dict[str, str]:
        """파일 상태 가져오기 (staged, unstaged, untracked)"""
        status_output = self.run_git_command(['status', '--porcelain'])
        files = {}

        for line in status_output.split('\n'):
            if not line:
                continue
            status = line[:2]
            filepath = line[3:]

            # 디렉토리는 건너뛰기 (끝에 / 있는 경우) — 나중에 ls-files로 채움
            if filepath.endswith('/'):
                continue

            # 상태 매핑
            if status[0] in ['M', 'A', 'D', 'R', 'C']:
                files[filepath] = 'staged'
            elif status[1] in ['M', 'D']:
                files[filepath] = 'unstaged'
            elif status == '??':
                files[filepath] = 'untracked'

        # untracked 디렉터리 안의 모든 파일 포함 (porcelain은 디렉터리만 표시)
        try:
            ls_output = self.run_git_command(['ls-files', '--others', '--exclude-standard'])
            for filepath in ls_output.split('\n'):
                if filepath and filepath not in files:
                    files[filepath] = 'untracked'
        except Exception:
            pass

        return files

    def get_file_diff(self, filepath: str, staged: bool = False) -> str:
        """특정 파일의 diff 가져오기"""
        try:
            if staged:
                return self.run_git_command(['diff', '--cached', '--', filepath])
            else:
                return self.run_git_command(['diff', '--', filepath])
        except:
            return ""

    def detect_commit_type(self, filepath: str, diff_content: str) -> str:
        """변경사항을 분석하여 Conventional Commit 타입 추론"""
        filepath_lower = filepath.lower()
        diff_lower = diff_content.lower()

        # 파일 경로 기반 추론
        if any(ext in filepath_lower for ext in ['.test.', '.spec.', '__tests__']):
            return 'test'
        if any(doc in filepath_lower for doc in ['readme', '.md', 'docs/']):
            return 'docs'
        if 'package.json' in filepath_lower or 'lock' in filepath_lower:
            return 'chore'

        # diff 내용 기반 추론
        type_scores = defaultdict(int)
        for commit_type, keywords in self.commit_types.items():
            for keyword in keywords:
                type_scores[commit_type] += diff_lower.count(keyword)

        # 새 파일은 feat
        if '+++ /dev/null' not in diff_content and '--- /dev/null' in diff_content:
            return 'feat'

        # 가장 높은 점수의 타입 반환, 없으면 chore
        if type_scores:
            return max(type_scores.items(), key=lambda x: x[1])[0]

        return 'chore'

    def get_fsd_layer(self, filepath: str) -> str:
        """FSD 레이어 추출"""
        for layer in self.fsd_layers:
            if f'/src/{layer}/' in filepath or f'src/{layer}/' in filepath:
                return layer
        return 'other'

    def get_file_priority(self, filepath: str) -> int:
        """파일 우선순위 계산 (낮을수록 먼저 커밋)"""
        for priority, patterns in self.priority_patterns.items():
            if any(re.search(pattern, filepath) for pattern in patterns):
                return priority
        return 99  # 기본 우선순위

    def extract_scope_from_path(self, filepath: str) -> str:
        """파일 경로에서 스코프 추출"""
        parts = Path(filepath).parts

        # src/features/auth/... -> features/auth
        # src/shared/ui/... -> shared/ui
        if 'src' in parts:
            src_idx = parts.index('src')
            if len(parts) > src_idx + 2:
                return '/'.join(parts[src_idx+1:src_idx+3])
            elif len(parts) > src_idx + 1:
                return parts[src_idx+1]

        # 폴더 구조 기반 스코프
        if len(parts) >= 2:
            return '/'.join(parts[:2])

        return parts[0] if parts else 'root'

    def group_related_files(self, files: Dict[str, Dict]) -> List[Dict]:
        """관련된 파일들을 그룹핑"""
        groups = defaultdict(lambda: {
            'files': [],
            'type': 'chore',
            'scope': '',
            'priority': 99,
            'layer': 'other'
        })

        for filepath, file_info in files.items():
            scope = self.extract_scope_from_path(filepath)
            commit_type = file_info['type']
            priority = file_info['priority']
            layer = file_info['layer']

            # 그룹 키: type + scope
            group_key = f"{commit_type}:{scope}"

            groups[group_key]['files'].append({
                'path': filepath,
                'status': file_info['status'],
                'diff_summary': file_info['diff_summary']
            })
            groups[group_key]['type'] = commit_type
            groups[group_key]['scope'] = scope
            groups[group_key]['priority'] = min(groups[group_key]['priority'], priority)
            groups[group_key]['layer'] = layer

        # 우선순위 기반 정렬
        sorted_groups = sorted(groups.values(), key=lambda x: (x['priority'], x['type']))

        return sorted_groups

    def count_file_lines(self, filepath: str) -> int:
        """파일의 라인 수 계산 (untracked 파일용)"""
        try:
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                return sum(1 for _ in f)
        except:
            return 0

    def analyze_diff_summary(self, diff: str, filepath: str = '', is_untracked: bool = False) -> Dict:
        """diff를 분석하여 요약 정보 추출"""
        if is_untracked and filepath:
            # untracked 파일은 모든 라인이 추가
            line_count = self.count_file_lines(filepath)
            return {
                'additions': line_count,
                'deletions': 0,
                'total_changes': line_count
            }

        lines = diff.split('\n')
        added = sum(1 for line in lines if line.startswith('+') and not line.startswith('+++'))
        removed = sum(1 for line in lines if line.startswith('-') and not line.startswith('---'))

        return {
            'additions': added,
            'deletions': removed,
            'total_changes': added + removed
        }

    def analyze(self) -> Dict:
        """전체 분석 프로세스"""
        file_statuses = self.get_file_status()

        if not file_statuses:
            return {
                'error': 'No changes detected',
                'groups': []
            }

        # 각 파일 분석
        files_info = {}
        for filepath, status in file_statuses.items():
            is_untracked = status == 'untracked'
            staged = status == 'staged'
            diff = self.get_file_diff(filepath, staged)

            commit_type = (
                'feat'
                if (is_untracked and not diff.strip())
                else self.detect_commit_type(filepath, diff)
            )
            files_info[filepath] = {
                'status': status,
                'type': commit_type,
                'priority': self.get_file_priority(filepath),
                'layer': self.get_fsd_layer(filepath),
                'diff_summary': self.analyze_diff_summary(diff, filepath, is_untracked)
            }

        # 그룹핑
        groups = self.group_related_files(files_info)

        return {
            'total_files': len(file_statuses),
            'groups': groups,
            'status': 'success'
        }

def main():
    analyzer = GitAnalyzer()
    result = analyzer.analyze()
    print(json.dumps(result, indent=2, ensure_ascii=False))

if __name__ == '__main__':
    main()
