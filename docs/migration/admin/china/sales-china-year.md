# 중국 누적매출 현황

## 원본
- 파일: `pc/_Admin_/china/sales_china_year.php` (173줄, 라이브)
- 도메인: `src/classes/China.php::getSalesByYear` (DGKR DB: `$dsn_dgkr`)
- 참조 문서: `docs/migration/admin/china/invoice-list.md`(영역 개요)

## 화면·플로우
- 진입 URL: `/china/sales_china_year` (사이드바) — GET `page`, `search_year`(둘 다 **미사용**, 검색 카드가 d-none)
- **읽기전용 통계 매트릭스**(필터·페이지네이션·mutation 없음):
  - breadcrumb: 홈 / 중국 결제 / 중국 결제 관리 / 중국 누적매출 현황
  - h4 "중국 누적매출 현황"
  - **검색필터 카드는 `d-none`(숨김·dead)** — 연도 select(2016~현재)만 있고 기능 없음. 마크업 fidelity로 d-none 유지.
  - 매트릭스 테이블:
    - **행 = 연도**(2016 ~ 현재년 date('Y')), **열 = 4개 고정 지역 + 합계**
    - thead: `연도별 매출` | 중국 산시성 | 중국 안후이성 | 중국 저장성 | 중국 허난성 | `합계`
    - tbody 각 연도: `{year}년` | 지역별 amount(number_format+" 원") | 해당연도 합계(4지역 합)
    - tfoot `누적 매출`: 지역별 전체연도 합 | 전체 총합
    - **zero-value**: amount가 falsy(0/null)이면 `.zero-value`(color #C0C0C0 회색) — 페이지 `<style>` 이식
- 매출대상(하드코딩 지역→DirectG 계정 email, legacy `$target_name_arr`):
  - 중국 산시성 → `510616056@qq.com`
  - 중국 안후이성 → `yu13705514354@hotmail.com`
  - 중국 저장성 → `2094609892@qq.com`
  - 중국 허난성 → `sihuanxiaomaibu@hotmail.com`
  - **email은 백엔드 쿼리 키(민감) → 백엔드가 지역→email 매핑 소유**. 프론트는 응답의 지역명/금액만 렌더.
- 세션/권한: `lib.php` 관리자 세션 가드(공통).

## 데이터 (legacy)
- `China::getSalesByYear($target_email, $year)`:
  ```sql
  SELECT SUM(tioi.price * tioi.qty) AS amount
  FROM tbl_invoice_order tio
    INNER JOIN tbl_invoice_order_item tioi ON tio.settle_no = tioi.settle_no
  WHERE tio.email = '{target}' AND tio.step = 2 AND tio.flag = 'Y'
    AND tio.ord_ymd BETWEEN '{year}-01-01' AND '{year}-12-31'
  ```
  - **DGKR DB**(`$dsn_dgkr`/`DGKR_USER`/`DGKR_PASSWORD`) — 별도 커넥션
  - 지역(email)×연도별 결제완료(step=2, flag='Y') 주문의 `Σ(price×qty)`
  - 합계/누적은 PHP에서 array_sum(백엔드 집계 책임)

## API 계약 (백엔드 전달)
- `GET /admin/china/sales/year` — 연도×지역 누적매출 매트릭스
  - 요청: 없음(필터 dead)
  - 응답:
    ```json
    {
      "regions": ["중국 산시성", "중국 안후이성", "중국 저장성", "중국 허난성"],
      "rows": [ { "year": 2016, "amounts": [0,0,0,0], "total": 0 }, ... ],
      "region_totals": [0,0,0,0],
      "grand_total": 0
    }
    ```
  - 백엔드 책임:
    - 지역→email 매핑 소유(민감정보 서버측)
    - 연도 범위 2016 ~ 서버 현재년
    - 셀 = `SUM(price×qty)` step=2·flag='Y'·해당연도(DGKR DB)
    - `total`(연도별 4지역 합)·`region_totals`(지역별 전연도 합)·`grand_total` 집계

## 타겟 매핑
- 라우트: `/china/sales_china_year` (`routes/china/sales_china_year.tsx`)
- screens: `screens/china-sales-year`
- entities: `entities/china` 확장(sales-year matrix)
- mock: `handlers/china` 확장(GET sales/year)

## Parity 체크리스트
- [ ] 화면 요소 일치 (매트릭스 헤더 6열·연도 행·tfoot 누적·d-none 검색카드)
- [ ] 필드/검증 일치 (number_format+" 원"·zero-value 회색·연도 2016~현재)
- [ ] 분기/플로우 일치 (필터 dead·합계/누적 집계)
- [ ] 엣지케이스 일치 (amount 0 → 회색·빈 데이터)
