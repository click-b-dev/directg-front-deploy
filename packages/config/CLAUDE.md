# @click-b/config

## 역할

모노레포 전체의 ESLint, TypeScript, Prettier, Tailwind 설정을 중앙 관리하는 설정 전용 패키지.

## 의존성 규칙

- **허용:** 외부 ESLint/Prettier 플러그인만
- **금지:** @click-b/\* 패키지 일체 (config는 DAG 독립)
- 런타임 코드 없음 — devDependencies만 존재

## Export 맵

| import 경로                              | 용도                               | 파일                        |
| ---------------------------------------- | ---------------------------------- | --------------------------- |
| `@click-b/config/eslint/base`            | TS + Prettier 기본                 | eslint/base.js              |
| `@click-b/config/eslint/react`           | base + React/Hooks                 | eslint/react.js             |
| `@click-b/config/eslint/next`            | react + .next 무시                 | eslint/next.js              |
| `@click-b/config/eslint/tanstack`        | react + routeTree.gen.ts 무시      | eslint/tanstack.js          |
| `@click-b/config/prettier`               | 공용 Prettier 설정                 | prettier/index.js           |
| `@click-b/config/tsconfig/base`          | strict, ES2022, bundler resolution | tsconfig/base.json          |
| `@click-b/config/tsconfig/react-app`     | base + DOM, react-jsx, noEmit      | tsconfig/react-app.json     |
| `@click-b/config/tsconfig/react-library` | base + DOM, react-jsx, outDir:dist | tsconfig/react-library.json |
| `@click-b/config/tsconfig/next`          | react-app + next plugin            | tsconfig/next.json          |
| `@click-b/config/tailwind/base`          | 기본 Tailwind config               | tailwind/base.js            |

## 코드 컨벤션

- 모든 ESLint 설정은 flat config (eslint.config.js) 포맷
- tsconfig는 JSON 파일, extends로 상속 구조
- 새 설정 추가 시 반드시 package.json exports에 경로 등록
- 앱에서는 `@click-b/config/eslint/react` 형태로 import (직접 파일 경로 금지)

## 파일 구조

```
eslint/
  base.js           → TypeScript + Prettier 기본 설정
  react.js          → base + React/Hooks 규칙
  next.js           → react + .next 디렉토리 무시
  tanstack.js       → react + routeTree.gen.ts 무시
prettier/
  index.js          → 공용 Prettier 설정 (semi, double quotes, printWidth 100)
tsconfig/
  base.json         → strict, ES2022, bundler module resolution
  react-app.json    → base + DOM, react-jsx, noEmit
  react-library.json → base + DOM, react-jsx, outDir:dist
  next.json         → react-app + next plugin
tailwind/
  base.js           → 기본 Tailwind CSS v4 config
```

## 명령어

이 패키지는 빌드 대상이 아님. 설정 파일만 제공.

## 주의사항

- 이 패키지에 런타임 코드(React, 유틸리티 등)를 추가하지 않는다
- ESLint 10 flat config 사용 — .eslintignore 파일 사용 불가, eslint.config.js의 ignores 사용
- Prettier 설정 변경 시 모든 앱에 영향 — 신중하게 변경
- tsconfig 변경 시 모든 하위 tsconfig에 전파됨
