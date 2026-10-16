# 월별 매출현황

## 원본
- 파일: `pc/_Admin_/statistics/sales/sales_month.php` (sidebar_statistics.php에 노출된 라이브 링크)
- 참조 문서: `docs/legacy-admin/60-statistics.md`, `../legacy-project/docs/STATISTICS-REPORTING.md`

## 화면·플로우
- 진입 URL/파라미터: `/_Admin_/statistics/sales/sales_month.php?search_year=`
- 기본값: `search_year=date('Y')`
- 화면 요소 (legacy 기준):
  - breadcrumb: 홈 / 통계 / 매출분석 / 월별 매출현황
  - 검색 카드: 주문날짜 연도(2013~현재), 검색 버튼
  - 결과 테이블: 날짜 / 결제건수 / 결제금액 / 포인트할인 / 할인비율 / 주문금액
  - 선택 연도의 1월부터 12월까지 모든 월 행 출력. 데이터 없는 월은 0/빈 비율.
  - tfoot 합계: 선택 연도 전체 결제건수·결제금액·포인트할인·주문금액 합산, 할인비율은 합계 주문금액이 0보다 클 때만 표시
- 폼 필드/검증: GET `search_year` select만 사용, 클라이언트 검증 없음.
- 분기/리다이렉트: 없음.
- 세션/권한 의존: admin 공통 include 및 statistics topmenu/sidebar. 서버 권한 강제는 백엔드 책임.
- dead/quirk:
  - PHP가 `search_month`를 읽고 `$selected['search_month']`를 설정하지만 화면 입력과 SQL에는 사용하지 않는다.
  - tfoot HTML에 `</td>` 오타가 있으나 브라우저 표시상 합계 행만 보인다.

## 데이터 (legacy)
- 도메인 클래스·메서드: 없음. 페이지 inline PDO SQL.
- SQL 요약:
  - 테이블: `tbl_sales_day`
  - 조건: `date_format(order_day,'%Y')=:order_year`
  - group by: `date_format(order_day,'%Y-%m')`
  - 선택/집계 컬럼:
    - `date_format(order_day,'%Y-%m') as order_month`
    - `sum(order_price) as order_price`
    - `sum(checkout_price) as checkout_price`
    - `sum(checkout_count) as checkout_count`
    - `sum(emoney) as emoney`
  - 정렬: SQL에 명시 없음. 화면은 1월~12월 루프 기준으로 출력한다.
  - 페이징 없음
- 표시 계산:
  - 월별 할인비율 = `round(emoney / order_price * 100, 2) . "%"` (`order_price > 0`일 때만)
  - 합계 할인비율 = `round(total_use_point / total_order_price * 100, 2) . "%"` (`total_order_price > 0`일 때만)
  - 데이터 없는 월은 `number_format(null)`과 산술 누적 결과상 0으로 표시된다.

## API 계약 (백엔드 전달)
- `GET /admin/statistics/sales/month`
  - query:
    - `search_year: string` — 빈값이면 현재 연도
  - response:
    ```ts
    {
      search_year: string;
      months: Array<{
        order_month: string;
        order_price: number;
        checkout_price: number;
        checkout_count: number;
        emoney: number;
      }>;
    }
    ```
  - 백엔드 책임:
    - `tbl_sales_day`에서 선택 연도 기준 `order_day` 월 집계를 sparse row로 내려준다. 없는 월 0 채움은 프론트가 legacy 월 루프로 수행한다.
    - 숫자 컬럼 null은 0으로 정규화한다.
    - legacy가 읽기만 하는 `search_month`는 이 화면 계약에서 사용하지 않는다.

## 타겟 매핑
- 라우트: `apps/directg-admin/src/routes/statistics/sales/sales_month.tsx`
- screen: `apps/directg-admin/src/screens/statistics-sales-month`
- entities: `apps/directg-admin/src/entities/statistics`
- mock: `apps/directg-admin/src/shared/mocks/handlers/statistics.ts`

## Parity 체크리스트
- [x] 화면 요소 일치
- [x] 필드/검증 일치
- [x] 분기/플로우 일치
- [x] 엣지케이스 일치
