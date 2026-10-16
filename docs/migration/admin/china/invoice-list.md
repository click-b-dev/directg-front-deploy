# 중국 영역 기반 — 사이드바 + 중국 결제완료 리스트

## 원본
- 파일: `pc/_Admin_/china/invoice_list.php` (223줄, 라이브 — topbar `중국결제` 진입점)
- 사이드바: `pc/_Admin_/inc/sidebar_china.php` (단일 그룹 "중국 결제 관리" 8메뉴, `collapse show`)
- 도메인: `src/classes/China.php::getChinaInvoiceList` (China extends Pagination)
- 참조 문서: `docs/legacy-admin/`(china 미문서화 — 신규 발견 영역), `../legacy-project/docs/PROJECT-OVERVIEW.md`

## 영역 개요 (china)
sidebar_china 라이브 메뉴 8종(단일 그룹 "중국 결제 관리"):
1. `invoice_member` 중국 결제자 리스트
2. `invoice_goods` 중국 결제 상품리스트
3. `invoice_register` 중국 결제 주문서 작성 (559줄, 대형 폼)
4. `invoice_request` 중국 결제요청 리스트
5. `invoice_list` 중국 결제완료 리스트 ← **본 단위 (topbar 진입점)**
6. `sales_china_year` 중국 누적매출 현황
7. `sales_china_month` 중국 월별매출 현황
8. `order_china_month` 중국 월별주문 현황

서브(링크 대상/처리기, 후속·범위밖): `invoice_view`(상세)·`invoice_modify`(수정 567줄)·`invoice_print`(**0줄 빈 파일 dead**)·`invoice_*_ps`(POST 처리기)·`invoice_email_send`.
topbar `china` 메뉴는 #3에서 이식 완료(`menu.ts` key "china", href `/china/invoice_list`).

## 화면·플로우 (invoice_list)
- 진입 URL: `/china/invoice_list` — GET `page`, `search_year`, `search_settle_no`, `search_name`, `search_email`
- 화면 요소:
  - breadcrumb: 홈 / 중국결제 / 중국 결제 관리 / 중국 결제완료 리스트
  - h4 page-title "중국 결제완료 리스트"
  - 검색필터 카드(bg-secondary "검색필터"):
    - 결제번호 `search_settle_no` (text)
    - 주문자명 `search_name` (text)
    - 주문자이메일 `search_email` (text)
    - 연도 `search_year` (select, `:::년도:::` 빈옵션 + 2016~현재년, **기본 현재년 selected**)
    - 제출 버튼 "결제내역 검색"
  - 카운트 `{total_results} 개`
  - 목록 테이블 9컬럼:
    | 컬럼 | 값 | 비고 |
    |------|-----|------|
    | 번호 | `total_results - (index + (page-1)*20)` | 역순, **20/page** |
    | 주문일자 | `ord_ymd` | |
    | 결제번호 | `settle_no` | `invoice_view.php?settle_no=` 링크(미이관) |
    | 주문자명 | `name` | |
    | 주문자이메일 | `email` | |
    | 결제금액 | `number_format(settle_price)` | text-end |
    | 결제일자 | `cdt` | |
    | 결제상태 | **"결제완료" 하드코딩** | step='2' 고정 목록 |
    | 수정/삭제 | "수정" 버튼 | **inert(onclick 없음) — legacy quirk 이식** |
  - 서버 페이지네이션 `links_html` (Pagination 클래스, ServerPagination로 이식)
- 분기/리다이렉트: 없음(단순 목록). 검색은 GET 폼 재요청.
- 세션/권한: `lib.php` 관리자 세션 가드(공통, features/route-guard가 담당).

## 데이터 (legacy)
- 도메인: `China::getChinaInvoiceList($page, $add_where, $orderby, $param)`
- SQL:
  ```sql
  SELECT ord_ymd, settle_no, name, email, settle_price, cdt, step
  FROM directgames.tbl_invoice_order
  WHERE step='2' AND flag='Y' [add_where]
  ORDER BY ord_ymd DESC
  ```
  - `results_per_page = 20`
  - **전달 `$orderby`("settle_no desc")는 무시** — 쿼리에 `order by ord_ymd desc` 하드코딩 (legacy quirk)
  - `add_where` 구성:
    - 연도: `and ord_ymd between '{year}-01-01' and '{year}-12-31'` (search_year 없으면 `date('Y')` 기본)
    - `search_settle_no`: `and settle_no = '{v}'` (등호)
    - `search_name`: `and name like '%{v}%'`
    - `search_email`: `and email = '{v}'` (등호)
  - base: `step='2'`(결제완료) AND `flag='Y'`

## API 계약 (백엔드 전달)
- `GET /admin/china/invoices` — 중국 결제완료 목록
  - 요청(query): `page`(기본 1), `search_year`(기본 서버 현재년), `search_settle_no`, `search_name`, `search_email`
  - 응답:
    ```json
    {
      "items": [
        { "ord_ymd": "2026-03-10", "settle_no": "CN20260310-001",
          "name": "王伟", "email": "wangwei@example.cn", "settle_price": 129000, "cdt": "2026-03-10 12:30:00" }
      ],
      "pagination": { "current_page": 1, "results_per_page": 20, "total_results": 1, "total_pages": 1 }
    }
    ```
  - 백엔드 책임:
    - base 필터 `step='2' AND flag='Y'` 강제
    - 정렬 `ord_ymd DESC` 고정(legacy가 전달 orderby 무시하는 동작 유지)
    - 연도 범위 `ord_ymd BETWEEN {year}-01-01 AND {year}-12-31`, search_year 미지정 시 현재년
    - settle_no/email 등호, name LIKE 부분일치
    - 20/page 서버 페이지네이션(total_results/total_pages)

## 타겟 매핑
- 사이드바: `widgets/sidebar` `CHINA_SIDE_NAV`(단일 그룹 8링크, expandAll=true) + `resolveSideNav` `/china` 분기
- 라우트: `/china/invoice_list` (`routes/china/invoice_list.tsx`)
- screens: `screens/china-invoice-list`
- entities: 신규 `entities/china` (invoice-list slice)
- mock: 신규 `handlers/china` (`GET /admin/china/invoices`)
- 미이관 링크(순차 이관 시 라우트 생성): `invoice_member`/`invoice_goods`/`invoice_register`/`invoice_request`/`sales_china_year`/`sales_china_month`/`order_china_month`/`invoice_view`

## Parity 체크리스트
- [ ] 화면 요소 일치 (검색필터 4종·9컬럼·카운트·breadcrumb·h4)
- [ ] 필드/검증 일치 (연도 기본 현재년·2016~현재·빈옵션)
- [ ] 분기/플로우 일치 (settle_no 링크·수정 버튼 inert·결제상태 하드코딩)
- [ ] 엣지케이스 일치 (번호 역순 20/page·정렬 ord_ymd desc·빈 목록)
