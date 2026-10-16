# 이용약관 (agreement)

## 원본
- 파일: `pc/service/agreement.html` (라이브 — service 도메인, aside **없음**)
- 데이터: `pc/service/agreement.txt`(현행 307줄)·`pc/service/agreement_250701.txt`(이전 292줄) — HTML 조각 포함 텍스트, `<pre>`에 raw include
- 참조 문서: `docs/design-system/client.md`, `../legacy-project/docs/OPERATION-POLICY-MAP.md`
- 선례: `screens/member-join-step2`(agreement.txt를 `public/service/`에서 `readFile` → `dangerouslySetInnerHTML` inline)

## 화면·플로우
- 진입 URL/파라미터: `/service/agreement.html`, 선택 GET `?date=<YYYYMMDD>`
- 버전 스위치 로직 (legacy):
  - `$old_dates = ['250701']` (하드코딩, 필요시 추가)
  - `$date = $_GET['date'] ?? ''`
  - `if ($date && in_array($date, $old_dates))`:
    - `agreement_<date>.txt` 존재하면 → 그 파일 표시, `is_old = true`
    - 없으면 → `agreement.txt` 표시, `is_old = false`
  - else → `agreement.txt` 표시, `is_old` **미할당**(PHP undefined = falsy)
- 화면 요소:
  - `div.container` > `main.mb-5` (※ `my-3 pb-5` 없음 — 이 페이지는 예외)
  - `h3.page-title.py-3.fw-bold` "이용약관"
  - `div.card.shadow-none.rounded-0` > `div.card-body.text-body.font-14.p-4`
    - `pre.text-auto.font-14` — 약관 txt raw HTML inline (`<h3>` 등 태그 렌더)
    - 버전 링크(아래 분기)
- 버전 링크 분기:
  - `is_old` truthy → `<a href="agreement.html">현재 이용약관 보기</a>` (trailing `<br>` 없음)
  - else → `array_reverse($old_dates)` 각 date마다: `<a href="agreement.html?date=250701">이전 이용약관 보기 (25년 07월 01일)</a><br>`
    - 라벨 날짜: `substr(date,0,2)년 substr(date,2,2)월 substr(date,4,2)일`
  - href는 **상대경로** 그대로 유지(`agreement.html`, `agreement.html?date=250701`) — `/service/` 기준 해석
- 폼 필드/검증: 없음
- 분기/리다이렉트: 없음 (버전 링크는 전체 네비게이션)
- 세션/권한 의존: **없음** — `lib.php` include하나 세션 미사용(비로그인 접근 가능)

## SSR·SEO (legacy)
- title `이용약관`, viewport `width=device-width, initial-scale=1.0`
- `description=""`, `author=H2interactive`, canonical/OG/구조화데이터 **없음**
- 페이지 CSS: head `<style>` 블록 — `.container pre { text-wrap: auto; font-family: 'Noto Sans KR', sans-serif; }`
  - pre가 페이지 내 유일 → **`<pre>` 인라인 스타일**로 동작 동일 재현(높이/overflow 제약 없음. join_step2의 300px 스크롤 pre와 다름)
- SSR/CSR: 전 구간 정적 SSR. 인터랙션 없음. `?date` 파라미터에 따라 서버에서 txt 선택.

## 데이터 (legacy)
- 도메인 클래스·SQL·AJAX: **없음**. 로컬 txt 파일 include만.

## 결제(PG)
- 해당 없음

## API 계약 (백엔드 전달)
- **없음** — 데이터 페칭 전무. entity/fetcher/MSW 불필요. txt는 정적 자산으로 `public/service/`에 배치.

## 타겟 매핑
- 라우트: `app/service/agreement.html/page.tsx` → `/service/agreement.html` (searchParam `date`)
  - 서버 컴포넌트: `date` 판독 → `OLD_DATES.includes(date)`면 `agreement_<date>.txt` `readFile` 시도(실패 시 `agreement.txt` fallback·`isOld=false`) → screen에 `{ agreementHtml, isOld, oldDates }` 전달
  - metadata/viewport: title 이용약관 / description "" / author H2interactive / initial-scale 1
- screen: `screens/service-agreement` (신규) — 마크업 + 버전 링크 렌더
- 자산: `public/service/agreement.txt`(기존)·`public/service/agreement_250701.txt`(신규 복사)
- entities/mock: 없음

## 단위 경계 결정
1. aside 없음 — full-width `container`. 공통 aside 위젯 미사용.
2. `container`에 `my-3 pb-5` 미부여(legacy 예외). `main.mb-5` 사용.
3. pre 스타일은 인라인(text-wrap auto + Noto Sans KR). height/overflow 없음.
4. txt raw HTML은 `dangerouslySetInnerHTML`(신뢰된 자체 자산, join_step2 선례 동일).
5. 버전 링크 상대 href·trailing `<br>` 분기 그대로 이식.

## Parity 체크리스트
- [ ] 화면 요소 일치 (h3 title + card + pre + 버전 링크)
- [ ] `?date=250701` 시 이전 약관 표시 + "현재 이용약관 보기" 링크
- [ ] 무파라미터/잘못된 date 시 현행 약관 + "이전 이용약관 보기 (25년 07월 01일)" 링크
- [ ] txt 내 `<h3>` 등 태그가 pre 안에서 렌더
- [ ] SEO(title/viewport/description/author) 일치, canonical/OG 없음 유지
- [ ] container에 my-3 pb-5 없음 / main.mb-5 / pre 인라인 스타일
