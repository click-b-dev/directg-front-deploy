# 실물주문 상세보기 (mypage/retail-order-view)

## 원본
- 파일: `pc/mypage/mypage_retail_order_view.html` (실물주문 내역의 "상세보기" 대상. 라이브 고아 계열)
- **DB**: 별도 DGKR DB(`$conn_dgkr`) + `Mypage` 클래스 — `retail_order`/`retail_order_log`/`retail_naverpay_log`/`retail_kcp_log`
- 도메인 클래스: `Mypage::getRetailOrder`, `getRetailOrderLog`, `getRetailNaverpayLog`, `getRetailKcpLog`
- 참조: `docs/design-system/client.md`, `../legacy-project/docs/ORDER-WORKFLOW-AUDIT.md`, `PAYMENT-APPROVAL.md`
- 선례: `screens/mypage-cancel-view`(상세 카드 패턴), `screens/mypage-retail-order`(목록)

## ⚠️ 개발자 승인 사항 (verbatim parity)
- 🔴 **하드코딩 m_no=1023882**: legacy `$m_no='1023882'`(세션 무시). getRetailOrder는 `WHERE settle_no AND m_no='1023882'`. **개발자 승인: legacy 그대로 이식**(백엔드가 하드코딩 1023882로 조회). 로그인 회원과 무관하게 1023882 주문만 정상 표시(보안 이슈 유지).
- 🔴 **dead 버튼 마크업만 재현**: 키확인/활성화/주문취소/주소수정/배송조회 버튼 — 이 파일에 핸들러 JS·모달 부재 → 렌더되나 무반응. **개발자 승인: legacy처럼 마크업만**(비기능).

## 화면·플로우
- 진입 URL: `/mypage/mypage_retail_order_view.html?settle_no=X`. **login_check(세션 필수, 페이지 가드)** — 단 데이터 조회 m_no는 하드코딩.
- 레이아웃: `container my-3 pb-5` > `main.d-grid.gap-3`(240px auto) > `aside_mypage`(active `retail_order` — 라이브 부재) + `section#content.content.rounded-0`. 순수 SSR(인터랙션 dead).
- **주문 표**(colgroup 없음, 동적 열): 주문번호 / 상품코드(goods_code) / 상품명(goods_nm) / 결제금액(number_format 원) / [키확인(reserve_id 있으면)] / 주문상태 / 비고
  - 키확인 th: `reserve_id` 있으면 열 추가. td: `reserve_id && step∈{2,3,4,5,6}` → is_lic_actv==1 ? 키확인 버튼(`btn_licence_view`) : 활성화 버튼(`btn_activate`) [dead]
  - **주문상태: `$statusText[step]` — `$statusText` 전역 미정의 → 항상 빈값**(legacy 버그, 그대로)
  - 비고: `step∉{8,9} && is_lic_actv≠1` → 주문취소 버튼(`btn_order_cancel`, data-toggle modal) [dead]
  - 배송정보 행(rowspan 3): "({zipcode}) {address} {address_detail} {name}" + [step2→주소수정 버튼 / step4·5→"CJ대한통운\<br\>{tracking_no}\<br\>배송조회 버튼"] [dead]
  - 배송요청메세지 행: "배송요청메세지 : {message}" + "연락처) {phone}"
  - reserve_id 있으면: "※ 제품 코드(키) 수신 후에는 단순 변심으로 인한 주문 및 발송 철회 불가합니다." 행
  - **step∈{8,9} → 반송정보 행**: "({log.zipcode}) ... / {log.phone}" — `getRetailOrderLog`는 `fetchAll`인데 `$log_data['zipcode']` 단일접근 → **항상 빈값**(legacy 버그, 그대로: `()  / `)
- **안내 카드**(정적 4문): 디지털/실물 7일, 특전제공, 활성화 안내
- **주문 정보 카드**(col-md-7): [naverpay면 결제번호=naverpay.paymentId] / 주문명(product_name) / 결제수단($settlekind) / 결제금액 / 결제일자(regdt) / [data.settlekind=="BANK"&&kcp → 은행명·현금영수증 거래/승인번호] / [data.settlekind=="CARD" → 카드승인번호(card_auth_no)]
- **할인 정보 카드**(col-md-5): emoney>0→포인트할인 / coupon>0→쿠폰할인 / cash>0→캐시할인 (각 number_format 원)
- 세션/권한: 페이지 login_check(세션) + 데이터는 하드코딩 m_no

