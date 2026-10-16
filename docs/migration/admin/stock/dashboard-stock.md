# 재고 대시보드

## 원본
- 파일: `pc/_Admin_/goods/stock/dashboard_stock.php` (라이브 버전 — 변형/테스트 파일 없음)
- 참조 문서: `../legacy-project/docs/STOCK-MANAGEMENT.md`(3·4장·부록 F), `docs/legacy-admin/21-goods-stock-integration.md`
- 사이드바: `pc/_Admin_/inc/sidebar_stock.php` 첫 항목(`재고 대시보드`) — 영역 진입점

## 화면·플로우
- 진입 URL/파라미터: `/_Admin_/goods/stock/dashboard_stock.php` (파라미터 없음). goods 대시보드(`dashboard_goods.php`)의 "재고 대시보드" 버튼(`/goods/stock/dashboard_stock`)에서도 진입.
- 세션/권한: `lib/lib.php` include(관리자 세션 가드). topbar `stock` active, sidebar=`sidebar_stock.php`.
- 화면 요소 (legacy 기준):
  - page title `재고 대시보드` (breadcrumb 없음)
  - 상단 안내문 `p.font-12.text-muted`: `* 재고 기반 카드(Asset)는 동기화된 재고 기준 · 판매종료 제외. 재고 0이어도 자동 품절되지 않습니다(관리자 수동). 'Asset 외' 카드는 재고와 무관하게 판매중 & 품절 상품을 표시합니다.`
  - **카드 1** `Asset · 판매중 & 재고 0` (`col-lg-6`, `card.border-warning`, header `bg-warning text-dark`): count 뱃지(`bg-dark text-white`, `number_format`). 표 4컬럼:
    - 옵션상품코드 — `goods_link(product_code)` 새 탭 링크
    - 옵션상품명 / 상태 / 품절여부 — `product_name` + `getProductStatus(status)` 뱃지 + `soldout_badge(soldout)`
    - Asset 정보 — `asset_stock_link(item_id)` 새 탭 링크 `[item_id]` + `item_name`
    - Asset 공급처 — `item_publisher`
    - **행 강조**: `soldout !== 'Y'`이면 `tr.table-danger` (재고 없는데 품절 안 된 최우선 점검 대상)
    - 빈 목록: `<td colspan="4" class="text-center text-muted py-2">해당 항목이 없습니다.</td>`
  - **카드 2** `Asset 외 · 판매중 & 품절` (`col-lg-6`, `card`, header `bg-primary text-white`): count 뱃지(`bg-light text-dark`). 표 3컬럼:
    - 옵션상품코드 — `goods_link` 새 탭 링크
    - 옵션상품명 — `product_name`
    - 배송시스템 — `getOrderSystem(order_system)`; 매칭 없으면 raw `order_system`(null/빈값이면 `-`). `text-center`
    - 빈 목록: colspan=3 `해당 항목이 없습니다.`
  - **카드 3** `Asset · 판매중 아님 & 재고 0` (`col-12`, `card`, header `bg-secondary text-white`): count 뱃지(`bg-light text-dark`). 표 4컬럼(카드 1과 동일 구조, **행 강조 없음**).
- 분기/리다이렉트: 없음(read-only 조회 화면). AJAX 없음.

## 데이터 (legacy)
- 도메인 클래스·메서드:
  - `AdminGoods::getGoodsOptionStockZeroList()` — 재고 0 디지털 Asset 옵션상품(판매종료 `status='3'` 제외)
  - `AdminGoods::getGoodsOptionSellingSoldoutList()` — 판매중 & 품절 중 Asset 외
  - `Admin::getProductStatus($status)` — 상태 뱃지(shared `ProductStatusBadge`로 이미 이관)
  - `Admin::getOrderSystem($order_system)` — 1 Asset API / 2 Ztorm API / 8 Vaultn API / 9 Genba API / 10 PointNexus API
  - lib_func: `goods_link`, `asset_stock_link`, `soldout_badge`
