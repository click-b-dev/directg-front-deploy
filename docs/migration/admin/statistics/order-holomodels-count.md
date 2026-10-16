# 홀로 모델 주문현황

## 원본
- 파일: `pc/_Admin_/statistics/order/order_holomodels_count.php` (sidebar_statistics.php에 노출된 라이브 링크)
- 참조 문서: `docs/legacy-admin/60-statistics.md`, `../legacy-project/docs/STATISTICS-REPORTING.md`

## 화면·플로우
- 진입 URL/파라미터: `/_Admin_/statistics/order/order_holomodels_count.php?search_year=&search_month=`
- 기본값: `search_year=date('Y')`, `search_month=date('m')`
- 화면 요소 (legacy 기준):
  - breadcrumb: 홈 / 통계 / 주문분석 / 홀로 모델 주문현황
  - 검색필터 카드: header `검색필터`, 주문기간 연도(2013~현재), 월(01~12), `검 색` 버튼
  - 통계 요약 카드: 데이터가 있을 때만 총 상품 수 / 총 판매 수량 / 총 판매 금액 3개 카드 표시
  - 결과 테이블: No. / 상품코드 / 상품명 / 판매 수량 / 판매 금액
  - 데이터 없을 때: `colspan="6"` 행에 `조회된 데이터가 없습니다.`
  - 데이터 있을 때만 tfoot `합 계` 표시
- 폼 필드/검증: GET select만 사용, 클라이언트 검증 없음. 빈 연/월 option이 있지만 상단 기본값 처리로 실제 조회는 현재 연월이 된다.
- 분기/리다이렉트: 없음.
- 세션/권한 의존: admin 공통 include 및 statistics topmenu/sidebar. 서버 권한 강제는 백엔드 책임.
- dead/quirk:
  - `$page`를 체크하지만 filter input이 없어 실사용 없음.
  - `AdminGoods` 인스턴스를 만들지만 화면/조회에 사용하지 않는다.
  - 날짜 계산부의 빈 연/월 분기 일부는 상단 기본값 처리 때문에 도달하지 않는다.
  - 빈 데이터 행은 실제 컬럼 수 5보다 큰 `colspan="6"`이다.

## 데이터 (legacy)
- 도메인 클래스·메서드: `Admin::getHolomodelsSalesCount($start_date,$end_date)`
- SQL 요약:
  - 테이블: `tbl_title_option a INNER JOIN tbl_sales b ON a.product_code = b.product_code`
  - 조건:
    - `a.product_type='holomodels'`
    - `b.ord_ymd BETWEEN :start_date AND :end_date`
  - 선택/집계:
    - `a.title_id`, `a.product_type`, `b.product_code`, `b.product_name`
    - `SUM(b.sales_count) AS sales_count`
    - `SUM(b.sales_count * b.unit_price) AS sales_amount`
  - 그룹/정렬:
    - `GROUP BY a.product_type, b.product_code, b.product_name`
    - `ORDER BY sales_count DESC`
  - 페이징 없음

## API 계약 (백엔드 전달)
- `GET /admin/statistics/order/holomodels-count`
  - query:
    - `search_year: string` — 빈값이면 현재 연도
    - `search_month: string` — 빈값이면 현재 월
  - response:
    ```ts
    {
      search_year: string;
      search_month: string;
      items: Array<{
        product_code: string;
        product_name: string;
        sales_count: number;
        sales_amount: number;
      }>;
    }
    ```
  - 백엔드 책임:
    - legacy와 동일하게 `search_year-search_month-01`부터 해당 월 말일까지 `b.ord_ymd BETWEEN`으로 조회한다.
    - `tbl_title_option.product_type='holomodels'` 조건을 유지한다.
    - 정렬은 `sales_count DESC`를 유지한다.
    - 화면 요약은 프론트가 응답 행 기준으로 계산한다.

## 타겟 매핑
- 라우트: `apps/directg-admin/src/routes/statistics/order/order_holomodels_count.tsx`
- screen: `apps/directg-admin/src/screens/statistics-holomodels-count`
- entities: `apps/directg-admin/src/entities/statistics`
- mock: `apps/directg-admin/src/shared/mocks/handlers/statistics.ts`

## Parity 체크리스트
- [x] 화면 요소 일치
- [x] 필드/검증 일치
- [x] 분기/플로우 일치
- [x] 엣지케이스 일치
