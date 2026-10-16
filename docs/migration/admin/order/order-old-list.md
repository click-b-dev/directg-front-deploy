# 과거주문 리스트 (order_old_list)

O1 영역 주문 관리 v2 마지막 화면. **DGKR 아카이브 DB**의 연도별 과거 주문(2013~2020). 필드/라벨이 현행 주문과 상이.

## 원본
- 파일: `pc/_Admin_/order/order_old_list.php` (라이브 — 변형/테스트 파일 없음)
- 도메인: `AdminOrder::getOrderOldList()` (**DGKR DB** `$dsn_dgkr`)
- 참조: `docs/legacy-admin/40-order.md`, `../legacy-project/docs/ORDER-WORKFLOW-AUDIT.md`

## 화면·플로우
- 진입 URL: `/order/order_old_list.php` → 타겟 `/order/order_old_list`
- 파라미터(GET): `page`, `search_key`, `search_value`, `search_start_date`, `search_end_date`, `date_label`, `search_year`
- breadcrumb: 홈 / 주문 / 주문 관리 / 과거주문 리스트. h4 "과거주문 리스트"

### 검색필터 (card)
- 검색어: `search_key`(select, order_all과 동일 순서: 주문번호 first) + `search_value`
- **연도선택(`search_year`) select**: `::연도선택::`(빈값)·2013~2020년. 기본 2020.
- 기간검색: daterangepicker — **날짜 필터 완전 비활성**. 코드가 `search_start_date=""`, `search_end_date=""`, `date_label="전체기간"`을 **무조건 설정**(연도로만 조회). daterangepicker ranges도 `'전체기간'` 하나뿐(나머지 주석). 라벨 항상 "전체기간".

### 검색·기본값 로직 (order_old_list.php 24~94)
1. `page` 없으면 1.
2. **날짜 무조건 비움 + date_label="전체기간"** (line 39~41). `search_year` 빈값이면 2020.
3. `search_value` 있으면 `search_key`에 따라 등호: settle_no→`a.settle_no`(**닫는 따옴표 누락 legacy 버그**: `"a.settle_no = '{$search_value"` — 끝 `'` 없음), ordno→`b.ordno`, product_code→`b.product_code`, m_id→**`a.email`**(email 컬럼).
4. 정렬 `a.ord_ymd DESC`.

### 목록 (table, 13컬럼)
1. **번호** = `total_results-(idx+(page-1)*20)` 역순
2. 주문일자 (ord_ymd)
3. 결제번호 (settle_no) → `order_old_view.php?settle_no=&search_year=` 링크(미이관)
4. 주문번호 (ordno)
5. 회원아이디 (**email**, text-start)
6. 상품정보 (product_nm + supp_cd 4/5면 `<small class="label label-info">번들</small>`) — text-start. **M뱃지 없음**
7. 주문금액 (tot_pay, number_format, text-end)
8. 결제일자 (step != '1'이면 cdt, else 빈칸)
9. 결제방법 = `settlekind2[settlekind]`
10. PG (pg_provider raw)
11. 결제상태 = `settleStatus2[step]`
12. 주문상태 = `orderStatus[status]`
13. 키확인 (is_lic_actv=="1" ? O : X)

- 상단 "N 개", 20/page, ServerPagination
- **CSV 다운로드 버튼**: `order_old_excel.php`로 검색조건+page POST. total_results>0일 때만(아니면 alert "검색결과가 있는 경우만 가능합니다."). 백엔드 파일.
- **row bg-danger 죽은 코드**: `if($value['order_system'] = "")` — `=` 대입버그(order_all 동일) → 항상 미적용.

### 화면 로컬 라벨 배열 (클래스 메서드 아님)
- `settlekind2`(결제방법): 000000현금·SC0000무통장입금·SC0010신용카드·SC0030실시간 계좌이체·SC0040가상계좌·SC0060휴대폰·DG0000전액할인·PAYCO·samsung삼성페이·naverpay네이버페이·POINT네이버포인트
- `settleStatus2`(결제상태): 0결제완료·1결제대기·2결제완료·3결제실패·9결제취소·99주문취소
- `orderStatus`(주문상태): 0주문완료·1주문대기·2주문완료·8취소요청·9취소완료
- 미매칭 시 undefined→빈셀

