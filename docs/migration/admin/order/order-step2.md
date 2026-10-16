# 결제완료 리스트 (order_step2)

O1 영역 결제 관리 v2 2번째 화면. order_step1(#193) 자매 — 검색필터·기간위젯 동일, 대상/정렬/컬럼 상이.

## 원본
- 파일: `pc/_Admin_/order/order_step2.php` (라이브 — 변형/테스트 파일 없음)
- 도메인: `src/classes/AdminOrder.php` → `getOrderPaymentApproved()`, `getPGProvider()`, `getCheckoutStatus()`, `getSettlekindLabel()`
- 참조: `docs/legacy-admin/40-order.md`, `../legacy-project/docs/ORDER-WORKFLOW-AUDIT.md`, [order-step1.md](order-step1.md)

## 화면·플로우
- 진입 URL: `/order/order_step2.php` → 타겟 `/order/order_step2`
- 파라미터/검색·기본날짜 로직: **order_step1과 완전 동일** (page/settle_no/m_id/pg_provider/payment_method/start/end/date_label, -2day·today 기본값 quirk, settle_no·m_id 우선 기간무시+전체기간 라벨, pg/method all 기본). → `resolveOrderPaymentReadySearch` 재사용.
- breadcrumb: 홈 / 주문 / 결제 관리 / 결제완료 리스트. h4 "결제완료 리스트"

### order_step1과 차이
1. h4/breadcrumb 라벨 "결제완료 리스트"
2. **결제수단 radio에 `toss_pay`(토스페이) 추가** → step2는 11개(step1은 10개). → `PAYMENT_METHOD_STEP2_OPTIONS` 별도 상수.
3. 정렬 **`payment_date desc`** (step1은 reg_date desc)
4. 도메인 메서드 **`getOrderPaymentApproved`** — `tbl_order where step='2'`(결제완료), `results_per_page=20`(넘긴 '30' 무시 동일 quirk), SELECT에 `use_emoney`/`use_cash` 추가
5. **컬럼 구성 상이**(10컬럼, 아래)

### 목록 (table, 10컬럼)
1. **번호** = `total_results - (idx + (page-1)*20)` (역순, 20 하드코딩)
2. 주문일자 (reg_date)
3. 결제번호 (settle_no) → `order_view.php?settle_no=` 링크(미이관). **is_mobile=="Y"이면 앞에 `<span class="badge bg-secondary">M</span>`**
4. 회원아이디 (m_id, `text-start`)
5. 주문IP (ip)
6. **결제 PG(결제수단)** = `getPGProvider(pg_provider, payment_method)` + `<br/>(` + `getSettlekindLabel(payment_method)` + `)` (2줄)
7. **포인트할인** = `number_format(use_emoney + use_cash)` (text-end)
8. 결제금액 (total_price, number_format, text-end)
9. 결제상태 = `getCheckoutStatus(step)`
10. 결제완료일자 (payment_date)

- 상단 "N 개"(number_format(total_results)), 20/page, ServerPagination

### 라벨 맵
- `getPGProvider(pg, method)` (미매칭 빈셀): `kcp`→KCP · `naverpay`→네이버페이 · `payco`→페이코 · `toss`→토스 · `toss_pay`→토스페이 · `DGKR`→전액할인 · **`uplus`→ payment_method=="DG0000"일 때만 "DGKR"(아니면 빈셀) quirk**
- `getCheckoutStatus(step)` (미매칭 빈셀): `1`→입금대기 · `2`→결제완료 · `8`→환불요청 · `9`→환불완료 · `99`→취소완료
- `getSettlekindLabel`: order-step1.md와 동일(SETTLE_KIND_LABEL 재사용)

## 데이터 (legacy)
- `AdminOrder::getOrderPaymentApproved($page,$add_where,$orderby,$param)`
- SQL: `select settle_no,reg_date,is_mobile,m_id,pg_provider,payment_method,use_emoney,use_cash,total_price,step,payment_date,ip from tbl_order where step='2' <add_where> order by payment_date desc`
- 테이블 `tbl_order`, 고정 `step='2'`, `results_per_page=20`

## API 계약 (백엔드 전달)

### `GET /admin/order/payment-approved`
목록 조회. 요청 쿼리는 order-step1의 `payment-ready`와 동일 규칙(빈값/all 미전송, settle_no·m_id 우선 정규화는 프론트 완료).
- **백엔드 책임**: `step='2'` 고정, `ORDER BY payment_date DESC`, `results_per_page=20`.

**응답 200**
```json
{
  "items": [
    {
      "reg_date": "2026-07-27 14:03:11",
      "settle_no": "20260727ABC123",
      "is_mobile": "Y",
      "m_id": "hong@example.com",
      "ip": "1.2.3.4",
      "pg_provider": "kcp",
      "payment_method": "SC0010",
      "use_emoney": 1000,
      "use_cash": 0,
      "total_price": 49900,
      "step": "2",
      "payment_date": "2026-07-27 14:05:22"
    }
  ],
  "pagination": { "current_page": 1, "total_results": 137, "total_pages": 7 }
}
```
- 에러: 서버 오류 시 500(legacy die).

## 타겟 매핑
- 라우트: `src/routes/order/order_step2.tsx` → `/order/order_step2` (validateSearch, order_step1과 동일 스키마)
- 스크린: `screens/order-step2` (`OrderStep2Screen`)
- entities: `entities/order` 확장 — `OrderPaymentApprovedItem`/`OrderPaymentApprovedResponse`, `getPGProviderLabel`, `CHECKOUT_STATUS_LABEL`/`getCheckoutStatusLabel`, `PAYMENT_METHOD_STEP2_OPTIONS`, `fetchOrderPaymentApproved`/`useOrderPaymentApproved`. `resolveOrderPaymentReadySearch`/`PG_PROVIDER_OPTIONS`/`SETTLE_KIND_LABEL` 재사용.
- 공용 UI: `shared/ui/DateRangePicker` 재사용(#193)
- mock: `shared/mocks/handlers/order.ts` 확장(`/admin/order/payment-approved`)

## Parity 체크리스트
- [ ] 화면 요소 일치 — breadcrumb·h4·검색필터(결제수단 toss_pay 추가)·10컬럼(번호 역순·M뱃지·PG 2줄·포인트할인)
- [ ] 필드/검증 일치 — 날짜 기본값·settle_no/m_id 기간무시·93일/역순(공용 위젯)·getPGProvider uplus quirk·getCheckoutStatus
- [ ] 분기/플로우 일치 — payment_date desc·20/page·번호 ×20·settle_no 링크 미이관
- [ ] 엣지케이스 일치 — 빈 목록·미매칭 라벨 빈셀·M뱃지 조건부
