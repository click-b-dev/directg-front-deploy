# 입금대기 리스트 (order_step1)

O1 영역 결제 관리 v2 첫 화면. 표준 목록(검색필터 + ServerPagination) + **order 영역 공통 기간검색 위젯(DateRangePicker) 신규**.

## 원본
- 파일: `pc/_Admin_/order/order_step1.php` (라이브 — 변형/테스트 파일 없음)
- 도메인: `src/classes/AdminOrder.php` → `getOrderPaymentReady()`, `getSettlekindLabel()`
- 참조 문서: `docs/legacy-admin/40-order.md`, `../legacy-project/docs/ORDER-WORKFLOW-AUDIT.md`

## 화면·플로우
- 진입 URL: `/order/order_step1.php` → 타겟 `/order/order_step1`
- 파라미터(GET): `page`, `search_settle_no`, `search_m_id`, `search_pg_provider`, `search_payment_method`, `search_start_date`, `search_end_date`, `date_label`
- breadcrumb: 홈 / 주문 / 결제 관리 / 입금 대기 리스트. h4 "입금 대기 리스트"

### 검색필터 (card "검색필터")
- 결제번호(`search_settle_no`, text) / 회원아이디(`search_m_id`, text, placeholder "회원아이디(이메일)")
- 결제 PG(`search_pg_provider`, radio): 전체(all)·KCP(kcp)·네이버페이(naverpay)·페이코(payco)·토스(toss)·**DGKR(uplus)** — 라벨/값 불일치 주의(값 uplus=라벨 DGKR)
- 결제수단(`search_payment_method`, radio): 전체(all)·신용카드(SC0010)·계좌이체(SC0030)·가상계좌(SC0040)·휴대폰(SC0060)·포인트(POINT)·페이코(PAYCO)·퀵계좌이체(toss_bank)·삼성페이(samsung)·전액할인(DG0000)
- 기간검색: daterangepicker(`#reportrange` 박스 + `search_start_date`/`search_end_date` + hidden `date_label`)
- 제출 버튼 "결제내역 검색" (float-end)

### 검색·기본값 로직 (order_step1.php 22~102 이식)
1. `page` 없으면 1.
2. **날짜 기본값 quirk**: `search_start_date` 빈값이면 → **오늘-2일**(`strtotime('-2 day')`). 코드 주석은 "이번달 1일"이라 하지만 실제 코드는 -2day → **코드 우선 이식**. `search_end_date` 빈값이면 → **오늘**.
3. `search_settle_no` 있으면 `settle_no = '<값>'` 등호. `search_m_id` 있으면 `m_id = '<값>'` 등호.
4. **settle_no 또는 m_id 있으면 기간검색 무시**: `search_start_date`/`search_end_date` 빈값 처리 + `date_label = "전체기간"`.
5. 아니면: `date_label === "전체기간"`이면 `""`로 초기화. `search_start_date` 있으면 `ord_ymd >= '<start>'`, `search_end_date` 있으면 `ord_ymd <= '<end>'`.
6. `search_pg_provider`: 빈값/미지정이면 `all`. `all` 아니면 `pg_provider = '<값>'`.
7. `search_payment_method`: 빈값/미지정이면 `all`. `all` 아니면 `payment_method = '<값>'`.
8. 정렬 `reg_date desc` 고정. (주석: `product_code desc` dead)
9. step 필터는 주석처리(`//$where[] = " step='1' "`) — **step='1' 조건은 메서드 SQL에 하드코딩**되어 있음(WHERE 이중 아님).

