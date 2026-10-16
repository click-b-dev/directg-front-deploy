# Sales list 동기화

> P2 파트너·정산 다섯 번째 단위(리포트 관리 그룹 1/4). 파트너별 월간 판매(옵션상품 단위) 집계 목록 + 동기화 배치(저장 프로시저) + 엑셀 다운로드. 이 데이터(`tbl_sales_publisher`)는 리포트 생성(report_register)의 원천.

## 원본
- 파일: `pc/_Admin_/partner/sales_list.php` (라이브 — 변형 없음, 사이드바 `sidebar_partner.php` 리포트 관리 그룹 "Sales list 동기화" 링크 대상)
- 처리:
  - 동기화: `partner/report_ps.php` `mode=report_batch` (`call sp_sales_publisher_insert_batch`)
  - 엑셀: `partner/excel_sales_ps.php` (`mode=sales_excel_download`)
- 데이터: `AdminPartner::getPartnerSalesList()`, `getPartnerListAll('')`, `getPartnerName()`
- 참조: `docs/legacy-admin/70-partner-code-china.md`, `../legacy-project/docs/PARTNER-SETTLEMENT.md`

## 화면·플로우
- 진입 URL: `/partner/sales_list` — GET `search_publisher_code`, `search_year`, `search_month`
  - `search_year` 기본값: **현재 연도** `date("Y")`
  - `search_month` 기본값: **전월** `date('m', strtotime('-1 month'))`
  - 기간: `start = year-month-01`, `end = year-month-{말일}`(`date('t')`)
- breadcrumb: 홈/파트너/**리포트 관리**/Sales list 동기화. h4 동일.
- 검색필터 카드(header `bg-secondary` "검색필터"):
  - 기간검색: `search_year` select(`:::년도:::` + 2021~현재연도, "N년") + `search_month` **radio 버튼그룹**(btn-check, 1~12월, `sprintf('%02d')`, "NN월")
  - 파트너: `search_publisher_code` select(select2 → native, `getPartnerListAll('')` 전체 파트너, `:::파트너 선택:::`)
  - "Sales list 조회" **submit 버튼**(btn-secondary, `#btn_search`) — 명시적 제출(auto-submit 아님)
