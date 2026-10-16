# Packages Instructions

이 문서는 `packages/*` 하위 Codex 어댑터 공통 규칙을 정의한다. 원본은 각 패키지의 `CLAUDE.md`다.

## 공통 원칙

- 루트 [AGENTS.md](/Users/jaeyoung/repos/click-b/fe-boilerplate/AGENTS.md)의 워크스페이스 규칙을 우선 적용한다.
- 공유 패키지는 앱 도메인 로직을 직접 소유하지 않는다.
- `package.json`의 `exports`와 실제 공개 API가 일치해야 한다.
- 새 public 엔트리를 추가하면 타입 엔트리와 문서도 함께 갱신한다.
- 런타임 패키지는 ESM만 사용한다.
- 테스트나 예제 코드가 패키지 DAG를 우회하지 않도록 주의한다.

## 패키지별 역할 경계

- `types`는 최하위 타입 계약만 소유한다.
- `utils`는 프레임워크 비의존 유틸리티를 소유한다.
- `hook`은 React 훅만 소유하고 JSX를 반환하지 않는다.
- `ui`는 headless UI와 접근성 상호작용만 소유한다.
- `api-client`는 인프라 레벨 HTTP 클라이언트만 소유한다.
- `config`는 설정 파일만 소유한다.
- `scripts`는 CLI와 스캐폴딩만 소유한다.

## 문서 운영

- 패키지 단위 규칙의 원본은 각 `packages/<name>/CLAUDE.md`다.
- 같은 위치의 `AGENTS.md`는 Codex용 요약 어댑터다.
- `MODULES.md`가 있는 패키지는 새 모듈 추가 시 해당 파일도 함께 갱신한다.
