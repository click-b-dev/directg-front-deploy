# 개인정보처리방침 (private)

## 원본
- 파일: `pc/service/private.html` (라이브 — service 도메인, aside **없음**). agreement.html과 동형.
- 데이터: `pc/service/private.txt`(현행 162줄)·`pc/service/private_250701.txt`(이전 159줄) — **순수 텍스트(HTML 태그 없음)**, `<pre>`에 raw include
- 참조 문서: `docs/design-system/client.md`, `../legacy-project/docs/OPERATION-POLICY-MAP.md`
- 선례: `screens/service-agreement`(이용약관 — `?date` 버전 스위치 + txt SSR inline, 동일 패턴)

## 화면·플로우
- 진입 URL/파라미터: `/service/private.html`, 선택 GET `?date=<YYYYMMDD>`
- 버전 스위치 로직 (legacy, agreement와 동일):
  - `$old_dates = ['250701']`
  - `?date`가 `$old_dates`에 있고 `private_<date>.txt` 존재 → 그 파일, `is_old=true`
  - 파일 부재 → `private.txt`, `is_old=false`
  - 그 외 → `private.txt`, `is_old` 미할당(falsy)
- 화면 요소:
  - `div.container` > `main.mb-5` (※ `my-3 pb-5` 없음)
  - `h3.page-title.py-3.fw-bold` "개인정보처리방침"
  - `div.card.shadow-none.rounded-0` > `div.card-body.text-body.font-14.p-4`
    - `pre.text-auto.font-14` — private txt raw inline
    - 버전 링크
- 버전 링크 분기:
  - `is_old` → `<a href="private.html">현재 개인정보처리방침 보기</a>` (trailing `<br>` 없음)
  - else → 각 date: `<a href="private.html?date=250701">이전 개인정보처리방침 보기 (25년 07월 01일)</a><br>`
  - href 상대경로 유지(`private.html`, `private.html?date=250701`)
- 폼/검증/리다이렉트: 없음
- 세션/권한 의존: 없음(비로그인 접근)

## SSR·SEO (legacy)
- title `개인정보처리방침`, viewport `width=device-width, initial-scale=1.0`
- `description=""`, `author=H2interactive`, canonical/OG/구조화데이터 없음
- 페이지 CSS: head `<style> .container pre { text-wrap:auto; font-family:'Noto Sans KR' }` → `<pre>` 인라인 스타일로 재현(높이/overflow 없음)
- SSR/CSR: 전 구간 정적 SSR. `?date`에 따라 서버가 txt 선택.

## 데이터 (legacy)
- 도메인 클래스·SQL·AJAX: 없음. 로컬 txt include만.

## 결제(PG)
- 해당 없음

## API 계약 (백엔드 전달)
- **없음** — 데이터 페칭 전무. txt는 `public/service/`에 정적 배치.

## 타겟 매핑
- 라우트: `app/service/private.html/page.tsx` → `/service/private.html` (searchParam `date`)
  - 서버 컴포넌트: `date` 판독 → `private_<date>.txt` readFile 시도(실패 시 `private.txt` fallback·`isOld=false`) → screen에 `{ documentHtml, isOld, oldDates }` 전달
  - metadata/viewport: title 개인정보처리방침 / description "" / author H2interactive / initial-scale 1
- screen: `screens/service-private` (신규) — agreement와 동형 마크업. txt raw는 `dangerouslySetInnerHTML`(태그 없어도 legacy include의 raw 출력과 바이트 동일 보장)
- 자산: `public/service/private.txt`·`public/service/private_250701.txt` (신규 복사)
- entities/mock: 없음

## 단위 경계 결정 / legacy quirk
1. legacy는 `<div class="wrap">`(오타, 정상은 `wrapper`) + `<body>` 여는 태그 누락 → **layout 중앙화 영역**이라 재현 안 함(모든 이관 페이지가 `container`에서 시작하는 기존 아키텍처와 일관). 스크린 parity에 영향 없음.
2. container에 `my-3 pb-5` 미부여, `main.mb-5`.
3. pre 스타일 인라인.
4. txt는 순수 텍스트지만 legacy include=raw 출력 → `dangerouslySetInnerHTML` 유지(escape 차이 방지).

## Parity 체크리스트
- [ ] 화면 요소 일치 (h3 title + card + pre + 버전 링크)
- [ ] `?date=250701` 시 이전 방침 + "현재 개인정보처리방침 보기" 링크
- [ ] 무파라미터/잘못된 date 시 현행 + "이전 개인정보처리방침 보기 (25년 07월 01일)" 링크
- [ ] SEO(title/viewport/description/author) 일치, canonical/OG 없음 유지
- [ ] container에 my-3 pb-5 없음 / main.mb-5 / pre 인라인 스타일