### PG별 파생 (view — legacy 로직)
- product_name: naverpay→`naverpay.productName` / kcp·기타→`order.goods_nm`
- card_auth_no: naverpay→`naverpay.cardAuthNo` / kcp→`kcp.app_no` / 기타→미정의(빈값)
- **$settlekind(결제수단 표시)**: naverpay→`"네이버페이 "`(공백 포함) / kcp·기타→**미정의(빈값)** — legacy 변수 미할당 버그, 그대로
- 결제번호 행: naverpay일 때만(`naverpay.paymentId`)
- 은행/현금영수증 행: `order.settlekind=="BANK" && pg_provider=="kcp"` (kcp.bank_name/cash_no/cash_authno)
- 카드승인번호 행: `order.settlekind=="CARD"`

## SSR·SEO (legacy)
- head: `<title>주문 내역</title>`(상세인데 "주문 내역"), `description=""`, `author=H2interactive`. canonical/OG 없음.
- viewport: `width=device-width, initial-scale=1.0`. `data-bs-theme="dark"`. page/*.css 없음. 전 구간 SSR(버튼 dead).

## 데이터 (legacy)
- `Mypage::getRetailOrder(m_no, settle_no)`: `SELECT * FROM retail_order WHERE settle_no AND m_no`(m_no=='823942'면 m_no 미필터 분기 있음, 여기선 하드코딩 1023882). 필드: settle_no, goods_code, goods_nm, settleprice, reserve_id, step, is_lic_actv, asset_id, ord_ymd, zipcode, address, address_detail, name, tracking_no, message, phone, pg_provider, settlekind, regdt, emoney, coupon, cash
- `getRetailOrderLog(settle_no)`: `SELECT * FROM retail_order_log WHERE settle_no`(**fetchAll** — 템플릿 단일접근 버그로 빈값)
- `getRetailNaverpayLog(settle_no)`: `retail_naverpay_log WHERE merchantPayKey=settle_no`(fetch) — productName, cardAuthNo, paymentId
- `getRetailKcpLog(settle_no)`: `retail_kcp_log WHERE settle_no`(fetch) — app_no, bank_name, cash_no, cash_authno

## API 계약 (백엔드 전달)
- `GET /api/mypage/retail-orders/view?settle_no=X` (세션) → `{ order, naverpay, kcp }`
  - `order: RetailOrderDetail` — 위 retail_order 필드(number: settleprice/emoney/coupon/cash)
  - `naverpay: { productName, cardAuthNo, paymentId } | null` (pg_provider==naverpay)
  - `kcp: { app_no, bank_name, cash_no, cash_authno } | null` (pg_provider==kcp)
  - **백엔드 책임**: 별도 DGKR DB 조회, **m_no=1023882 하드코딩 필터**(legacy verbatim, 개발자 승인). retail_order_log는 legacy 버그로 빈값 렌더 → 계약 미포함(반송정보 빈 행만 재현).
- 응답 타입: `entities/mypage-order/model/retail-order-view-types.ts`

## 타겟 매핑
- 라우트: `app/mypage/mypage_retail_order_view.html/page.tsx` → `/mypage/mypage_retail_order_view.html` (`requireMemberSession()`, `getMypageRetailOrderView(settle_no)`)
- screen: `screens/mypage-retail-order-view/ui/mypage-retail-order-view-screen.tsx` (server) — 주문표(동적 열/버튼 dead) + 안내카드 + 주문/할인 카드
- entities: `entities/mypage-order` 확장 (`getMypageRetailOrderView` server + `retail-order-view-types.ts`)
- mock: `shared/mocks/fixtures/mypage-retail-order-view.ts` + handler `GET */api/mypage/retail-orders/view`

## Parity 체크리스트
- [ ] 주문표: reserve_id 동적 열(키확인) + 버튼 dead(키확인/활성화/주문취소/주소수정/배송조회) + colspan 로직
- [ ] 주문상태 빈값(버그) / 반송정보 빈값(버그, step 8·9) / $settlekind 빈값(kcp·기타)
- [ ] 주문정보 카드(PG 분기: paymentId/은행·현금영수증/카드승인번호) + 할인정보 카드(emoney/coupon/cash)
- [ ] 안내 카드 4문 / 하드코딩 m_no(백엔드) / SEO(title 주문 내역/viewport)
