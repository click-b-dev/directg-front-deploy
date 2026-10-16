# 환불정책 (refund_policy)

## 원본
- 파일: `pc/service/refund_policy.html` (라이브 — service 도메인, aside **없음**)
- 본문: PHP에 **직접 인라인된 정적 HTML**(txt include·버전 스위치·`?date` 없음). agreement/private과 다른 완전 정적 페이지.
- 참조 문서: `docs/design-system/client.md`, `../legacy-project/docs/OPERATION-POLICY-MAP.md`
- 참고: guide 서브페이지처럼 인라인 HTML → JSX 전사(agreement/private의 txt SSR inline 패턴 아님)

## 화면·플로우
- 진입 URL/파라미터: `/service/refund_policy.html` (파라미터 없음, GET)
- 화면 요소 (legacy 기준):
  - `div.container` > `main.mb-5`
  - `h3.page-title.py-3.fw-bold` "다이렉트 게임즈 환불정책"
  - `div.card.shadow-none.rounded-0` > `div.card-body.text-body.font-14.p-4`
    - `div#t3-content.t3-content.col-md-12`(빈 `style=""`) > `div.docs-section` > `div.row.example-row.example-type` > `div.col-lg-12`
      - `p.section` 도입문 (디지털/실물 구분 안내)
      - `div.section`: `h3`(인라인 style `margin-bottom:12px; padding-top:30px`) "디지털상품" + `p` 정의
      - `div.section`: `table.table` > tbody **11행**(교환/반품 가능기간~거래약관 확인방법) + `p` 각주(고객센터 운영시간)
      - `div.section`: `h3`(동일 인라인 style) "실물배송상품" + `p` 정의
      - `div.section`: `table.table` > tbody **16행**(가능기간·불가기준·PS 초기불량·절차·요청방법·비용·주소지·연락처·배송업체·결제수단별·청약철회 등) + `p` 각주
- td 내부: `•` 불릿 + `<br>` 줄바꿈, `&nbsp;&nbsp;` 들여쓰기, PS 초기불량 행에 외부 링크 1개(`http://www.playstation.com/...` **http**·`target="_blank"`)
- 폼/검증/리다이렉트: 없음
- 세션/권한 의존: **없음**(비로그인 접근)

## SSR·SEO (legacy)
- title `다이렉트 게임즈 환불정책`, viewport `width=device-width, initial-scale=1.0`
- `description=""`, `author=H2interactive`, canonical/OG/구조화데이터 없음
- 페이지 CSS: head `<style>` 블록 **없음**(agreement/private과 달리). `t3-content`/`docs-section`/`example-row`/`example-type`/`section` 클래스는 전역 CSS(styleguide/directg) 사용.
- SSR/CSR: 전 구간 정적 SSR. 인터랙션 없음.

## 데이터 (legacy)
- 도메인 클래스·SQL·AJAX: 없음.

## 결제(PG)
- 해당 없음 (결제수단별 환불정책은 **안내 텍스트**일 뿐, PG 연동 아님)

## API 계약 (백엔드 전달)
- **없음** — 완전 정적. entity/fetcher/MSW/txt 자산 불필요.

## 타겟 매핑
- 라우트: `app/service/refund_policy.html/page.tsx` → `/service/refund_policy.html` (파라미터 없음)
  - metadata/viewport: title 다이렉트 게임즈 환불정책 / description "" / author H2interactive / initial-scale 1
- screen: `screens/service-refund-policy` (신규) — 정적 서버 컴포넌트. 표 행은 `{ th, body }[]` 데이터 배열로 idiomatic하게 map(td body는 verbatim JSX). 텍스트/`<br>`/`&nbsp;`/외부 링크 원문 유지.
- entities/mock/자산: 없음

## 단위 경계 결정 / legacy quirk
1. 인라인 HTML → JSX 전사(guide 선례). dangerouslySetInnerHTML 미사용(외부 txt 없음, 마크업 검사 가능).
2. container에 `my-3 pb-5` 없음, `main.mb-5` (agreement/private과 동일 예외).
3. `#t3-content`의 빈 `style=""`는 렌더 무영향 → 생략(idiomatic).
4. PS 초기불량 링크 `http://`(https 아님)·`target="_blank"` 원문 유지.
5. 디지털 표 결제수단 항목의 페이코↔계좌이체 사이 공백 라인(실물 표엔 없음)은 HTML 공백 축약으로 시각 차이 없음 → 무시.
6. 디지털/실물 문구 차이("구매일부터" vs "상품 수령일로부터" 등) 각각 원문대로.

## Parity 체크리스트
- [ ] 화면 요소 일치 (도입문 + 디지털 h3/정의/표11 + 각주 + 실물 h3/정의/표16 + 각주)
- [ ] 표 각 행 th/td 텍스트·`<br>`·`&nbsp;` 들여쓰기 일치
- [ ] PS 초기불량 외부 링크(http·_blank) 일치
- [ ] SEO(title/viewport/description/author) 일치, canonical/OG 없음 유지
- [ ] container에 my-3 pb-5 없음 / main.mb-5 / h3 인라인 style
