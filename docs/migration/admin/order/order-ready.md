# 주문대기 리스트 (order_ready)

O1 영역 주문 관리 v2 2번째 화면. 결제완료 후 키발급 실패한 주문(재처리 대기). order_all 축소판(검색필터·카운트 없음).

## 원본
- 파일: `pc/_Admin_/order/order_ready.php` (라이브 — 변형/테스트 파일 없음)
- 도메인: `AdminOrder::getOrderReadyList()`, `getOrderStatus()`, `getDeliveryType()`
- 참조: `docs/legacy-admin/40-order.md`, `../legacy-project/docs/ORDER-WORKFLOW-AUDIT.md`, [order-all.md](order-all.md)

## 화면·플로우
- 진입 URL: `/order/order_ready.php` → 타겟 `/order/order_ready`
- 파라미터(GET): `page`만 (**검색필터 없음**)
- breadcrumb: 홈 / 주문 / 주문 관리 / 주문 대기 리스트
- h4: **"주문 대기 리스트 (결제완료 후 주문 실패시)"** — 괄호 부제 포함(page_title "주문 대기 리스트"와 상이, h4 원문 유지)

### 목록 (table, 9컬럼) — **상단 "N 개" 카운트 없음**
1. **번호** = `total_results-(idx+(page-1)*20)` 역순
2. 주문일자 (order_date)
3. 결제번호 (settle_no) → `order_view.php?settle_no=` 링크(미이관)
4. 주문번호 (ordno)
5. 회원아이디 (m_id) — text-start (**IP 없음** — order_all과 차이)
6. 상품정보 (product_code + `<br/>` + is_mobile=Y면 M뱃지 + product_name) — text-start
7. 주문금액 (price, number_format, text-end)
8. 주문상태 = `getOrderStatus(status)`
9. 배송유형 = `getDeliveryType(delivery_type)`

- 20/page, ServerPagination
- order_all 대비 제거: 결제상태 컬럼·회원 IP·수령여부 컬럼·검색필터·카운트

## 데이터 (legacy)
- `AdminOrder::getOrderReadyList($page,$add_where,$orderby,$param)`
- SQL: `select * from tbl_order a inner join tbl_order_item b on a.settle_no=b.settle_no where a.step='2' and b.send_status='fail' and b.status='1' order by order_date desc`
  - **step='2'(결제완료) + send_status='fail'(키발급 실패) + status='1'(미취소)** 고정
  - `results_per_page=20`(넘긴 '30' 무시, 번호 ×20과 일치)
  - add_where 없음(검색필터 없음)

## API 계약 (백엔드 전달)

### `GET /admin/order/ready`
목록 조회. 요청: `page`만.
- **백엔드 책임**: `tbl_order a ⋈ tbl_order_item b (settle_no)`, `a.step='2' AND b.send_status='fail' AND b.status='1'`, `ORDER BY order_date DESC`, `results_per_page=20`.

**응답 200**
```json
{
  "items": [
    {
      "order_date": "2026-07-28 10:03:11",
      "settle_no": "20260728ABC",
      "ordno": "ORD20260728001",
      "m_id": "hong@example.com",
      "product_code": "GOPT12345",
      "product_name": "사이버펑크 2077",
      "is_mobile": "N",
      "price": 49900,
      "status": "2",
      "delivery_type": "1"
    }
  ],
  "pagination": { "current_page": 1, "total_results": 12, "total_pages": 1 }
}
```
- 에러: 서버 오류 시 500(legacy die).

## 타겟 매핑
- 라우트: `src/routes/order/order_ready.tsx` → `/order/order_ready` (validateSearch — page만)
- 스크린: `screens/order-ready` (`OrderReadyScreen`)
- entities: `entities/order` 확장 — `OrderReadyItem`/`OrderReadyResponse`/`OrderReadySearch`, `fetchOrderReadyList`/`useOrderReadyList`. `getOrderStatusLabel`/`getDeliveryTypeLabel` 재사용.
- 공용 UI: `ServerPagination` 재사용 (DateRangePicker 불필요 — 검색필터 없음)
- mock: `shared/mocks/handlers/order.ts` 확장(`/admin/order/ready`)

## Parity 체크리스트
- [ ] 화면 요소 일치 — breadcrumb·h4 부제·9컬럼(검색필터·카운트 없음)
- [ ] 필드/검증 일치 — 회원아이디 IP 없음·상품정보 M뱃지·주문상태/배송유형 라벨
- [ ] 분기/플로우 일치 — order_date desc·20/page·번호 ×20·settle_no 링크 미이관
- [ ] 엣지케이스 일치 — 빈 목록·미매칭 라벨 빈셀
