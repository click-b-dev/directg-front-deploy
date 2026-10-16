# 진행예정 할인 프로모션 (목록 + 검색필터 + 개별삭제)

> P1 #172. legacy `promotion_upcoming.php` + `promotion_ps.php`(delete 공유). 할인 프로모션(`tbl_promotion_schedule`) 중 **아직 시작 안 함**(promotion_start >= now)인 행 목록. #171 진행중과 검색필터·삭제 동일, 차이는 **WHERE(미시작)·정렬 ASC·11컬럼(product_srp 표시)**.

## 원본
- 파일: `pc/_Admin_/promotion/promotion_upcoming.php` (라이브, 사이드바 `할인 프로모션 관리 > 진행예정 할인 프로모션`)
- 처리기: `promotion_ps.php` mode=delete (공유)
- 도메인: `AdminPromotion::getPromotionListUpcoming`(line 77) — SQL 자체가 `a.promotion_start>=now() and a.promotion_end>=now()`
- 참조: `docs/legacy-admin/50-promotion-event.md` §진행예정, #171 문서

## 화면·플로우
- 진입 URL: `/promotion/promotion_upcoming` (파라미터 `page`,`search_key`,`search_value`,`search_confirm`)
- `$page_title="진행예정 프로모션"`. breadcrumb: 홈/프로모션/할인 프로모션 관리/**진행예정 프로모션**(active). h4 동일.
- **검색필터 카드**: #171과 동일(옵션상품명/옵션상품명코드 select + 검색어 + 승인여부 Y/N radio + 검색). 선택 유지.
- 카운트: `<div class="mb-2">{number_format(total)} 개</div>` (단순, 버튼 없음).
- 목록 테이블(**11컬럼**, #170/#171의 2줄 합산 대신 SRP/할인률 개별 컬럼):

| # | 헤더 | 셀 |
|---|------|----|
| 1 | 공급처 | getPublisherName(publisher_code) |
| 2 | 옵션상품코드 | product_code |
| 3 | 옵션상품명 | product_name`<br/>`(product_name_en) |
| 4 | SRP | number_format(**product_srp**) 원 |
| 5 | 프로모션 SRP | number_format(promotion_srp) 원 |
| 6 | 프로모션 할인률 | discount_rate% |
| 7 | 프로모션 할인 판매가 | number_format(sale_price) 원 |
| 8 | 시작일자(w150) | span.num promotion_start |
| 9 | 종료일자(w150) | span.num promotion_end |
| 10 | 승인상태(w80) | confirm (raw Y/N) |
| 11 | 삭제(w90) | 삭제버튼 btn btn_delete data-idx data-product mdi-delete |

- **빈 목록 메시지 없음**.
- 페이지네이션: links_html(ServerPagination), 30/page.
- **정렬: `a.promotion_start asc,a.promotion_end asc,b.product_name asc`** (#170/#171의 desc와 상이).

### WHERE (기간)
- 클래스 SQL 내부: `a.promotion_start>=now() and a.promotion_end>=now()` → **promotion_start >= now**(미시작). (end>=now는 사실상 중복)
- 페이지 `$where`: search_value → search_name(product_name/en LIKE) 또는 **search_product_code(`a.product_code` 등호 — #171의 `b.product_code`와 컬럼명만 상이, 조인상 동일 결과)**. search_confirm → `a.confirm` 등호.
- getPromotionListUpcoming SELECT: `a.*,b.product_srp,b.product_name,b.product_name_en`(product_srp 포함).

### 삭제 JS
- #171과 동일: confirm → mode=delete&idx → `location.relaod()`(오타) → **미갱신 버그** 이식(invalidate 안 함).

## API 계약 (백엔드 전달)
`entities/promotion` 확장.

- `GET /admin/promotion/promotion-upcoming?page&search_key&search_value&search_confirm` → `{ items: PromotionListItem[], pagination }`
  - SQL: getPromotionListUpcoming(미시작 기간) + 검색. order `promotion_start asc,promotion_end asc,product_name asc`, 30/page.
  - item 스키마는 #170 `PromotionReadyListItem`에 **`product_srp` 추가**(전 목록 공통 SELECT `b.product_srp`). #170/#171 화면은 미표시, #172만 표시.
- 개별삭제: 기존 `DELETE /admin/promotion/promotion-ready/:idx` 재사용(제네릭 schedule 삭제).

## 타겟 매핑
- 라우트: `routes/promotion/promotion_upcoming.tsx` (validateSearch page/search_key/search_value/search_confirm)
- 스크린: `screens/promotion-upcoming/`
- entities: `entities/promotion` 확장(`fetchPromotionUpcomingList`/`usePromotionUpcomingList` + `PromotionUpcomingListSearch`/`PromotionUpcomingListResponse`). `PromotionReadyListItem`에 `product_srp` 필드 추가. 삭제는 `useDeletePromotion` 재사용.
- mock: `handlers/promotion.ts` 확장 — GET promotion-upcoming(미시작 필터+검색). 전 fixture에 `product_srp` 추가. **미시작 fixture 추가**(confirm Y·N, promotion_start>현재). 기존 #170 미래시작 행(5120/5118)도 미시작이므로 이 목록에 노출.

## 파리티 결정 사항 (게이트 확인 대상)
1. **미갱신 버그 유지**(#170 결정① 계승).
2. **삭제 엔드포인트 재사용**.
3. **11컬럼 개별 표시**(SRP=product_srp/프로모션SRP/할인률/판매가 — #170·#171의 2줄 합산과 다른 legacy 원본 구조).
4. **정렬 ASC**(진행예정만 오름차순).
5. **search_product_code `a.product_code` quirk**: legacy 컬럼명이 #171과 상이하나 결과 동일(문서화만).

## Parity 체크리스트
- [ ] 검색필터(#171 동일) 노출·선택 유지
- [ ] 11컬럼 헤더·셀(product_srp SRP·프로모션SRP·할인률·판매가) 일치
- [ ] 미시작 WHERE·검색·30/page·**ASC 정렬** 일치
- [ ] 빈 목록 메시지 없음
- [ ] 개별삭제 confirm·미갱신 동작 일치
