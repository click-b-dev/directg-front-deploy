#!/usr/bin/env python3
"""
커밋 메시지 생성 스크립트

그룹화된 변경사항을 기반으로 Conventional Commits 형식의 메시지 생성
"""

import json
import sys
from typing import Dict, List

def generate_commit_message(group: Dict) -> str:
    """
    그룹 정보를 기반으로 커밋 메시지 생성

    형식: <type>(<scope>): <description>
    """
    commit_type = group['type']
    scope = group['scope']
    files = group['files']

    # 스코프 정리 (경로가 너무 길면 축약)
    if '/' in scope:
        parts = scope.split('/')
        if len(parts) > 2:
            scope = f"{parts[0]}/..."

    # 변경사항 설명 생성
    file_count = len(files)
    total_changes = sum(f['diff_summary']['total_changes'] for f in files)

    # 파일명에서 주요 키워드 추출
    filenames = [f['path'].split('/')[-1] for f in files]

    # 타입별 동사 매핑
    action_verbs = {
        'feat': '추가',
        'fix': '수정',
        'refactor': '리팩토링',
        'docs': '문서 업데이트',
        'style': '스타일 변경',
        'test': '테스트 추가',
        'chore': '업데이트',
        'perf': '성능 개선'
    }

    action = action_verbs.get(commit_type, '변경')

    # 설명 생성
    if file_count == 1:
        description = f"{filenames[0]} {action}"
    elif file_count <= 3:
        description = f"{', '.join(filenames)} {action}"
    else:
        # 공통 접두사 찾기
        common_prefix = find_common_prefix([f['path'] for f in files])
        if common_prefix and len(common_prefix) > 5:
            description = f"{common_prefix} 관련 {file_count}개 파일 {action}"
        else:
            description = f"{scope} 관련 {file_count}개 파일 {action}"

    # 메시지 조합
    message = f"{commit_type}"
    if scope and scope != 'root' and scope != 'other':
        message += f"({scope})"
    message += f": {description}"

    # 본문 생성 (변경사항 상세)
    body_lines = []
    body_lines.append(f"\n변경된 파일: {file_count}개")
    body_lines.append(f"총 변경사항: +{sum(f['diff_summary']['additions'] for f in files)} -{sum(f['diff_summary']['deletions'] for f in files)}")
    body_lines.append("\n파일 목록:")

    for file_info in files[:10]:  # 최대 10개까지만 표시
        path = file_info['path']
        diff = file_info['diff_summary']
        body_lines.append(f"  - {path} (+{diff['additions']}/-{diff['deletions']})")

    if file_count > 10:
        body_lines.append(f"  ... 외 {file_count - 10}개 파일")

    body = "\n".join(body_lines)

    return {
        'message': message,
        'body': body,
        'full_message': f"{message}{body}"
    }

def find_common_prefix(paths: List[str]) -> str:
    """파일 경로들의 공통 접두사 찾기"""
    if not paths:
        return ""

    # 경로를 파트로 분리
    path_parts = [p.split('/') for p in paths]

    # 공통 접두사 찾기
    common = []
    for parts in zip(*path_parts):
        if len(set(parts)) == 1:
            common.append(parts[0])
        else:
            break

    return '/'.join(common) if common else ""

def main():
    if len(sys.argv) < 2:
        print("Usage: generate_commit_message.py <group_json>")
        sys.exit(1)

    group_json = sys.argv[1]
    group = json.loads(group_json)

    commit_message = generate_commit_message(group)
    print(json.dumps(commit_message, indent=2, ensure_ascii=False))

if __name__ == '__main__':
    main()
