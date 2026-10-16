---
name: client-migration-unit
description: legacy PHP 스토어프론트(pc/·mobile/)를 apps/directg-client(Next.js App Router)로 단위 이관할 때 사용. "client 이관", "스토어프론트 이관", "pc/ 이관", "다음 단위 진행", MIGRATION-MAP의 client(스토어프론트) 단위 착수 시 트리거. 단위당 분석→API 계약→구현→셀프 검증→게이트 정지의 5단계 루프를 강제한다.
---

# Client(스토어프론트) 단위 이관 루프

`php-to-nextjs-migration` 스킬의 스토어프론트 특화 버전 (admin은 `admin-migration-unit`). 대상: legacy `pc/`(먼저) · `mobile/`(후속) → `apps/directg-client` (Next.js 15 App Router, **SSR/SEO**, FSD).

## 철칙 (php-to-nextjs-migration에서 계승, 타협 불가)

1. **동작 동일성만이 성공 기준.** 개선·신기능·리팩토링·성능/UX/a11y/번들 최적화 금지. legacy 버그도 그대로 이식 (의도적 변경은 사용자에게 먼저 질문).
2. **한 번에 한 단위.** 단위 = 화면 1개 / 공통 컴포넌트 1개 / 기능 1개. 현재 단위가 게이트를 통과하기 전 다음 단위 착수 금지.
3. **이해 후 변경.** 분석 문서를 완성하기 전에 구현 코드를 작성하지 않는다.
4. **legacy는 read-only.** `../legacy-project`를 절대 수정하지 않는다.
5. **데이터는 API 계약 경유.** 프론트는 `packages/api-client`로만 호출. SQL/세션 로직은 API 계약 문서에 백엔드 책임으로 기술한다.

### client 특화 주의 영역 (parity 판정에 포함)

- **SSR/SEO 동일성.** URL/라우트 구조, `<title>`/meta/canonical/OG, 구조화 데이터, robots 노출을 legacy와 동일하게 재현한다. directg-client의 존재 이유가 SSR/SEO다 — 이것도 동작이다. SEO 관련 화면은 `semantic-markup` 스킬을 참조. 근거: `../legacy-project/docs/SEO-CHANNEL.md`.
- **결제(PG) 흐름.** `pc/api/{kcp,toss,naver,payco,kakao}/` 및 `pc/order/*` 결제 플로우는 parity 최우선. 임의 변경 절대 금지. 결제 이관은 착수 전 사용자 게이트. 근거: `../legacy-project/docs/PAYMENT-APPROVAL.md`, `ORDER-WORKFLOW-AUDIT.md`.
- **회원 세션/인증.** `$_SESSION['member']` 재현 방식은 **미정**(MIGRATION-MAP 참조). 임의로 JWT/쿠키 방식을 결정하지 않는다 — 첫 인증 단위 착수 시 사용자 확인.

### Red Flags — 이 생각이 들면 멈춘다

- "이왕 옮기는 김에 UI 개선" → ❌ legacy 마크업/플로우 그대로.
- "Bootstrap 5.3.5 낡았으니 최신으로" → ❌ 동일 버전·동일 CDN URL·integrity 그대로 (버전업 = 회귀). `docs/design-system/client.md`.
- "SEO 겸사겸사 개선" → ❌ meta/구조화데이터도 legacy 동일. 개선은 회귀.
- "결제 흐름 이 정도면 알겠으니 바로 구현" → ❌ 결제는 게이트. 분석·사용자 확인 먼저.
- "세션은 JWT가 낫지" → ❌ 방식 미정. 임의 결정 금지.
- "화면 3개 묶어서 한 커밋" → ❌ 한 단위 = 한 커밋.
- "PHP 대충 봤으니 바로 구현" → ❌ 분석 문서 먼저.
- "게이트 생략하고 다음 단위" → ❌ 개발자 승인 없이 ✅ 금지.
- "legacy가 PHP니까 JS도 PHP처럼 옮기자" → ❌ **동작은 동일, 코드는 idiomatic JS/TS.** PHP 구문 기계적 전사 금지(③ 참조).

## 단위 루프 (순차, 생략 불가)

### ① 분석
- legacy 파일 확인: 헤더/푸터 등 세대 공존 변형(`footer.html`/`footer2.html`/`footer_new.html` 등) 중 **라이브 버전**을 먼저 판별 (`pc/index.php`가 실제 include하는 것 기준).
- 파악 항목: 진입 URL/파라미터, 화면 요소, 폼 필드·검증, 플로우(리다이렉트/분기), 사용 도메인 클래스·SQL 요약, 세션 의존, AJAX(`*_json.php`)/POST(`*_ps.php`) 호출.
- **client 추가**: 해당 화면의 실제 로드 자산(페이지별 `page/*.css`, head meta/SEO), SSR/CSR 필요 구간, 결제/세션 의존 여부.
- 참조: `docs/design-system/client.md`, `../legacy-project/docs/`(PROJECT-OVERVIEW, SEO-CHANNEL, 도메인 문서).
- 산출물: `docs/migration/storefront/<area>/<unit>.md` — 아래 템플릿 사용.

### ② API 계약
- SQL·로직에서 엔드포인트 스펙 도출: method/path/요청/응답/에러 코드. legacy 에러 문자열과 분기 조건을 그대로 계약에 명시.
- 같은 분석 문서의 "API 계약" 섹션에 기록 (백엔드 전달용 단일 소스).
- 응답 타입은 `entities/<slice>/model/types.ts`로 작성.

