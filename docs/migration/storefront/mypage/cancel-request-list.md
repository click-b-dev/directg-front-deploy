# 취소요청 내역 (mypage/cancel-request-list)

## 원본
- 파일: `pc/mypage/mypage_cancel_request.html` (라이브 — `aside_mypage.html:22` "취소요청 내역" 대상)
- 도메인 클래스: `Mypage2::getOrderList_v2`(목록+페이징), `Order::getOrderStatus`(주문상태 라벨), `Order::getOrderShipment`+`getShipmentStatus`(택배 배송상태), `Mypage2::setOrderLog`(철회 로그, 백엔드)
- 처리: `pc/mypage/mypage_proc.php` `mode=requestReturn`(요청철회)
- 참조: `docs/design-system/client.md`, `../legacy-project/docs/ORDER-WORKFLOW-AUDIT.md`, `PAYMENT-APPROVAL.md`
- 선례: `screens/mypage-order`(주문완료 내역, SSR 목록+뱃지+ServerPagination), `entities/mypage-order`, `entities/mypage-wishlist`(client mutation `apiClient.post`)

## 화면·플로우
- 진입 URL: `/mypage/mypage_cancel_request.html`, GET `?page=N&search_product_name=S&search_date=C`. **login_check(세션 필수)**.
- 레이아웃: `container my-3 pb-5` > `main.d-grid.gap-3`(240px auto) > `aside_mypage`(active `cancel_request`) + `section#content`. footer_banner 없음. (legacy `wrapper overflow-visible`는 타겟에 wrapper 요소 없음 → no-op)
- **검색 폼 없음(quirk)**: 입금대기 내역과 동일. PHP 필터 로직 + JS `#orderFrm.submit` 있으나 body에 폼 마크업 부재 → dead. searchParams는 API로 통과(기본 search_date="0" → 최근 6개월).
- 표 5열(colgroup 15/*/8/8/8):
  1. 주문일자(주문번호): `order_date` / `(ordno)`
  2. 상품정보: delivery_type 뱃지(코드발송/택배발송/코드+택배발송) + `product_name` (**이미지·game_type뱃지·플랫폼 아이콘 없음 — 텍스트만**)
  3. 주문금액: `number_format(price)` 원
  4. 진행상태: `d-flex flex-column` > 주문상태 뱃지 [+ 배송상태 뱃지(delivery_type≠1)]
     - 주문상태: `<span class="badge bg-{color} font-12">{getOrderStatus(status)}</span>` — color: status 8·9 → `danger`, 그 외 → `secondary`. (**`font-12`만, py-2 없음**)
     - 배송상태: delivery_type≠1이면 `<span class="badge text-bg-info">{getShipmentStatus(shipment_status)}</span>`
  5. 비고: `status==8`이면 "요청철회" 버튼(`btn btn-sm btn-primary`), `requestReturn(settle_no, ordno)` 호출
- 빈 목록: "취소요청 이력이 존재하지 않습니다." colspan=5 (legacy `total_results==0`)
- 하단: `#pagination`(links_html) — param에 검색조건(raw `$_GET`)
- 세션/권한: **로그인 필수**

### getOrderStatus 라벨 (Order::getOrderStatus)
- 1=주문대기, 2=주문완료, 3=배송준비, 4=배송중, 5=배송완료, 6=구매확정, 8=취소요청, 9=취소완료. **7·default = 빈 라벨**(legacy quirk — where는 status 7·8만 조회하나 status 7은 라벨 미정의 → 빈 문자열 + secondary 뱃지).

### 요청철회 인터랙션 (client, legacy JS)
- `requestReturn(settle_no, ordno)`: `confirm(\`주문번호 ${ordno} 주문의 취소 요청을 철회하시겠습니까?\`)` → `POST mypage_proc.php {mode:requestReturn, settle_no, ordno}` (dataType json)
  - success: `data.success` true → `alert(data.message)` + `location.reload()` / false → `alert(data.message)`
  - error: `alert(data.message)`(jqXHR엔 message 없음 → "undefined" legacy 버그; 재현 시 best-effort alert)

## SSR·SEO (legacy)
- head: `<title>취소요청 내역</title>`, `description=""`, `author=H2interactive`. canonical/OG 없음.
- viewport: `width=device-width, initial-scale=1.0`. `data-bs-theme="dark"`.
- page/*.css 없음. moment/daterangepicker 미로드(이 페이지엔 없음). 목록 SSR, 요청철회 버튼만 client.

## 데이터 (legacy)
- `getOrderList_v2($page,$where,$orderby,$param)`: `SELECT a.ord_ymd,a.step,b.* FROM tbl_order a INNER JOIN tbl_order_item b ON a.settle_no=b.settle_no WHERE {where} ORDER BY b.order_item_id DESC` — 20건/page.
  - where: `(b.status='7' OR b.status='8') AND b.m_no='{세션}'` + `a.ord_ymd >= {start}` + `a.ord_ymd <= {end}`
  - **주의**: order-list와 달리 `search_product_name` LIKE 필터 없음(where에 미포함 — legacy가 검색폼 없어 미적용). search_date 기간만 적용.
  - 표시 필드: order_date, ordno, settle_no, product_name, price, delivery_type, status
- per-row enrich: delivery_type≠1이면 `getOrderShipment(settle_no,ordno)` → shipment_status
- search_date 기간 계산: order-list와 동일(백엔드 책임)
- `mypage_proc.php` requestReturn: `UPDATE tbl_order_item SET status=2 WHERE ordno=:ordno AND m_no=:세션 AND status=8` → rowCount>0면 `setOrderLog(settle_no,ordno,"주문취소철회")` + `{success:true, message:'취소 요청이 철회되었습니다.'}`, else `{success:false, message:'관리자가 취소 요청을 확인 중이기 때문에 철회할 수 없습니다.'}`

## 결제(PG) — 해당
- 취소요청 상태(status 7·8) 주문 목록 조회 + 요청철회(status 8→2 복원). **결제 승인/환불 실행 아님**(상태 되돌리기만). 실제 UPDATE·로그는 백엔드.

## API 계약 (백엔드 전달)
- `GET /api/mypage/orders/cancel-requests?page=N&search_date=C` (세션) → `{ list: CancelRequestItem[]; page; totalPages }`
  - `CancelRequestItem { order_date, ordno, settle_no, product_name, price:number, delivery_type, status, shipment_status: string|null }`
  - 백엔드: where(`(status=7 OR status=8) AND m_no=세션`) + search_date 기간, order_item_id DESC, 20건/page. **product_name LIKE 미적용**(legacy 동일). delivery_type≠1 행에 shipment_status enrich(그 외 null).
- `POST /api/mypage/orders/request-return` (세션) — `{ settle_no, ordno }` → `{ success: boolean; message: string }`
  - 백엔드: `UPDATE tbl_order_item SET status=2 WHERE ordno AND m_no=세션 AND status=8`. 영향 행 있으면 로그("주문취소철회") + success:true/'취소 요청이 철회되었습니다.', 없으면 success:false/'관리자가 취소 요청을 확인 중이기 때문에 철회할 수 없습니다.'
- 응답 타입: `entities/mypage-order/model/cancel-types.ts`

## 타겟 매핑
- 라우트: `app/mypage/mypage_cancel_request.html/page.tsx` → `/mypage/mypage_cancel_request.html` (`requireMemberSession()`, `getMypageCancelRequests` deep import)
- screen: `screens/mypage-cancel-request/ui/mypage-cancel-request-screen.tsx` (server) — aside + 표 5열 + ServerPagination. 검색폼 없음.
- 컴포넌트: `screens/mypage-cancel-request/ui/request-return-button.tsx` (`'use client'`) — status==8 요청철회(confirm→postRequestReturn→alert+reload)
- entities: `entities/mypage-order` 확장 (`getMypageCancelRequests` server + `postRequestReturn` client + `cancel-types.ts`)
- 공용: `shared/ui/server-pagination`(baseUrl `/mypage/mypage_cancel_request.html`, params={search_product_name, search_date})
- mock: `shared/mocks/fixtures/mypage-cancel-requests.ts` + handler `GET */api/mypage/orders/cancel-requests`, `POST */api/mypage/orders/request-return`

## Parity 체크리스트
- [ ] aside(취소요청 active) + 표 5열(검색폼 없음) + 페이지네이션
- [ ] delivery_type 뱃지 + product_name(텍스트만, 이미지/플랫폼 없음)
- [ ] 진행상태: getOrderStatus 라벨(status 7=빈값) + 뱃지색(8·9 danger/그외 secondary) + 배송상태(dt≠1)
- [ ] 요청철회 버튼: status==8만 노출, confirm→mutation→alert+reload
- [ ] 빈 목록 colspan=5 / SEO(title 취소요청 내역/description 빈/author H2interactive/viewport)