- 액션 바: 좌 "Sales list 동기화"(btn-primary, `#btn_sales_sync`) / 우 "Sales list 엑셀 다운로드"(btn-light, `#btn_excel_download`)
- `{count($sales_list)} 개`
- 테이블(`#excelData`로 감쌈, colgroup 15/10/*/10/10/10):
  - **6컬럼**: 파트너명(`getPartnerName(publisher_code)`) / 옵션상품코드(product_code) / 옵션상품명(product_nm) / SRP(order_srp, number_format) / 판매수량(cc) / 합계(sum_settleprice)
  - tfoot: "{year}년 {month}월 합계" colspan=3, 빈 th, 판매수량 합계(total_sold), 합계금액(total_price)**원**
- **파트너 미선택(`search_publisher_code` 없음) 시 목록 조회 안 함(빈 배열)** — year/month는 항상 기본값 존재.

### 인터랙션
- **동기화**(`#btn_sales_sync`): publisher_code/year/month 읽기. publisher_code 없으면 `alert("파트너를 선택하세요.")` return.
  - AJAX `POST report_ps.php` {mode:'report_batch', publisher_code, search_year, search_month}.
  - success: `location.href='sales_list.php?search_year=..&search_month=..&search_publisher_code=..'`(동기화 후 해당 조건으로 이동). success 응답 메시지("동기화가 완료되었습니다...")는 **무시**(주석). error: `alert(data)`.
  - report_batch = `call sp_sales_publisher_insert_batch(publisher_code, start, end, @Result)` — tbl_sales_publisher 집계/삽입(저장 프로시저, 백엔드 책임).
- **엑셀 다운로드**(`#btn_excel_download`): legacy는 클라이언트가 `#excelData` innerHTML을 `encodeURI`해 `POST excel_sales_ps.php` {mode, excel_name, data} → 서버가 HTML을 `.xls`로 wrapping해 반환.
  - excel_name: `sales_{파트너명}_매출통계_{year}_{month}`.
- **btn_srp_edit**: JS 바인딩 있으나 **테이블에 해당 버튼/인풋 없음 → dead**(SRP 편집 미렌더). 미이관.
- 세션/권한: `$_SESSION['admin']` 가드(공통).

### 데이터 (legacy)
- `getPartnerSalesList($publisher_code, $start, $end)`:
  ```sql
  select ord_ymd, publisher_code, product_code, product_nm, order_srp,
         count(*) as cc, sum(qty*order_srp) as sum_settleprice
  from tbl_sales_publisher
  where publisher_code = :publisher_code
    and ord_ymd between :start and :end
    and cdt <> '1970-01-01 09:00:00'
  group by product_code, order_srp
  order by count(*) desc
  ```
- `getPartnerListAll('')` → `select publisher_code, publisher_name, report_term from tbl_partner order by publisher_name asc`(전체 파트너).
- `getPartnerName($publisher_code)` → publisher_name(행마다 호출, N+1).

## API 계약 (백엔드 전달)
- `GET /admin/partner/sales-list` — query `publisher_code`, `year`, `month`(또는 start/end) → `{ items: [{publisher_code, publisher_name, product_code, product_nm, order_srp, cc, sum_settleprice}], total_sold, total_price }`. group by product_code,order_srp / order by count(*) desc / `cdt<>'1970-01-01 09:00:00'` 필터.
  - **publisher_code 미지정 시 빈 items**(legacy 조회 안 함). **publisher_name은 응답에 포함**(legacy getPartnerName N+1을 서버 join으로).
  - total_sold=Σcc, total_price=Σsum_settleprice(합계 행).
- `GET /admin/partner/list-all` — 전체 파트너 → `[{publisher_code, publisher_name, report_term}]`(publisher_name asc). sales/refund/report 공통.
- `POST /admin/partner/sales-list/sync` — body {publisher_code, year, month} → `{ message: "동기화가 완료되었습니다. 새로 고침해주십시요" }`. 백엔드는 `sp_sales_publisher_insert_batch(publisher_code, start, end)` 실행(기간=해당 월 1일~말일).
- `GET /admin/partner/sales-list/excel` — query `publisher_code`, `year`, `month` → `.xls` 파일 응답(sales_list 화면과 동일 데이터/합계). **china 선례(백엔드 GET 위임)** 적용.
- 백엔드 책임: 저장 프로시저 실행, 엑셀 파일 생성, publisher_name join.

## 타겟 매핑
- 라우트: `/partner/sales_list` (`routes/partner/sales_list.tsx`)
- screens: `screens/partner-sales-list`
- entities: `entities/partner` 확장(sales-list 조회/list-all/sync)
- mock: `shared/mocks/handlers/partner.ts` 확장(sales fixture + sync)

## 의도적 parity 판단 (게이트 승인 대상)
- **엑셀**: legacy는 클라 HTML POST(`excel_sales_ps.php` wrapping)이나, 이관은 **china 선례대로 백엔드 GET 엔드포인트 위임**(`window.location.href`). 결과 파일 동일, 방식 이탈.
- **동기화 후 동작**: legacy `location.href`(조회 조건으로 전체 리로드) → React는 mutation 성공 시 **목록 invalidate + 검색 조건 반영(navigate)**. 결과(동기화 후 해당 조건 목록 표시) 동일.
- **btn_srp_edit dead JS 미이관**, **파트너명 N+1 → 서버 join**.

## Parity 체크리스트
- [ ] 검색필터(year select 2021~현재·month radio 1~12·파트너 select)·기본값(현재연/전월)
- [ ] "Sales list 조회" submit 버튼
- [ ] 동기화 버튼(파트너 미선택 alert·POST→조건 반영 재조회)
- [ ] 엑셀 다운로드 버튼(백엔드 GET 위임)
- [ ] `{n} 개` + 6컬럼 + tfoot 합계(판매수량/합계금액 원)
- [ ] 파트너 미선택 시 빈 목록
- [ ] number_format(천단위)·정렬(count desc)
