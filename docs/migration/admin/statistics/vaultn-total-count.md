# Vaultn 누적 주문현황

## 원본
- 파일: `pc/_Admin_/statistics/order/vaultn_total_count.php` (sidebar_statistics.php에 노출된 라이브 링크)
- 참조 문서: `docs/legacy-admin/60-statistics.md`, `../legacy-project/docs/STATISTICS-REPORTING.md`

## 화면·플로우
- 진입 URL/파라미터: `/_Admin_/statistics/order/vaultn_total_count.php?page=`
- 기본값: `page=1`
- 화면 요소 (legacy 기준):
  - breadcrumb: 홈 / 통계 / Vaultn 주문분석 / Vaultn 누적 주문현황
  - 검색 카드 없음
  - 결과 테이블: 번호 / Publisher / SKU / Name / 주문수량 / GrossAmount 합계 / NetAmount 합계 / ActualBuyingPrice 합계 / 이익
  - tfoot 합계: 현재 페이지 표시 행의 수량·금액·이익 합산
  - 하단 pagination links_html
- 폼 필드/검증: 없음.
- 분기/리다이렉트: 화면에서 사용하는 분기 없음.
- 세션/권한 의존: admin 공통 include 및 statistics topmenu/sidebar. 서버 권한 강제는 백엔드 책임.
- dead/quirk:
  - 호출부는 `getOrderVaultnCount($page,$add_where,$orderby,$param,'30')`처럼 5번째 인자를 전달하지만 메서드 시그니처는 4개만 사용하고, 실제 `results_per_page`는 100이다.
  - 행 번호는 `num + (page - 1) * 100`으로 계산한다.
  - 하단 script의 `.btn_order_batch` AJAX는 버튼이 없어 실행 불가 dead 코드다.
  - breadcrumb 텍스트는 "Vaultn 주문분석"으로, 일/월별 "Vaultn 주문 분석"과 띄어쓰기가 다르다.

## 데이터 (legacy)
- 도메인 클래스·메서드: `Admin::getOrderVaultnCount($page,$add_where,$orderby,$param)`
- SQL 요약:
  - 테이블: `tbl_order_item_vaultn`
  - 조건: `sku is not null`
  - 집계: `sku`, `Name`, `publisherName` 기준 표시, `count(*)`, `sum(salesPriceGross)`, `sum(salesPriceGross/1.1)`, `sum(netPurchasePrice)`
  - 그룹/정렬: `group by sku order by sum(salesPriceGross-netPurchasePrice) desc`
  - 페이징: `results_per_page=100`
- 표시 계산:
  - 이익 = `total_NetAmount - total_ActualBuyingPrice`
  - 이익 음수면 `text-danger`
  - 행 비율은 NetAmount가 0보다 클 때만 `round(profit*100/net, 2)%`
  - tfoot 비율은 NetAmount 합계가 0보다 클 때만 `round(totalProfit*100/totalNet, 2) %`
  - ActualBuyingPrice 환산 없음.

## API 계약 (백엔드 전달)
- `GET /admin/statistics/order/vaultn-total-count`
  - query:
    - `page: number` — 빈값/비정상값이면 1
  - response:
    ```ts
    {
      page: number;
      items: Array<{
        sku: string;
        name: string;
        publisher_name: string;
        total_count: number;
        total_gross_amount: number;
        total_net_amount: number;
        total_actual_buying_price: number;
      }>;
      pagination: {
        current_page: number;
        total_pages: number;
        total_results: number;
      };
    }
    ```
  - 백엔드 책임:
    - `tbl_order_item_vaultn.publisherName` → `publisher_name`, `Name` → `name`, `salesPriceGross` 집계 → `total_gross_amount`, `salesPriceGross/1.1` 집계 → `total_net_amount`, `netPurchasePrice` 집계 → `total_actual_buying_price`로 매핑한다.
    - `where sku is not null` 조건을 유지한다.
    - 정렬은 legacy SQL 그대로 `sum(salesPriceGross-netPurchasePrice) desc`를 유지한다.
    - `results_per_page=100`으로 페이징한다.

## 타겟 매핑
- 라우트: `apps/directg-admin/src/routes/statistics/order/vaultn_total_count.tsx`
- screen: `apps/directg-admin/src/screens/statistics-vaultn-total-count`
- entities: `apps/directg-admin/src/entities/statistics`
- mock: `apps/directg-admin/src/shared/mocks/handlers/statistics.ts`

## Parity 체크리스트
- [x] 화면 요소 일치
- [x] 필드/검증 일치
- [x] 분기/플로우 일치
- [x] 엣지케이스 일치
