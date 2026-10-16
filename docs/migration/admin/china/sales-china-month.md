# 중국 월별매출 현황

## 원본
- 파일: `pc/_Admin_/china/sales_china_month.php` (179줄, 라이브)
- 도메인: `src/classes/China.php::getSalesByMonth` (DGKR DB)
- 참조 문서: `docs/migration/admin/china/sales-china-year.md`(#223 자매 — 연도 버전)

## 화면·플로우
- 진입 URL: `/china/sales_china_month` (사이드바) — GET `search_year`(기본 현재년), `page`(미사용)
- **#223(누적매출)의 월 버전** — 읽기전용 매트릭스. 차이:
  - **행 = 월(1~12)** (연도 버전은 행=연도)
  - **연도 필터 기능 작동**: 검색카드(표시됨)의 연도 select `onchange="this.form.submit()"` (변경 시 자동 제출)·기본 현재년·submit 버튼은 **d-none**(숨김, select가 auto-submit)
  - thead 첫 열: `{search_year}년 매출`
  - 열 = 4 고정 지역(산시성/안후이성/저장성/허난성) + 합계
  - tbody 각 월: `{month}월` | 지역별 amount(number_format+" 원") | 해당월 합계(4지역 합)
  - tfoot `합계`: 지역별 12개월 합 | 전체 총합
  - **zero-value #C0C0C0 회색**(amount 0/null)
- 매출대상: #223과 동일 하드코딩 4지역→email(백엔드 소유)
- 세션/권한: `lib.php` 관리자 세션 가드(공통).

## 데이터 (legacy)
- `China::getSalesByMonth($target_email, $year, $month)`:
  ```sql
  SELECT SUM(tioi.price * tioi.qty) AS amount, SUM(tioi.qty) AS qty
  FROM tbl_invoice_order tio
    INNER JOIN tbl_invoice_order_item tioi ON tio.settle_no = tioi.settle_no
  WHERE tio.email = '{target}' AND tio.step = 2 AND tio.flag = 'Y'
    AND tio.ord_ymd BETWEEN '{year}-{month}-01' AND '{year}-{month}-31'
  ```
  - **DGKR DB**, 지역(email)×월별 결제완료(step=2, flag='Y') `Σ(price×qty)`
  - `qty` 컬럼도 SELECT하나 **화면 미사용**(amount만)
  - month는 raw(1~12, zero-pad 없음)·BETWEEN month-01~month-31(MySQL이 짧은 달 처리)
  - 합계/총합은 PHP array_sum(백엔드 집계)

## API 계약 (백엔드 전달)
- `GET /admin/china/sales/month` — 선택연도 월×지역 매출 매트릭스
  - 요청: `search_year`(기본 서버 현재년)
  - 응답:
    ```json
    {
      "year": 2026,
      "regions": ["중국 산시성", "중국 안후이성", "중국 저장성", "중국 허난성"],
      "rows": [ { "month": 1, "amounts": [0,0,0,0], "total": 0 }, ... 12개 ],
      "region_totals": [0,0,0,0],
      "grand_total": 0
    }
    ```
  - 백엔드 책임: 지역→email 매핑(민감, 서버측)·셀 `SUM(price×qty)` step=2·flag='Y'·해당연월(DGKR)·월합/지역누적/총합 집계

## 타겟 매핑
- 라우트: `/china/sales_china_month` (`routes/china/sales_china_month.tsx`)
- screens: `screens/china-sales-month`
- entities: `entities/china` 확장(sales-month matrix)
- mock: `handlers/china` 확장(GET sales/month)

## Parity 체크리스트
- [ ] 화면 요소 일치 (연도 select 작동·thead {연도}년 매출·12개월 행·tfoot 합계·6열)
- [ ] 필드/검증 일치 (number_format+" 원"·zero-value 회색·연도 2016~현재·기본 현재년)
- [ ] 분기/플로우 일치 (연도 변경 auto-submit·submit 버튼 d-none·집계)
- [ ] 엣지케이스 일치 (amount 0 → 회색·빈 데이터·qty 미사용)
