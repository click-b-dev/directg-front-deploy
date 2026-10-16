# @click-b/scripts

## 역할

SI 프로젝트 스타터 CLI 패키지.
이 패키지는 단순 scaffold 도구가 아니라, 프로젝트 preset, 공통 integration module, manifest, governance check를 제공하는 초기화 도구다.

## 핵심 원칙

- 단일 실행 진입점은 `click-b-scripts`다
- Notion은 기획 소스고, 실제 실행 스펙은 repo 내부 파일을 읽는다
- 옵션보다 preset을 우선한다
- 생성보다 규칙 강제가 중요하다
- 생성기는 자신이 소유하는 파일만 수정한다

## 의존성 규칙

- **허용:** Node.js 내장 모듈
- **허용:** CLI UX 향상에 필요한 경량 외부 패키지. 도입 시 명시적으로 문서화
- **금지:** React, 브라우저 런타임 의존, 앱 번들에 포함되는 패키지
- **금지:** `@click-b/*` 런타임 패키지를 CLI 내부 로직에 직접 의존하는 방식

## 구현 우선순위

1. `create project`
2. `create module`
3. `scaffold entity | feature | widget | screen`
4. `doctor`

## 지원 대상

- SI 프로젝트 preset 기반 앱 생성
- auth, permission, route-guard, api-module 같은 공통 모듈 생성
- FSD `screens` 기준 슬라이스 생성
- manifest 기록 및 self-check

## 코드 컨벤션

- ESM 사용
- 기본은 JavaScript 구현
- 외부 의존은 필요가 검증된 경우에만 추가
- CLI, plan, adapter, manifest 책임을 분리
- 자유형 파일 수정기보다 안전한 제한형 생성기를 우선

## 디렉토리 방향

```text
src/
  cli/         → argv 파싱, 명령 라우팅
  core/        → preset, plan, write, validate, manifest, doctor
  templates/   → 프로젝트/모듈/FSD 템플릿
```

## 명령어 방향

- `click-b-scripts create project`
- `click-b-scripts create module`
- `click-b-scripts scaffold entity`
- `click-b-scripts scaffold feature`
- `click-b-scripts scaffold widget`
- `click-b-scripts scaffold screen`
- `click-b-scripts doctor`

## 주의사항

- FSD 공식 화면 레이어명은 `screens`
- `scaffold page`는 compatibility alias로만 유지
- 생성 결과에는 `.scaffold-manifest.json`을 남긴다
- self-check는 기본 수행이고, `install`만 opt-in이다
