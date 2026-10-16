# Refund list 동기화

> P2 파트너·정산 여섯 번째 단위(리포트 관리 그룹 2/4). 파트너별 월간 환불(옵션상품 단위) 집계 목록 + 동기화 배치 + 엑셀. **sales_list(#258)와 거의 동일 구조**, 환불(status='9', canceldt 기준) 차이. 리포트 생성의 환불 원천.

## 원본
- 파일: `pc/_Admin_/partner/refund_list.php` (라이브 — 사이드바 리포트 관리 그룹 "Refund list 동기화")
- 처리:
  - 동기화: `report_ps.php` `mode=refund_batch` (`call sp_sales_publisher_refund_batch`)
  - 엑셀: `excel_refund_ps.php` (`mode=refund_excel_download`) — **서버가 파라미터로 상세 조회 후 엑셀 생성**
- 데이터: `AdminPartner::getPartnerRefundList()`, `getPartnerListAll('')`, `getPartnerName()`
- 참조: `docs/legacy-admin/70-partner-code-china.md`, `../legacy-project/docs/PARTNER-SETTLEMENT.md`

## 화면·플로우 (sales_list와 동일한 부분은 생략, **차이만** 강조)
- 진입 URL: `/partner/refund_list` — GET `search_publisher_code`, `search_year`, `search_month`
  - `search_year` 기본값: 현재 연도 `date("Y")`
  - `search_month` 기본값: 전월. **차이: 전월이 "12"이면 `search_year -= 1`(연도 보정)** — sales_list는 보정 없음. → 1월 접속 시 month=12, year=현재연도-1.
  - `search_date = year-month`(sales처럼 start/end 분리 안 함)
- breadcrumb: 홈/파트너/리포트 관리/**Refund list 동기화**
- 검색필터: sales와 동일(year select 2021~현재·month radio 1~12·파트너 select `getPartnerListAll('')`), 조회 버튼 "**Refund list 조회**"
- 액션 바: "**Refund list 동기화**"(btn-primary) / "**Refund list 엑셀 다운로드**"(btn-light)
- `{count} 개`
- 테이블(**`id="excelData"` 없음** — refund는 클라 HTML을 서버에 안 보냄, colgroup 15/10/*/10/10/10):
  - 6컬럼: 파트너명(`getPartnerName`) / 옵션상품코드 / 옵션상품명 / SRP(order_srp) / 판매수량(cc) / 합계(sum_settleprice) — sales와 동일
  - tfoot: "{year}년 {month}월 합계" colspan=3, 빈 th, 판매수량 합계, 합계금액 **원**
- **파트너 미선택 시 목록 조회 안 함(빈 배열)**.

### 인터랙션 (차이)
- **동기화**(`#btn_refund_sync`): publisher_code 없으면 `alert("퍼블리셔를 선택하세요.")`(**sales는 "파트너를..."**) return.
  - AJAX `POST report_ps.php` {mode:'refund_batch', publisher_code, search_year, search_month} → success: `location.href='refund_list.php?...'`. error: alert.
  - refund_batch = `call sp_sales_publisher_refund_batch(publisher_code, start, end)`, 기간 `year-month-01 00:00:00` ~ `말일 23:59:59`(**시분초 포함**).
- **엑셀**(`#btn_excel_download`): legacy는 form POST `excel_refund_ps.php` {mode, excel_name, publisher, publisher_code, search_year, search_month}. **서버가 파라미터로 직접 조회**(`status='9'`, `date_format(canceldt,'%Y-%m')`)해 **상세 환불목록**(환불일자/퍼블리셔/상품코드/상품명/수량/SRP/주문일자, 개별건 raw) 엑셀 생성. excel_name=`{publisher}_환불통계_{year}_{month}`.
  - **sales 엑셀(클라 HTML wrapping)과 방식·내용 다름** — refund는 서버 조회. 이관은 **china 선례 백엔드 GET 위임**으로 통일.
- **btn_srp_edit 없음**(sales에만 있던 dead JS).

### 데이터 (legacy)
- `getPartnerRefundList($publisher_code, $search_date)`:
  ```sql
  select ord_ymd, publisher_code, product_code, product_nm, order_srp,
         count(*) as cc, sum(qty*order_srp) as sum_settleprice
  from tbl_sales_publisher
  where publisher_code = :publisher_code
    and date_format(canceldt,'%Y-%m') = :search_date   -- 환불일 월
    and cdt <> '1970-01-01 09:00:00'
    and status = '9'                                   -- 환불 상태
  group by product_code, order_srp
  order by count(*) desc
  ```
- `getPartnerListAll('')`, `getPartnerName()` — sales와 동일(공통 재사용).

## API 계약 (백엔드 전달)
- `GET /admin/partner/refund-list` — query `publisher_code`, `year`, `month` → `{ items: [{publisher_code, publisher_name, product_code, product_nm, order_srp, cc, sum_settleprice}], total_sold, total_price }`. `status='9'` + `date_format(canceldt,'%Y-%m')=year-month` 필터 / group by product_code,order_srp / order count desc. publisher_code 미지정 시 빈 items. publisher_name 서버 join.
- `GET /admin/partner/list-all` — (#258에서 정의, 재사용).
- `POST /admin/partner/refund-list/sync` — body {publisher_code, year, month} → `{ message: "동기화가 완료되었습니다. 새로 고침해주십시요" }`. 백엔드 `sp_sales_publisher_refund_batch`(기간 해당 월 `00:00:00`~`23:59:59`).
- `GET /admin/partner/refund-list/excel` — query `publisher_code`, `year`, `month` → `.xls`(상세 환불목록: 환불일자/퍼블리셔/상품코드/상품명/수량/SRP/주문일자, 합계). **china 선례(백엔드 GET 위임)**.
- 백엔드 책임: refund 저장 프로시저, 엑셀 상세 조회·생성, publisher_name join.

## 타겟 매핑
- 라우트: `/partner/refund_list` (`routes/partner/refund_list.tsx`)
- screens: `screens/partner-refund-list`
- entities: `entities/partner` 확장(refund-list 조회/sync; list-all 재사용)
- mock: `shared/mocks/handlers/partner.ts` 확장(refund fixture + sync)

## 의도적 parity 판단 (게이트 승인 대상)
- **엑셀**: 백엔드 GET 위임(china 선례). refund는 legacy도 서버 조회 방식이라 자연스럽게 매핑.
- **동기화 후 동작**: mutation invalidate + navigate(조회 조건 반영) = legacy location.href.
- **파트너명 N+1 → 서버 join**.

## Parity 체크리스트
- [ ] 기본값(현재연/전월, **전월 12월이면 연도-1** quirk)
- [ ] 검색필터·"Refund list 조회" submit
- [ ] 동기화(파트너 미선택 **"퍼블리셔를 선택하세요."**·POST refund_batch→조건 재조회)
- [ ] 엑셀 다운로드(백엔드 GET 위임)
- [ ] `{n} 개` + 6컬럼 + tfoot 합계(원)
- [ ] 파트너 미선택 시 빈 목록·number_format·정렬(count desc)
- [ ] 테이블 id="excelData" 없음
