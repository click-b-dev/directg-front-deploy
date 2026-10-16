# VaultN 월별 주문현황(리포트 비교용)

## 원본
- 파일: `pc/_Admin_/statistics/order/order_vaultn_month_count_compare.php` (sidebar_statistics.php에 노출된 라이브 링크)
- 참조 문서: `docs/legacy-admin/60-statistics.md`, `../legacy-project/docs/STATISTICS-REPORTING.md`

## 화면·플로우
- 진입 URL/파라미터: `/_Admin_/statistics/order/order_vaultn_month_count_compare.php?search_publisher=&search_year=&search_month=`
- 기본값:
  - `search_year=date('Y')`
  - `search_month=date('m')`
  - `search_publisher=38`
- 화면 요소 (legacy 기준):
  - breadcrumb: 홈 / 통계 / Vaultn 주문 분석 / Vaultn 주문현황
  - 검색 카드:
    - 공급처 select: 빈 option, `38` Bethesda, `81` Funcom
    - 주문날짜: 연도(2013~현재), 월(01~12), 검색 버튼
  - 결과 테이블: 주문일 / 상품번호 / SKU / Name / 주문번호 / 주문상태 / VaultN 상태 / API 전송날짜
  - tfoot 왼쪽 안내 문구, 오른쪽 주문/취소/기타/합계 카운트
- 폼 필드/검증: GET select만 사용, 클라이언트 검증 없음. 빈 `search_publisher`는 서버에서 38로 되돌아간다.
- 분기/리다이렉트: 화면에서 사용하는 분기 없음.
- 세션/권한 의존: admin 공통 include 및 statistics topmenu/sidebar. 서버 권한 강제는 백엔드 책임.
- dead/quirk:
  - `AdminOrder` 인스턴스는 `getOrderStatus()` 출력용으로만 사용한다.
  - 하단 script의 `.btn_order_batch` AJAX는 버튼이 없어 실행 불가 dead 코드다.
  - `order_count`는 모든 행마다 증가하고, 최종 합계는 `order_count - refund_count - etc_count`로 표시된다.

## 데이터 (legacy)
- 도메인 클래스·메서드:
  - inline PDO SQL
  - `AdminOrder::getOrderStatus($status)` 라벨 출력
- SQL 요약:
  - 테이블: `tbl_order_item a LEFT JOIN tbl_order_item_vaultn b ON a.ordno = b.clientOrderReference`
  - 조건:
    - `a.status > 1`
    - `a.publisher_code = :publisher_code`
    - `a.order_date BETWEEN :start_date AND :end_date`
  - 파라미터:
    - `publisher_code = search_publisher`
    - `start_date = {search_year}-{search_month}-01 09:00:00`
    - `end_date = date('Y-m-d H:i:s', strtotime({search_year}-{search_month}-{말일} 23:59:59 +9 hours))`
  - 선택 컬럼: `ordno`, `product_code`, `product_name`, `status`, `publisher_code`, `order_date`, `sku`, `vaultn_status`, `reg_date`
  - 정렬: `a.order_date ASC`
  - 페이징 없음
- 표시 계산:
  - 주문상태 `status != "2"`이면 모든 셀에 `text-danger`
  - VaultN 상태 `vaultn_status != "Completed"`이면 모든 셀에 `bg-warning`
  - `refund_count`: `status == "9"`
  - `etc_count`: `status != "2" && status != "9"`
  - `order_count`: 전체 행 수
  - `합계`: `order_count - refund_count - etc_count`

## API 계약 (백엔드 전달)
- `GET /admin/statistics/order/vaultn-month-count-compare`
  - query:
    - `search_publisher: string` — 빈값이면 `38`
    - `search_year: string` — 빈값이면 현재 연도
    - `search_month: string` — 빈값이면 현재 월
  - response:
    ```ts
    {
      search_publisher: string;
      search_year: string;
      search_month: string;
      items: Array<{
        ordno: string;
        product_code: string;
        product_name: string;
        status: string;
        publisher_code: string;
        order_date: string;
        sku: string;
        vaultn_status: string;
        reg_date: string;
      }>;
    }
    ```
  - 백엔드 책임:
    - `search_publisher` 기본값 `38`과 Bethesda/Funcom 대상 조건을 legacy와 동일하게 유지한다.
    - 선택 월의 `1일 09:00:00`부터 `말일 23:59:59 +9 hours`까지 `a.order_date BETWEEN`으로 조회한다.
    - `LEFT JOIN`이라 VaultN row가 없으면 `sku`, `vaultn_status`, `reg_date`는 빈 문자열로 내려준다.
    - 정렬은 `a.order_date ASC`를 유지한다.

## 타겟 매핑
- 라우트: `apps/directg-admin/src/routes/statistics/order/order_vaultn_month_count_compare.tsx`
- screen: `apps/directg-admin/src/screens/statistics-vaultn-month-count-compare`
- entities: `apps/directg-admin/src/entities/statistics`
- mock: `apps/directg-admin/src/shared/mocks/handlers/statistics.ts`

## Parity 체크리스트
- [x] 화면 요소 일치
- [x] 필드/검증 일치
- [x] 분기/플로우 일치
- [x] 엣지케이스 일치