### 목록 (table)
- 상단 "N 개"(`number_format(total_results)`)
- 10컬럼: 주문일자(reg_date) / 결제번호(settle_no, **`order_view.php?settle_no=` 링크 — 미이관**) / 주문자(m_id, `text-start`) / 주문IP(ip) / PG(pg_provider raw) / 결제수단(payment_method → `getSettlekindLabel`) / 결제금액(total_price, `number_format`, text-end) / 결제상태(step raw) / 결제버전(version raw) / 결제플랫폼(is_mobile Y=모바일/N=PC)
- **페이지당 20개** — 화면이 `getOrderPaymentReady($page,$add_where,$orderby,$param,'30')`로 '30'을 넘기지만 **메서드 시그니처는 4개 인자만 받아 5번째 '30'을 무시** → 실제 `results_per_page=20`. **legacy quirk 이식**(genba #159·promotion_weekend #174 선례).
- 페이지네이션: `links_html`(Pagination.php) → `shared/ui/ServerPagination`

### getSettlekindLabel 라벨 맵 (미매칭 시 빈 문자열)
`SC0010`→신용카드 · `SC0030`→계좌이체 · `SC0040`→가상계좌 · `SC0060`→휴대폰 · `POINT`→포인트 · `PAYCO`→페이코 · `DG0000`→전액할인 · `samsung`→삼성페이 · `toss_bank`→퀵계좌이체 · `toss_pay`→토스머니. (default 없음 → 그 외 값은 빈 셀)

## 데이터 (legacy)
- 도메인: `AdminOrder::getOrderPaymentReady($page, $add_where, $orderby, $param)`
- SQL: `select settle_no, reg_date, is_mobile, m_id, pg_provider, payment_method, use_emoney, use_cash, total_price, step, payment_date, version, ip from tbl_order where step='1' <add_where> order by reg_date desc`
  - 테이블 `tbl_order`, 고정 `step='1'`(입금대기/미결제), `results_per_page=20`
- 에러: PDOException → `Error!: <msg>` die

## API 계약 (백엔드 전달)

### `GET /admin/order/payment-ready`
목록 조회. 프론트는 빈값/중립값(all)은 미전송. 백엔드가 WHERE 빌드.

**요청 쿼리**
| 파라미터 | 설명 | 규칙 |
|----------|------|------|
| `page` | 페이지(1-based) | 기본 1 |
| `search_settle_no` | 결제번호 | 있으면 `settle_no =` 등호 |
| `search_m_id` | 회원아이디 | 있으면 `m_id =` 등호 |
| `search_pg_provider` | 결제 PG | `all` 아니면 `pg_provider =` 등호 |
| `search_payment_method` | 결제수단 | `all` 아니면 `payment_method =` 등호 |
| `search_start_date` | 시작일 YYYY-MM-DD | 있으면 `ord_ymd >=` |
| `search_end_date` | 종료일 YYYY-MM-DD | 있으면 `ord_ymd <=` |

- **백엔드 책임**: `step='1'` 고정 조건, `ORDER BY reg_date DESC`, `results_per_page=20`. settle_no/m_id가 있을 때 기간 무시는 프론트가 이미 정규화해 start/end를 미전송(계약 단순화).

**응답 200**
```json
{
  "items": [
    {
      "reg_date": "2026-07-27 14:03:11",
      "settle_no": "20260727ABC123",
      "m_id": "hong@example.com",
      "ip": "1.2.3.4",
      "pg_provider": "kcp",
      "payment_method": "SC0040",
      "total_price": 49900,
      "step": "1",
      "version": "v2",
      "is_mobile": "N"
    }
  ],
  "pagination": { "current_page": 1, "total_results": 137, "total_pages": 7 }
}
```
- 에러 코드: 서버 오류 시 500(legacy `Error!:` die). 프론트는 표준 에러 처리.

## 타겟 매핑
- 라우트: `src/routes/order/order_step1.tsx` → `/order/order_step1` (validateSearch)
- 스크린: `screens/order-step1` (`OrderStep1Screen`)
- entities: `entities/order` 신규 — `OrderPaymentReadyItem`/`OrderPaymentReadySearch`/`OrderPaymentReadyResponse`, `SETTLE_KIND_LABEL`, `PG_PROVIDER_OPTIONS`, `PAYMENT_METHOD_OPTIONS`, `fetchOrderPaymentReady`/`useOrderPaymentReady`
- 공용 UI: `shared/ui/DateRangePicker` 신규 — order 영역 공통 기간검색 위젯
- mock: `shared/mocks/handlers/order.ts` 신규 + handlers.ts 등록

### DateRangePicker (공용 컴포넌트, legacy bootstrap-daterangepicker 재현)
개발자 승인: React 공용 컴포넌트로 충실 재현(A안). 앱에 jQuery/moment/daterangepicker 부재 → 원본 라이브러리 도입 불가.
- 표시: `#reportrange` 박스(mdi-calendar 아이콘 + 라벨 span + mdi-menu-down) + `search_start_date`/`search_end_date` input(input-group `~`) + hidden `date_label`.
- 프리셋 팝업: 선택 / 오늘 / 어제 / 지난 7일 / 지난 30일 / 이번달 / 지난달 / 직접선택. 클릭 즉시 적용(autoApply) 후 팝업 닫힘.
  - 각 프리셋 날짜 계산은 native `Date`로 moment ranges 재현. "선택"=초기 start/end.
  - 프리셋 클릭 시: start/end input 값 갱신 + `date_label` = 프리셋명 + 라벨 span 갱신 + date input readonly(text).
  - "직접선택": `date_label="직접선택"`, date input을 편집 가능(type=date, readonly 해제)으로 전환(값 유지) + native picker 유도.
- 초기 표시: `date_label` 있으면 span에 라벨 텍스트, "직접선택"이면 date input 편집모드. 없으면 span "선택".
- 검증(input change): 종료<시작 → `"종료일이 시작일보다 빠를 수 없습니다."` alert + 종료 초기화. 차이>93일 → `"조회 기간은 최대 93일을 초과할 수 없습니다.\n현재 선택 기간: N일"` alert + 해당 input 초기화.
- 시작일 변경 시 종료일 picker 열기(endDateOpen).
- **레이아웃**: reportrange 박스 컬럼 + 시작~종료 input-group 컬럼을 형제로 렌더(라벨과 함께 한 row를 채움). 컬럼 폭은 `rangeColClassName`/`inputColClassName` prop으로 화면별 legacy 그리드에 맞춘다(step1/2/vbank=col-sm-2/col-sm-4 기본, order_all=col-sm-4/col-sm-6).
- **스코프**: legacy daterangepicker의 2개월 달력 그리드는 이 화면 흐름에서 "직접선택"이 native date input(showPicker)으로 대체되므로 미재현(프리셋 목록 팝업 + native date fallback으로 워크플로우 동일). 프리셋·라벨 유지·검증·직접선택 전환은 완전 재현.

## Parity 체크리스트
- [ ] 화면 요소 일치 — breadcrumb·h4·검색필터(PG/결제수단 라벨·값)·10컬럼·"N 개"
- [ ] 필드/검증 일치 — 날짜 기본값(-2day/today) quirk·settle_no/m_id 시 기간무시+전체기간 라벨·pg/method all 기본·93일/역순 alert
- [ ] 분기/플로우 일치 — reg_date desc·20/page(5번째 인자 무시 quirk)·settle_no 링크 미이관·getSettlekindLabel 미매칭 빈셀
- [ ] 엣지케이스 일치 — 빈 목록·직접선택 native date 전환·date_label 폼 유지
