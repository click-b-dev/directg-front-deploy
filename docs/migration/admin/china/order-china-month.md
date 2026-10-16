# 중국 월별주문 현황

## 원본
- 파일: `pc/_Admin_/china/order_china_month.php` (330줄, 라이브)
- 도메인: `src/classes/China.php::getOrderByMonthTitles` + `getSalesByMonth`(add_where) (DGKR DB)
- 참조 문서: `docs/migration/admin/china/sales-china-month.md`(#224 자매)

## 화면·플로우
- 진입 URL: `/china/order_china_month` (사이드바) — GET `search_year`(기본 현재년), `search_month`(기본 date('n') 현재월), `mode`(=excel CSV 다운로드)
- **타이틀별 월별주문 매트릭스**(읽기전용) — #224보다 복잡(타이틀 breakdown):
  - breadcrumb: 홈 / 중국 결제 / 중국 결제 관리 / 중국 월별주문 현황
  - h4 "중국 월별주문 현황"
  - 검색필터(노출): **연도 select + 월 select**, 둘 다 `onchange="this.form.submit()"` 자동제출·기본 현재년/현재월·submit 버튼 d-none
  - **2행 헤더 테이블**:
    - Row1: `{year}년 {month}월` | 플랫폼(rowspan2) | 단가(rowspan2) | [지역명](colspan2 ×4) | 전체 합계(colspan2)
    - Row2: 타이틀별 | [수량·금액] ×4지역 | 수량 | 합계 금액
    - **13열**(타이틀/플랫폼/단가 + 수량·금액×4 + 수량합계·합계금액)
  - tbody: 타이틀(product_nm)별 행 — product_nm | platform | number_format(price) | 지역별 [qty·amount] | row_qty | row_amount
  - tfoot 총합계(colspan3) | 지역별 [total_qty·total_amount] | total_all_qty | **total_all_amount+" 원"**
  - **zero-value #C0C0C0**(qty/amount 0)
  - **CSV 다운로드 버튼**: 클릭 → excel_form(mode=excel + year + month) 제출 → 백엔드 .xls 생성(HTML 테이블 + mso 스타일). **검증(total_results>0) 주석 dead → 항상 제출**
- 매출대상: #223/#224 동일 하드코딩 4지역→email(백엔드 소유)
- 세션/권한: `lib.php` 관리자 세션 가드(공통).

## 데이터 (legacy)
- 타이틀 목록 `China::getOrderByMonthTitles($year, $month)`:
  ```sql
  SELECT tioi.product_code, tioi.product_nm, tioi.platform, tioi.price
  FROM tbl_invoice_order tio INNER JOIN tbl_invoice_order_item tioi ON tio.settle_no = tioi.settle_no
  WHERE 1 AND tio.step = 2 AND tio.flag = 'Y'
    AND tio.ord_ymd BETWEEN '{year}-{month}-01' AND '{year}-{month}-31'
  GROUP BY tioi.product_nm, tioi.platform, tioi.price
  ORDER BY tioi.product_nm ASC, tioi.platform ASC, tioi.price ASC
  ```
- 셀 `China::getSalesByMonth($target_email, $year, $month, $add_where)`:
  - `$add_where = "AND tioi.product_nm='{nm}' AND tioi.platform='{plat}' AND tioi.price='{price}'"`
  - 반환 `{qty, amount}` = 해당 타이틀·지역의 SUM(qty), SUM(price×qty)
- 합계/총합은 PHP 누적(백엔드 집계 책임). **DGKR DB**.
- **CSV(mode=excel)**: HTML 테이블을 `application/vnd.ms-excel`로 출력(BOM·mso-number-format)

## API 계약 (백엔드 전달)
- `GET /admin/china/orders/month` — 선택 연월 타이틀별 주문 매트릭스
  - 요청: `search_year`(기본 현재년), `search_month`(기본 현재월)
  - 응답:
    ```json
    {
      "year": 2026, "month": 8,
      "regions": ["중국 산시성", "중국 안후이성", "중국 저장성", "중국 허난성"],
      "titles": [
        { "product_nm": "...", "platform": "PS5", "price": 88000,
          "cells": [ { "qty": 0, "amount": 0 }, ... 4지역 ],
          "row_qty": 0, "row_amount": 0 }
      ],
      "region_totals": [ { "qty": 0, "amount": 0 }, ... 4 ],
      "total_all_qty": 0, "total_all_amount": 0
    }
    ```
  - 백엔드: 타이틀 그룹(step=2·flag='Y'·연월) + 타이틀×지역 SUM(qty)/SUM(price×qty) + 합계 집계(DGKR)
- `GET /admin/china/orders/month/excel` — CSV(.xls) 다운로드
  - 요청: `search_year`, `search_month`
  - 응답: `application/vnd.ms-excel` 파일(백엔드 생성, **바이너리 → MSW mock 불가**, asset download #168 선례)

## 타겟 매핑
- 라우트: `/china/order_china_month` (`routes/china/order_china_month.tsx`)
- screens: `screens/china-order-month`
- entities: `entities/china` 확장(order-month matrix)
- mock: `handlers/china` 확장(GET orders/month). CSV 엔드포인트는 백엔드(mock 없음)

## Parity 체크리스트
- [ ] 화면 요소 일치 (연도+월 select 작동·2행 헤더 13열·tfoot 총합계·CSV 버튼)
- [ ] 필드/검증 일치 (number_format·total_all_amount만 " 원"·zero-value 회색)
- [ ] 분기/플로우 일치 (연월 auto-submit·CSV 항상 제출[검증 dead]·집계)
- [ ] 엣지케이스 일치 (qty/amount 0 → 회색·빈 타이틀·기본 현재연월)
