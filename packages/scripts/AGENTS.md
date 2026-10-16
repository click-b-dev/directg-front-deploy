# @click-b/scripts

상위 [packages/AGENTS.md](/Users/jaeyoung/repos/click-b/fe-boilerplate/packages/AGENTS.md)와 루트 [AGENTS.md](/Users/jaeyoung/repos/click-b/fe-boilerplate/AGENTS.md)를 함께 따르되, 충돌 시 [CLAUDE.md](/Users/jaeyoung/repos/click-b/fe-boilerplate/packages/scripts/CLAUDE.md)를 우선한다.

## 역할

SI 프로젝트 스타터 CLI 패키지다. scaffold 도구를 넘어서 preset, integration module, manifest, governance check를 제공한다.

## 핵심 원칙

- 단일 실행 진입점은 `click-b-scripts`다.
- Notion은 기획 소스이고 실제 실행 스펙은 repo 내부 파일을 읽는다.
- 옵션보다 preset을 우선한다.
- 생성보다 규칙 강제가 중요하다.
- 생성기는 자신이 소유하는 파일만 수정한다.

## 코드 규칙

- ESM 사용
- 기본은 JavaScript 구현
- CLI, plan, adapter, manifest 책임을 분리
- 자유형 수정기보다 제한형 생성기를 우선

## 주의사항

- FSD 화면 레이어명은 `screens`를 표준으로 유지한다.
- `scaffold page`는 compatibility alias로만 유지한다.
- 생성 결과에는 `.scaffold-manifest.json`을 남긴다.
