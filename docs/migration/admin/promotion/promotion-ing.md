# 진행중인 할인 프로모션 (목록 + 검색필터 + 개별삭제)

> P1 #171. legacy `promotion_ing.php` + `promotion_ps.php`(delete 공유). 할인 프로모션(`tbl_promotion_schedule`) 중 **현재 진행중**(promotion_start < now <= promotion_end)인 행 목록 + 검색필터 + 개별삭제. #170 승인대기와 표 구조 동일, 차이는 검색필터 노출·WHERE 기간·버튼 없음.

## 원본
- 파일: `pc/_Admin_/promotion/promotion_ing.php` (라이브, 사이드바 `할인 프로모션 관리 > 진행중인 할인 프로모션`)
- 처리기: `pc/_Admin_/promotion/promotion_ps.php` mode=delete (idx 삭제, #170과 공유)
- 도메인: `AdminPromotion::getPromotionIng`(line 33) — SQL `where 1=1`, 기간필터는 페이지 `$where` 주입
- 참조: `docs/legacy-admin/50-promotion-event.md` §진행중, #170 문서

## 화면·플로우
- 진입 URL: `/promotion/promotion_ing` (파라미터 `page`, `search_key`, `search_value`, `search_confirm`)
- `$page_title="진행중인 프로모션"`. breadcrumb: 홈/프로모션/할인 프로모션 관리/**진행중인 프로모션**(active). h4 동일.
- **검색필터 카드(노출)** "프로모션 검색필터" `method=get`:
  - `search_key` select: `옵션상품명`(search_name) / `옵션상품명코드`(search_product_code). 선택 유지(`selected`).
  - `search_value` text (placeholder "검색어").
  - `search_confirm` radio: 예(Y) / 아니오(N). 선택 유지(`checked`). (전체 옵션 없음 — 미선택 시 필터 안 함)
  - 검색 버튼(btn-primary "검색", float-end).
- 카운트: `<div class="mb-2">{number_format(total)} 개</div>` (#170의 "총 …개"·text-danger·버튼과 달리 **단순 카운트만**).
- **버튼 없음**(업로드/승인/전체삭제/다운로드 전부 없음).
- 목록 테이블(10컬럼, #170과 셀 동일, **마지막 헤더만 "삭제"**):

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
| 9 | 승인상태(w80) | confirm (raw Y/N — 진행중은 Y/N 혼재 가능) |
| 10 | **삭제**(w90) | 삭제버튼 btn btn_delete data-idx data-product mdi-delete |

- **빈 목록 메시지 없음**(#170의 colspan 메시지 블록 없음 — success면 행만 렌더, 0건이면 빈 tbody).
- 페이지네이션: links_html(ServerPagination), 30/page, order `a.promotion_start desc,a.promotion_end desc`.

### WHERE (기간)
- 페이지 `$where[]` = `timestampdiff(second,now(),promotion_start)<0 and timestampdiff(second,now(),promotion_end)>=0`
  → **promotion_start < now AND promotion_end >= now** (시작함 & 미종료 = 진행중).
- `search_value` → search_name(product_name/en LIKE) 또는 search_product_code(product_code 등호).
- `search_confirm` → `a.confirm='Y'|'N'` (선택 시).
- getPromotionIng SQL: `select a.*,b.product_srp,b.product_name,b.product_name_en from tbl_promotion_schedule a inner join tbl_goods_item b on a.product_code=b.product_code where 1=1` + add_where + order.

### 삭제 JS
- `confirm(product_name+" 할인 프로모션 일정을 삭제하시겠습니까?")` → AJAX POST mode=delete&idx → `delete ... where idx` → success `location.relaod()`(오타) → **미갱신 버그**(#170 결정① 동일 이식, invalidate 안 함).

## API 계약 (백엔드 전달)
`entities/promotion` 확장.

- `GET /admin/promotion/promotion-ing?page&search_key&search_value&search_confirm` → `{ items: PromotionListItem[], pagination }`
  - SQL: 위 getPromotionIng + 페이지 WHERE(진행중 기간). order `a.promotion_start desc,a.promotion_end desc`, 30/page.
  - `publisher_name` 백엔드 resolve. item 스키마는 #170 `PromotionReadyListItem`과 동일(공급처/코드/명/할인율/가격/기간/confirm).
  - `search_key`: `search_name`(product_name/product_name_en LIKE %v%) | `search_product_code`(product_code 등호). `search_confirm`: `Y`|`N` 등호(빈값 미적용).
- 개별삭제: 기존 `DELETE /admin/promotion/promotion-ready/:idx` **재사용**(legacy promotion_ps mode=delete = tbl_promotion_schedule idx 삭제, 스코프 무관 제네릭 삭제). 별도 엔드포인트 신설 안 함.

## 타겟 매핑
- 라우트: `routes/promotion/promotion_ing.tsx` (validateSearch page/search_key/search_value/search_confirm)
- 스크린: `screens/promotion-ing/`
- entities: `entities/promotion` 확장(`fetchPromotionIngList`/`usePromotionIngList` + `PromotionIngListSearch`/`PromotionIngListResponse`, item은 `PromotionReadyListItem` 재사용). 삭제는 `useDeletePromotion` 재사용.
- mock: `handlers/promotion.ts` 확장 — GET promotion-ing(진행중 기간 필터+검색). 공유 `PROMOTION_SCHEDULE`에 **진행중 fixture 추가**(confirm Y 2건·N 1건, promotion_start<현재<=promotion_end). 진행중 confirm='N' 행(idx 5070)은 legacy 설계상 #170 승인대기 목록에도 **함께 노출**(오버랩=정상). 기존 #170 미래 시작 행은 진행중 필터에 미포함.

## 파리티 결정 사항 (게이트 확인 대상)
1. **미갱신 버그 유지**: 개별삭제 후 자동 갱신 안 함(#170 결정① 승인 계승).
2. **삭제 엔드포인트 재사용**: 진행중 삭제도 `/admin/promotion/promotion-ready/:idx`(제네릭 schedule 삭제). 경로명은 #170 잔재이나 동작 동일.
3. **승인상태 Y/N 혼재**: 진행중은 confirm 필터 없어 Y/N 모두 노출(raw 표시).
4. **now 기준 기간**: mock은 실행 시각(new Date) 기준으로 진행중 판정(legacy now() 재현).

## Parity 체크리스트
- [ ] 검색필터(key select 2·value·confirm radio Y/N) 노출·선택 유지
- [ ] 카운트 단순 표시(총/버튼 없음)
- [ ] 10컬럼(헤더 마지막 "삭제") 셀 포맷 일치
- [ ] 빈 목록 메시지 없음
- [ ] 진행중 기간 WHERE·검색·30/page·정렬 일치
- [ ] 개별삭제 confirm·미갱신 동작 일치