## 데이터 (legacy)
- `AdminOrder::getOrderOldList($page, $add_where, $orderby, $param, $year)` — **DGKR DB**
- SQL: `SELECT a.settle_no,a.ord_ymd,a.step,a.email,a.regdt,a.cdt,a.settlekind,b.ordno,b.status,b.product_code,b.product_nm,b.is_lic_actv,b.tot_pay,b.supp_cd,a.pg_provider,... FROM tbl_order_{year} a INNER JOIN tbl_order_item_{year} b ON a.id=b.order_id LEFT JOIN tbl_kcp_log c ON a.settle_no=c.merchant_uid WHERE a.m_no>'0' <add_where> ORDER BY a.ord_ymd DESC`
  - **연도별 아카이브 테이블** `tbl_order_{year}`/`tbl_order_item_{year}`, `results_per_page=20`

## API 계약 (백엔드 전달)

### `GET /admin/order/old`
목록 조회. 빈값 미전송. 날짜는 항상 전체기간(미전송) — 연도로만 조회.

**요청 쿼리**
| 파라미터 | 규칙 |
|----------|------|
| `page` | 기본 1 |
| `search_year` | 연도(2013~2020, 기본 2020) — 아카이브 테이블 선택 |
| `search_key`+`search_value` | value 있을 때 동반(settle_no/ordno/product_code 등호, m_id→**email** 등호) |

- **백엔드 책임**: DGKR DB, `tbl_order_{year} a ⋈ tbl_order_item_{year} b (a.id=b.order_id)`, `a.m_no>'0'`, `ORDER BY a.ord_ymd DESC`, `results_per_page=20`. legacy settle_no 검색 닫는따옴표 누락 버그는 **백엔드에서 정상 등호로 처리**(프론트는 정상 계약, 버그 미전파).

**응답 200**
```json
{
  "items": [
    {
      "settle_no": "20200115ABC",
      "ord_ymd": "2020-01-15",
      "ordno": "ORD2020001",
      "email": "hong@example.com",
      "product_nm": "GTA V",
      "supp_cd": "1",
      "tot_pay": 29900,
      "step": "2",
      "cdt": "2020-01-15 12:33:00",
      "settlekind": "SC0010",
      "pg_provider": "kcp",
      "status": "2",
      "is_lic_actv": "1"
    }
  ],
  "pagination": { "current_page": 1, "total_results": 120, "total_pages": 6 }
}
```

### `POST /admin/order/old/excel` (CSV 다운로드)
- 검색조건(search_key/value/year) + page POST → CSV 스트리밍(백엔드). total_results>0일 때만 프론트에서 요청(0이면 alert). MSW mock 불가(바이너리).

## 타겟 매핑
- 라우트: `src/routes/order/order_old_list.tsx` → `/order/order_old_list` (validateSearch)
- 스크린: `screens/order-old-list` (`OrderOldListScreen`)
- entities: `entities/order` 확장 — `OrderOldListItem`/`OrderOldListResponse`/`OrderOldListSearch`, `OLD_SETTLEKIND_LABEL`/`OLD_SETTLE_STATUS_LABEL`/`OLD_ORDER_STATUS_LABEL`, `ORDER_OLD_YEAR_OPTIONS`, `resolveOrderOldListSearch`(연도 기본 2020·무조건 전체기간), `fetchOrderOldList`/`useOrderOldList`. `ORDER_ALL_SEARCH_KEY_OPTIONS` 재사용.
- 공용 UI: `shared/ui/DateRangePicker`(**`allPeriodOnly` prop 추가** — 전체기간 프리셋만·emptyLabel="전체기간")·`ServerPagination` 재사용
- mock: `shared/mocks/handlers/order.ts` 확장(`/admin/order/old`). CSV는 백엔드 파일(mock 없음).

## Parity 체크리스트
- [ ] 화면 요소 일치 — breadcrumb·h4·검색필터(연도 select·기간 전체기간 고정)·13컬럼·CSV 버튼
- [ ] 필드/검증 일치 — email/product_nm/tot_pay/cdt/settlekind/is_lic_actv·번들 라벨(supp_cd 4/5)·로컬 라벨 배열
- [ ] 분기/플로우 일치 — 연도 기반 조회·ord_ymd desc·20/page·번호 ×20·결제일자(step≠1)·CSV total_results>0 alert
- [ ] 엣지케이스 일치 — 빈 목록·bg-danger 죽은코드 미적용·미매칭 라벨 빈셀·settle_no/old_view 링크 미이관
