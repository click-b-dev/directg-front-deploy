# 가상계좌 리스트 (order_vbank)

O1 영역 결제 관리 v2 3번째(마지막) 화면. #193/#194 자매지만 필터 간소·조인·마감시각 컬럼 상이.

## 원본
- 파일: `pc/_Admin_/order/order_vbank.php` (라이브 — 변형/테스트 파일 없음)
- 도메인: `src/classes/AdminOrder.php` → `getOrderVbankReady()`, `getCheckoutStatus()`
- 참조: `docs/legacy-admin/40-order.md`, `../legacy-project/docs/PAYMENT-APPROVAL.md`, [order-step1.md](order-step1.md)

## 화면·플로우
- 진입 URL: `/order/order_vbank.php` → 타겟 `/order/order_vbank`
- 파라미터(GET): `page`, `search_settle_no`, `search_m_id`, `search_start_date`, `search_end_date`, `date_label` — **PG/결제수단 없음**(step1/2와 차이)
- breadcrumb: 홈 / 주문 / 결제 관리 / 가상계좌 리스트. h4 "가상계좌 리스트"

### 검색필터 (card)
- 결제번호(text) / 회원아이디(text) / 기간검색(daterangepicker) — **결제 PG·결제수단 radio 없음**

### 검색·기본값 로직 (order_vbank.php 20~79)
1. `page` 없으면 1.
2. **날짜 기본값 quirk 차이**: `search_start_date` 빈값이면 → **`strtotime('-1 MONTH')`(한 달 전)** — step1/2는 -2day. 주석은 "이번달 1일". `search_end_date` 빈값 → 오늘.
3. `search_settle_no` → `a.settle_no =` 등호. `search_m_id` → `a.m_id =` 등호 (테이블 alias `a.`)
4. settle_no/m_id 있으면 기간무시 + `date_label="전체기간"` (동일). 아니면 `a.ord_ymd >= / <=`.
5. 정렬 `reg_date desc`. step 필터 주석(dead) — step='1'은 메서드 SQL 하드코딩.

### 목록 (table, 8컬럼)
1. 주문일자 (reg_date)
2. 결제번호 (settle_no) → `order_view.php?settle_no=` 링크(미이관). **M뱃지 없음**
3. 주문자 (m_id, `text-start`)
4. 주문IP (ip)
5. 결제금액 (total_price, number_format, text-end)
6. 결제상태 = **`step=="8" ? "취소요청" : getCheckoutStatus(step)`** — step=8 오버라이드(getCheckoutStatus는 8→환불요청이나 여기선 "취소요청")
7. **마감시각** (va_date) — 셀 class `text-center` + 조건부 `text-danger`:
   - `pg_provider=="payco"`: paymentDetails JSON `nonBankbookSettleInfo.paymentExpirationYmd` → `Y-m-d`. **오늘 날짜보다 이전이면 text-danger**
   - 그 외(kcp 등): `va_date` → `Y-m-d H:i:s`. **현재 시각보다 이전이면 text-danger**
8. 결제플랫폼 (is_mobile Y=모바일 / N=PC)

- 상단 "N 개"(number_format(total_results)), **번호 컬럼 없음**, 20/page, ServerPagination
- `$delivery_system` 배열 정의되나 화면 미사용(dead)

## 데이터 (legacy)
- `AdminOrder::getOrderVbankReady($page,$add_where,$orderby,$param)`
- SQL:
```sql
SELECT a.settle_no as settle_no, reg_date, is_mobile, m_id, pg_provider, payment_method,
       use_emoney, use_cash, total_price, step, payment_date, ip,
       b.* (kcp_log: va_date 등), c.* (payco_log: paymentDetails 등)
FROM tbl_order a
LEFT JOIN kcp_log b   ON a.settle_no=b.settle_no AND a.payment_method='SC0040'
LEFT JOIN payco_log c ON a.settle_no=c.sellerOrderReferenceKey AND c.paymentCompletionYn='N'
WHERE a.step='1' <add_where> AND (b.settle_no IS NOT NULL OR c.sellerOrderReferenceKey IS NOT NULL)
ORDER BY reg_date desc
```
- 테이블 `tbl_order`(+kcp_log/payco_log), 고정 `step='1'` + 가상계좌 발급건만, `results_per_page=20`

## API 계약 (백엔드 전달)

### `GET /admin/order/vbank`
목록 조회. 요청: `page`, `search_settle_no`, `search_m_id`, `search_start_date`, `search_end_date`(빈값 미전송, settle_no·m_id 우선 정규화는 프론트 완료).
- **백엔드 책임**: `step='1'` 고정, kcp_log(SC0040)/payco_log(미완료) LEFT JOIN 후 가상계좌 발급건만(`b.settle_no IS NOT NULL OR c.sellerOrderReferenceKey IS NOT NULL`), `ORDER BY reg_date DESC`, `results_per_page=20`.
- **`va_date`(마감시각) 포맷은 백엔드가 계산**: payco면 paymentDetails JSON `nonBankbookSettleInfo.paymentExpirationYmd`를 `Y-m-d`로, 그 외면 kcp_log `va_date`를 `Y-m-d H:i:s`로. `pg_provider`를 함께 내려 프론트가 만료(text-danger) 판정.

**응답 200**
```json
{
  "items": [
    {
      "reg_date": "2026-07-27 14:03:11",
      "settle_no": "20260727VB0001",
      "m_id": "hong@example.com",
      "ip": "1.2.3.4",
      "total_price": 49900,
      "step": "1",
      "is_mobile": "N",
      "pg_provider": "kcp",
      "va_date": "2026-07-30 23:59:59"
    }
  ],
  "pagination": { "current_page": 1, "total_results": 42, "total_pages": 3 }
}
```
- 에러: 서버 오류 시 500(legacy die).

## 타겟 매핑
- 라우트: `src/routes/order/order_vbank.tsx` → `/order/order_vbank` (validateSearch — pg/method 없는 축소 스키마)
- 스크린: `screens/order-vbank` (`OrderVbankScreen`)
- entities: `entities/order` 확장 — `OrderVbankItem`/`OrderVbankResponse`/`OrderVbankSearch`, `resolveOrderVbankSearch`(기본 시작 -1개월), `fetchOrderVbank`/`useOrderVbank`. `getCheckoutStatusLabel` 재사용.
- 공용 UI: `shared/ui/DateRangePicker`·`ServerPagination` 재사용
- mock: `shared/mocks/handlers/order.ts` 확장(`/admin/order/vbank`)

### 마감시각 만료 판정(프론트)
- `pg_provider==="payco"`: `va_date`(Y-m-d) < 오늘(Y-m-d) → text-danger
- 그 외: `va_date`(Y-m-d H:i:s) < 현재(Y-m-d H:i:s) → text-danger
- (zero-padded 문자열 사전순 비교 = 시간 비교와 동치)

## Parity 체크리스트
- [ ] 화면 요소 일치 — breadcrumb·h4·검색필터(PG/결제수단 없음)·8컬럼(번호·M뱃지 없음)
- [ ] 필드/검증 일치 — 기본 시작 -1개월 quirk·settle_no/m_id 기간무시·93일/역순(공용)·step=8→취소요청
- [ ] 분기/플로우 일치 — reg_date desc·20/page·마감시각 payco/kcp 포맷·만료 text-danger
- [ ] 엣지케이스 일치 — 빈 목록·settle_no 링크 미이관·번호 없음