- SQL 요약:
  - `getGoodsOptionStockZeroList`: `tbl_goods_item a INNER JOIN tbl_goods_item_delivery b ON a.product_code=b.product_code WHERE a.option_type='digital' AND b.order_system='1' AND b.stock='0' AND a.status<>'3' ORDER BY a.status ASC, b.item_publisher ASC, b.item_id ASC`. 컬럼: `product_code,product_name,option_type,status,soldout,item_type,item_id,item_name,item_publisher,stock`.
  - `getGoodsOptionSellingSoldoutList`: `tbl_goods_item a LEFT JOIN tbl_goods_item_delivery b ON a.product_code=b.product_code WHERE a.status='0' AND a.soldout='Y' AND (b.order_system IS NULL OR b.order_system<>'1') ORDER BY b.order_system ASC, a.product_code ASC`. 컬럼: `product_code,product_name,option_type,status,soldout,order_system`.
- **PHP 후처리(백엔드 책임으로 이관)**:
  - `getGoodsOptionStockZeroList` 결과를 `status==='0'` → `selling_list`, 그 외 → `not_selling_list`로 분류.
  - `selling_list`만 `usort(strcmp(a.soldout, b.soldout))` — `soldout` `N`(미품절) 먼저, `Y`(품절) 나중. PHP 8 stable sort → soldout 동일 시 SQL 순서(publisher, item_id) 유지.
  - `not_selling_list`는 재정렬 없음(SQL 순서 유지: status asc → publisher → item_id).

## API 계약 (백엔드 전달)
- `GET /admin/goods/stock/dashboard` — 재고 대시보드 스냅샷(read-only, 파라미터 없음)
  - 응답 `200`:
    ```jsonc
    {
      "selling_stock_zero": [        // 카드1: 판매중(status=0) & Asset재고0. soldout N 먼저 정렬 완료
        { "product_code": "string", "product_name": "string", "status": "0",
          "soldout": "N|Y", "item_id": "string", "item_name": "string", "item_publisher": "string" }
      ],
      "not_selling_stock_zero": [    // 카드3: 판매중 아님(status≠0) & Asset재고0. SQL 순서
        { "product_code": "string", "product_name": "string", "status": "1|9",
          "soldout": "N|Y", "item_id": "string", "item_name": "string", "item_publisher": "string" }
      ],
      "selling_soldout": [           // 카드2: 판매중 & 품절, Asset 외
        { "product_code": "string", "product_name": "string", "order_system_label": "string" }
      ]
    }
    ```
  - **백엔드 책임**:
    - 위 2개 SQL 실행 + PHP 후처리(분류·`selling_stock_zero` soldout 정렬)를 서버에서 완료해 반환.
    - `order_system_label`: `getOrderSystem(order_system)` 매핑값. 매핑 없으면 raw `order_system`, null/빈값이면 `-`.
    - `status`/`soldout` 원본 코드값 그대로 반환(프론트가 뱃지·행강조 판정). 전체 목록 반환(LIMIT 없음 — legacy 잘림 없음).
    - 서버측 관리자 권한 강제(세션 가드) 필요.
  - 에러 코드: legacy는 PDOException 시 `Error!: <msg>` 출력 후 die. 프론트는 표준 실패 처리(계약상 5xx).

## 타겟 매핑
- 라우트: `routes/goods/stock/dashboard_stock.tsx` → `/goods/stock/dashboard_stock` (stock 라우트 디렉토리 신규)
- screens: `screens/stock-dashboard`
- entities: `entities/stock-dashboard` (fetcher/queries/types)
- mock: `shared/mocks/handlers/stock-dashboard.ts` + `handlers.ts` 등록
- 재사용: `shared/ui/ProductStatusBadge`(getProductStatus). `goods_link`/`asset_stock_link`/`soldout` 뱃지는 인라인(goods-dashboard 선례 — 대상 라우트 미이관, 링크 문자열만).
- 사이드바 영역 전환(`sidebar_stock`)은 **후속 단위**(goods Unit 17 선례: 첫 화면 먼저, 사이드바 배선 별도).

## Parity 체크리스트
- [ ] 화면 요소 일치 (3카드·헤더 색상·컬럼·안내문·count 뱃지)
- [ ] 필드/검증 일치 (링크 대상·상태 뱃지·품절 뱃지·공급처)
- [ ] 분기/플로우 일치 (미품절 행 `table-danger` 강조는 카드1만·soldout N우선 정렬·status 분류)
- [ ] 엣지케이스 일치 (빈 목록 문구·colspan·order_system 매핑 없을 때 raw/`-`)
