# 상품 대시보드 (#18)

> 영역: 상품 > 상품 대시보드(goods 진입점). read-only 모니터링 대시보드(6패널).

## 원본
- 파일: `pc/_Admin_/goods/dashboard_goods.php` (294줄). 차트/AJAX/폼 없음 — 직접 SQL 6종 조회.
- 헬퍼: `goods_link`/`asset_link`/`stock_check_link`(lib_func), `Admin::getOrderSystem`/`getProductStatus`, `AdminGoods::getGoodsOptionGameType`.

## 화면·플로우
- 진입: `/_Admin_/goods/dashboard_goods.php` → 타겟 `/goods/dashboard_goods`. sidebar_goods, `$topmenu['goods']=active`.
- **breadcrumb 없음** — `page-title-box`에 h4 "상품 대시보드"만.
- **① 재고 알림**(row, 헤더: 아이콘+제목+"재고 대시보드" 버튼):
  - 1-1 판매중 & 품절(col-6, `card border-warning`, 헤더 `bg-warning text-dark` + 건수 badge): table[옵션상품코드/옵션상품명/오더시스템]. **top 15**. promo_active>0 행 → `table-danger` + "프로모션중" badge. 오더시스템: stock_check_link 있으면 링크. product_code → goods_link. "외 N건 더 있음"(>15).
  - 1-2 재고 있는데 품절 처리됨(col-6, `border-primary`, `bg-primary text-white`): "품절 해제 후보" + table[코드/명/Asset/재고]. top 15, 전행 `table-info`. Asset → asset_link `[item_id] item_name`. 재고 fw-bold.
- **② 등록 품질 점검**(row):
  - 2-1 판매중·판매가 미설정(col-6, `bg-danger text-white`): table[코드/명]. top 12. "외 N건 (상위 100건 기준)".
  - 2-2 판매중 디지털·배송시스템 미설정(col-6, `bg-danger`): table[코드/명/유형(game_type_label)]. top 12.
- **③ 프로모션 / 일정**(row):
  - 3-1 프로모션 현황(col-6, `bg-success`): 3 카운트 카드(진행예정=upcoming[text-primary]/진행중=active[bg-light,text-success]/종료예정 7일내=ending[text-danger]). + promo_notselling 있으면 "⚠ 프로모션 진행중인데 판매중 아님" warning table[코드/명/상태(status_label)] 전행 `table-warning`.
  - 3-2 예약구매(출시 임박순)(col-6, `bg-info`, 건수 badge): table[옵션상품명(→goods_link)/출시일(substr 0,10)/배송시스템(order_system_label)].

## 데이터 (legacy)
- 6 SQL(tbl_goods_item / tbl_goods_item_delivery / tbl_promotion_schedule 조인·서브쿼리). 상세는 원본 참조.
- 링크: `goods_link(code)`=`/_Admin_/goods/goods_option_view.php?product_code=`, `asset_link(item_id)`=`/_Admin_/goods/stock/goods_option_stock.php?search_key=search_asset_id&search_value=`, `stock_check_link(order_system,item_id)`=order_system별 외부/재고 링크(빈값 가능).

## API 계약 (백엔드 전달)
- **`GET /admin/goods/dashboard`** — 응답(모든 라벨/카운트 서버 완결):
  - `selling_soldout: { total, items: [{ product_code, product_name, order_system_label, stock_check_link, promo_active }] }` (items=top 15).
  - `stock_soldout: { total, items: [{ product_code, product_name, item_id, item_name, stock, promo_active }] }` (top 15).
  - `issue_price: { total, items: [{ product_code, product_name }] }` (top 12).
  - `issue_delivery: { total, items: [{ product_code, product_name, game_type_label }] }` (top 12).
  - `promo: { upcoming, active, ending }`.
  - `promo_notselling: [{ product_code, product_name, status_label }]`.
  - `preorder_list: [{ product_code, product_name, release_date, order_system_label }]`.
  - 백엔드 책임: 6 SQL·라벨(getOrderSystem/getProductStatus/getGoodsOptionGameType)·stock_check_link 생성·서버측 권한.

## 타겟 매핑
- 라우트: `routes/goods/dashboard_goods.tsx` → `screens/goods-dashboard`.
- entities: `entities/goods-dashboard`(types, fetcher, useQuery). read-only.
- 링크: `goods_link`/`asset_link`는 프론트 로컬 헬퍼(결정적). stock_check_link는 응답값. 대상 페이지 미이관 → 링크만.
- mock: handler가 고정 스냅샷 payload 반환(CRUD 테이블 없음). "재고 대시보드" 버튼 → /goods/stock/dashboard_stock(미이관).

## Parity 체크리스트 (개발자 승인 완료 — ✅ 검증완료)
- [x] 제목(breadcrumb 없음)/재고 대시보드 버튼
- [x] 6패널 카드 색/헤더/건수 badge/컬럼·top N·"외 N건"(임계 초과 시)
- [x] promo_active 행 강조(table-danger)+프로모션중 badge, stock_soldout table-info, promo_notselling table-warning
- [x] 프로모션 3카운트 / 예약구매 목록
- [x] goods_link/asset_link/stock_check_link 링크
- mock은 고정 스냅샷(total=items 길이 → "외 N건" 미시연, 로직은 존재). 링크 대상·재고 대시보드 미이관.
- 기계 검증: tsc 0 / lint 0 / build 성공(485 modules).
