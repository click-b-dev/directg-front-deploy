# 종료된 할인 프로모션 (읽기전용 목록 + 검색필터)

> P1 #173. legacy `promotion_end.php`. 할인 프로모션(`tbl_promotion_schedule`) 중 **종료됨**(promotion_start < now AND promotion_end < now)인 행 목록. **읽기전용**(삭제 버튼·JS·mutation 없음). #170/#171 표 레이아웃(10컬럼 2줄)과 동일하되 마지막 "비고" 셀 빈칸.

## 원본
- 파일: `pc/_Admin_/promotion/promotion_end.php` (라이브, 사이드바 `할인 프로모션 관리 > 종료된 할인 프로모션`)
- 처리기: 없음(읽기전용, `<script>` 블록 자체가 없음)
- 도메인: `AdminPromotion::getPromotionListEnd`(line 55) — SQL `where 1=1`, 기간필터는 페이지 `$where` 주입
- 참조: `docs/legacy-admin/50-promotion-event.md` §종료, #171 문서

## 화면·플로우
- 진입 URL: `/promotion/promotion_end` (파라미터 `page`,`search_key`,`search_value`,`search_confirm`)
- `$page_title="종료된 할인 프로모션"`. breadcrumb: 홈/프로모션/할인 프로모션 관리/**종료된 할인 프로모션**(active). h4 동일.
- **검색필터 카드**: #171과 동일(옵션상품명/옵션상품명코드 select + 검색어 + 승인여부 Y/N radio + 검색). 선택 유지.
- 카운트: `<div class="mb-2">{number_format(total)} 개</div>` (단순).
- 목록 테이블(**10컬럼, #170/#171 레이아웃과 동일 = 할인률/SRP 2줄 합산**):

| # | 헤더 | 셀 |
|---|------|----|
| 1 | 공급처 | getPublisherName(publisher_code) |
| 2 | 옵션상품코드 | product_code |
| 3 | 옵션상품명 | product_name`<br/>`(product_name_en) |
| 4 | 할인률(승인할인률) | discount_rate%`<br/>`(p_discount_rate%) |
| 5 | SRP(승인SRP) | number_format(consumer_price) 원`<br/>`(number_format(promotion_srp) 원) |
| 6 | 프로모션 할인 판매가 | number_format(sale_price) 원 |
| 7 | 시작일자(w150) | span.num promotion_start |
| 8 | 종료일자(w150) | span.num promotion_end |
| 9 | 승인상태(w80) | confirm (raw Y/N) |
| 10 | **비고**(w90) | **빈 셀**(삭제 버튼 없음, 읽기전용) |

- **thead class = `table-light`** (#170/#171/#172의 `table-light font-13`와 달리 `font-13` 없음 — quirk 이식).
- **빈 목록 메시지 없음**.
- 페이지네이션: links_html(ServerPagination), 30/page, order `a.promotion_start desc,a.promotion_end desc`.

### WHERE (기간)
- 페이지 `$where[]` = `a.promotion_start < now AND a.promotion_end < now` → **종료**(시작·종료 모두 과거).
- search_value → search_name(product_name/en LIKE) 또는 search_product_code(`a.product_code` 등호). search_confirm → `a.confirm` 등호.
- getPromotionListEnd SQL: `select a.*,b.product_srp,b.product_name,b.product_name_en from tbl_promotion_schedule a inner join tbl_goods_item b on a.product_code=b.product_code where 1=1` + add_where + order.

### mutation
- **없음**(읽기전용). 삭제 버튼·`<script>` 없음.

## API 계약 (백엔드 전달)
`entities/promotion` 확장.

- `GET /admin/promotion/promotion-end?page&search_key&search_value&search_confirm` → `{ items: PromotionListItem[], pagination }`
  - SQL: getPromotionListEnd + 페이지 WHERE(종료 기간). order `promotion_start desc,promotion_end desc`, 30/page.
  - item 스키마는 #170 `PromotionReadyListItem` 재사용(#173은 consumer_price/promotion_srp 2줄 표시, product_srp 미표시).
- mutation 없음.

## 타겟 매핑
- 라우트: `routes/promotion/promotion_end.tsx` (validateSearch page/search_key/search_value/search_confirm)
- 스크린: `screens/promotion-end/` (읽기전용)
- entities: `entities/promotion` 확장(`fetchPromotionEndList`/`usePromotionEndList` + `PromotionEndListSearch`/`PromotionEndListResponse`).
- mock: `handlers/promotion.ts` 확장 — GET promotion-end(종료 필터+검색, applySearch/byStartEndDesc/paginate 재사용). 공유 `PROMOTION_SCHEDULE`에 **종료 fixture 추가**(promotion_end < 현재, confirm Y·N).

## 파리티 결정 사항 (게이트 확인 대상)
1. **읽기전용**: 삭제 버튼 없음, 마지막 "비고" 셀 빈칸.
2. **thead `table-light`**(font-13 없음) quirk 이식.
3. **10컬럼 2줄 합산**(#172의 11컬럼 개별과 다르게 #170/#171 레이아웃).
4. search_product_code `a.product_code` quirk(결과 동일, 문서화만).

## Parity 체크리스트
- [ ] 검색필터(#171 동일) 노출·선택 유지
- [ ] 10컬럼(2줄 할인률/SRP) + 마지막 "비고" 빈 셀
- [ ] thead table-light(font-13 없음)
- [ ] 종료 WHERE·검색·30/page·DESC 정렬 일치
- [ ] 빈 목록 메시지 없음·삭제 버튼 없음
