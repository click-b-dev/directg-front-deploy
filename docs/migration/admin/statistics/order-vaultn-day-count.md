# Vaultn 일별 주문현황

## 원본
- 파일: `pc/_Admin_/statistics/order/order_vaultn_day_count.php` (sidebar_statistics.php에 노출된 라이브 링크)
- 참조 문서: `docs/legacy-admin/60-statistics.md`, `../legacy-project/docs/STATISTICS-REPORTING.md`

## 화면·플로우
- 진입 URL/파라미터: `/_Admin_/statistics/order/order_vaultn_day_count.php?search_year=&search_month=&search_day=`
- 기본값: `search_year=date('Y')`, `search_month=date('m')`, `search_day=date('d')`
- 화면 요소 (legacy 기준):
  - breadcrumb: 홈 / 통계 / Vaultn 주문 분석 / Vaultn 일별 주문현황
  - 검색 카드: 주문날짜 연도(2013~현재), 월(01~12), 일(선택 연월의 말일), 검색 버튼
  - 결과 테이블: 동기화 / Publisher / SKU / Name / 주문수량 / GrossAmount 합계 / NetAmount 합계 / ActualBuyingPrice 합계 / DGKR 이익
  - tfoot 합계: 현재 조회 전체 행의 수량·금액·이익 합산
- 폼 필드/검증: GET select만 사용, 클라이언트 검증 없음. `search_day`가 있으면 `Y-m-d`로 정규화하고 없으면 오늘로 조회한다.
- 분기/리다이렉트: 동기화 AJAX 성공 시 `location.reload()`.
- 세션/권한 의존: admin 공통 include 및 statistics topmenu/sidebar. 서버 권한 강제는 백엔드 책임.

## 데이터 (legacy)
- 도메인 클래스·메서드: 없음. 페이지 inline PDO SQL.
- SQL 요약:
  - 테이블: `tbl_order_item_vaultn`
  - 조건: `ord_ymd=:ord_ymd`
  - 집계: `sku`, `Name`, `publisherName` 기준 표시, `count(*)`, `sum(salesPriceGross)`, `sum(salesPriceGross/1.1)`, `sum(netPurchasePrice)`
  - 그룹/정렬: `group by sku order by sum(salesPriceGross) desc`
  - 페이징 없음
- 표시 계산:
  - DGKR 이익 = `total_NetAmount - total_ActualBuyingPrice`
  - 이익 음수면 `text-danger`
  - 행 비율은 NetAmount가 0보다 클 때만 `round(profit*100/net, 2)%`
  - tfoot 비율은 NetAmount 합계가 0보다 클 때만 `round(totalProfit*100/totalNet, 2) %`
  - Genba와 달리 ActualBuyingPrice 환산 없음.
- AJAX:
  - 버튼 노출: `Name == ""`
  - POST `/_Admin_/goods/vaultn/vaultn_catalogue_sync.php`
  - body: `{ sku }`
  - success: reload, error: `alert(data)`

## API 계약 (백엔드 전달)
- `GET /admin/statistics/order/vaultn-day-count`
  - query:
    - `search_year: string` — 빈값이면 서버도 현재 연도 기본값 적용
    - `search_month: string` — 빈값이면 현재 월 기본값 적용
    - `search_day: string` — 빈값이면 현재 일 기본값 적용
  - response:
    ```ts
    {
      search_year: string;
      search_month: string;
      search_day: string;
      items: Array<{
        sku: string;
        name: string;
        publisher_name: string;
        total_count: number;
        total_gross_amount: number;
        total_net_amount: number;
        total_actual_buying_price: number;
      }>;
    }
    ```
  - 백엔드 책임:
    - `search_year-search_month-search_day`를 legacy `date('Y-m-d', strtotime(...))`와 동일하게 `ord_ymd`로 정규화한다.
    - `tbl_order_item_vaultn.publisherName` → `publisher_name`, `Name` → `name`, `salesPriceGross` 집계 → `total_gross_amount`, `salesPriceGross/1.1` 집계 → `total_net_amount`, `netPurchasePrice` 집계 → `total_actual_buying_price`로 매핑한다.
    - `sku is not null` 필터를 추가하지 않는다.
    - 정렬은 `sum(salesPriceGross) desc`를 유지한다.
- `POST /admin/statistics/order/vaultn-day-count/sync`
  - body: `{ sku: string }`
  - response: `{ success: boolean }`
  - 백엔드 책임: legacy `/_Admin_/goods/vaultn/vaultn_catalogue_sync.php`와 동일하게 SKU 카탈로그 동기화를 수행한다. 프론트는 성공 시 목록을 재조회한다.
  - error: legacy는 error callback에서 raw response object를 alert한다. API 오류 문자열은 원문 유지.

## 타겟 매핑
- 라우트: `apps/directg-admin/src/routes/statistics/order/order_vaultn_day_count.tsx`
- screen: `apps/directg-admin/src/screens/statistics-vaultn-day-count`
- entities: `apps/directg-admin/src/entities/statistics`
- mock: `apps/directg-admin/src/shared/mocks/handlers/statistics.ts`

## Parity 체크리스트
- [x] 화면 요소 일치
- [x] 필드/검증 일치
- [x] 분기/플로우 일치
- [x] 엣지케이스 일치
