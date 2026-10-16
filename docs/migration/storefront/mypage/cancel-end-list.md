# 취소완료 내역 (mypage/cancel-end-list)

## 원본
- 파일: `pc/mypage/mypage_cancel_end.html` (라이브 — `aside_mypage.html:23` "취소완료 내역" 대상)
- 도메인 클래스: `Mypage2::getOrderList_v2`(목록+페이징), `Order::getOrderStatus`(주문상태 라벨), `Order::getOrderShipment`+`getShipmentStatus`(택배 배송상태)
- 참조: `docs/design-system/client.md`, `../legacy-project/docs/ORDER-WORKFLOW-AUDIT.md`
- 선례: `screens/mypage-cancel-request`(취소요청 내역, 거의 동일 구조), `entities/mypage-order`

## 화면·플로우
- 진입 URL: `/mypage/mypage_cancel_end.html`, GET `?page=N&search_product_name=S&search_date=C`(둘 다 **where 미적용 = dead**). **login_check(세션 필수)**.
- 레이아웃: `container my-3 pb-5` > `main.d-grid.gap-3`(240px auto) > `aside_mypage`(active `cancel_end`) + `section#content`. footer_banner 없음.
- **검색 폼 없음(quirk)**: 취소요청 내역과 동일(PHP 필터·JS `#orderFrm` dead, body에 폼 부재).
- 표 5열(colgroup 15/*/8/8/8) — **취소요청 내역과 동일 구조**:
  1. 주문일자(주문번호): `order_date` / `(ordno)`
  2. 상품정보: delivery_type 뱃지 + `product_name` (텍스트만)
  3. 주문금액: `number_format(price)` 원
  4. 진행상태: `d-flex flex-column` > 주문상태 뱃지 [+ 배송상태 뱃지(delivery_type≠1)]
     - 주문상태: `<span class="badge bg-{color} font-12">{getOrderStatus(status)}</span>` — color: status 8·9 → `danger`(취소완료는 status 9 → danger + "취소완료")
     - 배송상태: delivery_type≠1이면 `<span class="badge bg-info">{getShipmentStatus(shipment_status)}</span>` (**`bg-info` — 취소요청의 `text-bg-info`와 다름**)
  5. 비고: **상세보기** 버튼(`btn btn-sm btn-secondary`) → `/mypage/mypage_cancel_view.html?settle_no=` (취소요청의 요청철회 버튼과 달리 상세보기)
- 빈 목록: "취소완료 이력이 존재하지 않습니다." colspan=5 (legacy `total_results==0`)
- 하단: `#pagination`(links_html) — param에 검색조건(raw `$_GET`)
- 세션/권한: **로그인 필수**

## SSR·SEO (legacy)
- head: `<title>취소완료 내역</title>`, `description=""`, `author=H2interactive`. canonical/OG 없음.
- viewport: `width=device-width, initial-scale=1.0`. `data-bs-theme="dark"`.
- page/*.css 없음. moment/daterangepicker 미로드. 전 구간 SSR(인터랙션 없음 — 상세보기는 링크).

## 데이터 (legacy)
- `getOrderList_v2($page,$where,$orderby,$param)`: `SELECT a.ord_ymd,a.step,b.* FROM tbl_order a INNER JOIN tbl_order_item b ON a.settle_no=b.settle_no WHERE {where} ORDER BY b.order_item_id DESC` — 20건/page.
  - where: `b.status='9' AND b.m_no='{세션}'` — **날짜 필터 미적용**(search_date 계산되나 where에 미추가, `search_product_name`도 미적용 — legacy quirk, 둘 다 dead)
  - 표시 필드: order_date, ordno, settle_no, product_name, price, delivery_type, status(=9)
- per-row enrich: delivery_type≠1이면 `getOrderShipment(settle_no,ordno)` → shipment_status

## 결제(PG) — 해당
- 취소완료(status 9) 주문 목록 조회 전용(읽기). mutation 없음.

## API 계약 (백엔드 전달)
- `GET /api/mypage/orders/cancel-end?page=N` (세션) → `{ list: CancelEndItem[]; page; totalPages }`
  - `CancelEndItem { order_date, ordno, settle_no, product_name, price:number, delivery_type, status, shipment_status: string|null }`
  - 백엔드: where(`status=9 AND m_no=세션`) **날짜/상품명 필터 없음**(legacy 동일), order_item_id DESC, 20건/page. delivery_type≠1 행에 shipment_status enrich(그 외 null).
- 응답 타입: `entities/mypage-order/model/cancel-end-types.ts`

## 타겟 매핑
- 라우트: `app/mypage/mypage_cancel_end.html/page.tsx` → `/mypage/mypage_cancel_end.html` (`requireMemberSession()`, `getMypageCancelEnd` deep import)
- screen: `screens/mypage-cancel-end/ui/mypage-cancel-end-screen.tsx` (server) — aside + 표 5열 + ServerPagination. 검색폼 없음, 인터랙션 없음(상세보기 링크).
- entities: `entities/mypage-order` 확장 (`getMypageCancelEnd` server + `cancel-end-types.ts`)
- 공용: `shared/ui/server-pagination`(baseUrl `/mypage/mypage_cancel_end.html`, params={search_product_name, search_date})
- mock: `shared/mocks/fixtures/mypage-cancel-end.ts` + handler `GET */api/mypage/orders/cancel-end`

## Parity 체크리스트
- [ ] aside(취소완료 active) + 표 5열(검색폼 없음) + 페이지네이션
- [ ] delivery_type 뱃지 + product_name / 주문금액
- [ ] 진행상태: getOrderStatus(status 9=취소완료/danger) + 배송상태(dt≠1, **bg-info**)
- [ ] 비고 상세보기 링크(mypage_cancel_view) / 빈 목록 colspan=5
- [ ] SEO(title 취소완료 내역/description 빈/author H2interactive/viewport)