### ③ 구현
- **타겟 코드는 idiomatic JavaScript/TypeScript로 작성한다.** PHP 구문을 기계적으로 전사하지 않는다 — 자연스러운 JS/TS 관용구(early return, 옵셔널 체이닝, 구조 분해 등)를 쓰되 **동작·출력·플로우는 legacy와 동일**하게 유지한다. 철칙 #1의 "리팩토링 금지"는 legacy *동작/마크업/UX/플로우/SEO* 변경을 막는 것이지, 타겟 코드를 PHP식으로 억지 전사하라는 뜻이 아니다.
- 라우트: **legacy URL 구조를 유지**해 매핑 (`pc/game/view.php?id=` → `app/game/view/page.tsx` + searchParams). App Router.
- 서버/클라이언트 컴포넌트: **기본 서버 컴포넌트**, legacy의 jQuery/인터랙션이 필요한 구간만 `'use client'`. SSR로 렌더되던 것은 SSR로 유지.
- 시각: `docs/design-system/client.md`를 따른다 — CDN 자산(Bootstrap 5.3.5, FA 6.7.2, Splide, Noto Sans KR)은 동일 URL·버전·integrity로 `app/layout.tsx`에 재현, 로컬 CSS(`directg.css` 등)는 무수정 복사해 `public/` 경로 유지, `page/*.css`는 해당 화면 단위에서 함께 도입. legacy 클래스명 그대로.
- Splide 캐러셀 등 vendor 인터랙션의 React 재현 방식은 등장 시 **사용자 게이트**.
- FSD: route(app) → screen(screens) → widgets/features → entities(fetcher + TanStack Query 훅, `@click-b/api-client` 사용) → shared. import 방향: `app -> screens -> widgets -> features -> entities -> shared`.
- MSW: `apps/directg-client/src/shared/mocks/`에 계약대로 handler + fixture 추가 (없으면 생성, fixture는 legacy 실제 데이터 형태 재현).

### ④ 셀프 검증 (🟢 조건)
- parity 자체 대조: 화면 요소/필드/검증/분기/엣지케이스 + **SEO(meta/canonical/구조화데이터)**를 legacy와 항목별 대조.
- 기계 검증 통과: `pnpm exec tsc -p apps/directg-client/tsconfig.json --noEmit`, `pnpm --filter @click-b/directg-client lint`.
- `docs/MIGRATION-MAP.md` 해당 단위를 🟢로 갱신.
- 커밋 1개: `migrate(client): <단위명> (<legacy 경로> → <라우트>)`.

### ⑤ 게이트 (반드시 정지)
- parity 보고서를 대화에 출력하고 **작업을 멈춘다**. 다음 단위를 먼저 시작하지 않는다.
- 개발자가 legacy 화면과 대조·승인하면 그때만 MIGRATION-MAP을 ✅로 갱신.
- 반려 시: 지적 항목 수정 → ④부터 재수행.

## 분석 문서 템플릿 (`docs/migration/storefront/<area>/<unit>.md`)

```markdown
# <단위명>

## 원본
- 파일: pc/<...> (라이브 버전 판별 근거)
- 참조 문서: docs/design-system/client.md, ../legacy-project/docs/<...>

## 화면·플로우
- 진입 URL/파라미터:
- 화면 요소 (legacy 기준):
- 폼 필드/검증:
- 분기/리다이렉트:
- 세션/권한 의존:

## SSR·SEO (legacy)
- head meta/title/canonical/OG:
- 구조화 데이터:
- 페이지별 CSS/자산 (page/*.css 등):
- SSR/CSR 렌더 구간:

## 데이터 (legacy)
- 도메인 클래스·메서드:
- SQL 요약 (테이블/조건/정렬/페이징):
- AJAX(*_json.php)/POST(*_ps.php):

## 결제(PG) — 해당 시
- 연동 대상(kcp/toss/naver/payco/kakao)·플로우 요약:

## API 계약 (백엔드 전달)
- `METHOD /path` — 요청/응답 스키마, 에러 코드(원문 유지), 백엔드 책임 사항

## 타겟 매핑
- 라우트: / screen: / entities: / mock:

## Parity 체크리스트
- [ ] 화면 요소 일치  - [ ] 필드/검증 일치  - [ ] 분기/플로우 일치
- [ ] SEO(meta/canonical/구조화데이터) 일치  - [ ] 엣지케이스 일치
```

## Parity 보고서 형식 (게이트 시 출력)

1. 단위 요약: legacy 경로 → 타겟 라우트, 커밋 해시
2. 대조표: 항목 | legacy 동작 | 구현 동작 | 일치 여부 (차이가 있으면 사유)
3. SEO 대조: title/meta/canonical/구조화데이터 legacy ↔ 구현
4. 확인 절차: `pnpm dev:client` → 접속 라우트 → mock 계정/데이터 → 확인 시나리오
5. 미해결/보류 항목 (있다면)

## 에이전트 운용

- 기본은 메인 세션이 직접 수행한다. 단위가 작아 멀티에이전트 오케스트레이션은 과하다.
- legacy 탐색 범위가 넓을 때만 Explore 서브에이전트 투입.
- `si-optimizer` 등 최적화 성향 도구 투입 금지 (AGENTS.md 규칙).
