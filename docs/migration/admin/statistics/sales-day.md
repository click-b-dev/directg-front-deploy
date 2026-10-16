# 일별 매출현황

## 원본
- 파일: `pc/_Admin_/statistics/sales/sales_day.php` (sidebar_statistics.php에 노출된 라이브 링크)
- 참조 문서: `docs/legacy-admin/60-statistics.md`, `../legacy-project/docs/STATISTICS-REPORTING.md`

## 화면·플로우
- 진입 URL/파라미터: `/_Admin_/statistics/sales/sales_day.php?search_year=&search_month=`
- 기본값: `search_year=date('Y')`, `search_month=date('m')`
- 화면 요소 (legacy 기준):
  - breadcrumb: 홈 / 통계 / 매출분석 / 일별 매출현황
  - 검색 카드: 주문날짜 연도(2013~현재), 월(01~12), 검색 버튼
  - 결과 테이블: 날짜 / 결제건수 / 결제금액 / 포인트할인 / 할인비율 / 주문금액
  - 선택 월의 1일부터 말일까지 모든 일자 행 출력. 데이터 없는 일자는 0/빈 비율.
  - tfoot 합계: 선택 월 전체 결제건수·결제금액·포인트할인·주문금액 합산, 할인비율은 합계 주문금액이 0보다 클 때만 표시
- 폼 필드/검증: GET select만 사용, 클라이언트 검증 없음.
- 분기/리다이렉트: 없음.
- 세션/권한 의존: admin 공통 include 및 statistics topmenu/sidebar. 서버 권한 강제는 백엔드 책임.
- dead/quirk:
  - `batch_date`를 조회하지만 화면에 표시하지 않는다.
  - tfoot HTML에 `</td>` 오타가 있으나 브라우저 표시상 합계 행만 보인다.

## 데이터 (legacy)
- 도메인 클래스·메서드: 없음. 페이지 inline PDO SQL.
- SQL 요약:
  - 테이블: `tbl_sales_day`
  - 조건: `order_day between :start_date and :end_date`
  - 파라미터:
    - `start_date = {search_year}-{search_month}-01`
    - `end_date = {search_year}-{search_month}-{말일}`
  - 선택 컬럼: `order_day`, `order_price`, `checkout_price`, `checkout_count`, `emoney`, `batch_date`
  - 정렬: SQL에 명시 없음. 화면은 날짜 루프 기준으로 출력한다.
  - 페이징 없음
- 표시 계산:
  - 일별 할인비율 = `round(emoney / order_price * 100, 2) . "%"` (`order_price > 0`일 때만)
  - 합계 할인비율 = `round(total_use_point / total_order_price * 100, 2) . "%"` (`total_order_price > 0`일 때만)
  - 데이터 없는 날짜는 `number_format(null)`과 산술 누적 결과상 0으로 표시된다.

## API 계약 (백엔드 전달)
- `GET /admin/statistics/sales/day`
  - query:
    - `search_year: string` — 빈값이면 현재 연도
    - `search_month: string` — 빈값이면 현재 월
  - response:
    ```ts
    {
      search_year: string;
      search_month: string;
      days: Array<{
        order_day: string;
        order_price: number;
        checkout_price: number;
        checkout_count: number;
        emoney: number;
        batch_date: string;
      }>;
    }
    ```
  - 백엔드 책임:
    - `tbl_sales_day`에서 선택 월 범위의 sparse row만 내려준다. 없는 일자 0 채움은 프론트가 legacy 날짜 루프로 수행한다.
    - 숫자 컬럼 null은 0으로 정규화한다.
    - `batch_date`는 계약에 포함하지만 현재 화면에는 표시하지 않는다.

## 타겟 매핑
- 라우트: `apps/directg-admin/src/routes/statistics/sales/sales_day.tsx`
- screen: `apps/directg-admin/src/screens/statistics-sales-day`
- entities: `apps/directg-admin/src/entities/statistics`
- mock: `apps/directg-admin/src/shared/mocks/handlers/statistics.ts`

## Parity 체크리스트
- [x] 화면 요소 일치
- [x] 필드/검증 일치
- [x] 분기/플로우 일치
- [x] 엣지케이스 일치
