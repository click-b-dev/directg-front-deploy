# 모바일 마이페이지 - 주문 내역 상세보기 (mypage_order_view)

## 원본 (legacy mobile)
- 파일: `mobile/mypage/mypage_order_view.html`(631줄, 라이브 — order 목록/취소/입금대기 화면의 "상세보기" 대상) + `licence_activate.php`(키 확인/활성화) + `order_cancel_proc.php`(취소요청)
- PC 대응: **디지털 주문상세는 PC 미이관**. `entities/mypage-order`의 `MypageCancelViewResponse`(cancel-view, getOrderV2 재사용, **읽기전용**)와 라벨맵만 부분 참조. → **엔티티 증분 필요**(order-view)
- **결제(PG) 인접 화면** — 개발자 승인하 진행(bill URL·취소요청·키활성화 포함)
- 데이터: `Mypage::getOrderV2(m_no, settle_no)` + `getOrderItemV2(settle_no)` + `Order::getOrderAddress`(미표시) + PG bill URL(version=3, PG별 로그) + `Order::getOrderShipment`(택배 배송상태)

## 화면·플로우 (legacy mobile 기준)
- 진입 URL: `/mypage/mypage_order_view.html?settle_no=X`(GET), title "주문 내역 상세보기". **세션 필수(login_check)**, m_no 소유 확인(getOrderV2)
- 헤더: `inc/sub_header.html` → `MobileSubHeader("주문 내역 상세보기")`
- 본문 `#appCapsuleSub` 3섹션:
  1. **주문 상품 정보**(`section full`>`wide-block`): item_data 반복 `card`:
     - `card-header`: {ordno} <small>({order_date})</small>
     - `card-body`(bg #191919): 상태 배지 —
       - status=1 & send_status=="fail" → `badge bg-danger` "발송오류"
       - status=2 & delivery_type=="1" → `badge bg-secondary` (is_actv=="1"?"수령완료":"수령대기")
       - status=2 & delivery_type≠"1" → `badge bg-secondary` {getShipmentStatus(shipment_status)}
       - status=8 → `badge bg-danger` "취소요청"
       - status=9 → `badge bg-danger` "취소완료" + "취소 일자 : {cancel_date}"
       - + product_name(font-16) + price 원
     - `card-footer` 버튼:
       - is_actv=="1" → `btn btn-success btn-block btn_license` "키 확인"
       - else status=2 → (delivery_type≠"2" → `btn btn-primary btn-block btn_activate` "키 활성화") + `btn btn-danger btn-block btn_cancel` "취소요청"(항상)
       - else status=1 & send_status=="fail" → `btn btn-danger btn-block btn_cancel` "취소요청"
       - shipment_status ∈ {4,5,6} → `btn btn-primary btn-block btn_delivery_search` "배송조회"
     - 합계 total_price += price(프론트 합산)
  2. **주문 정보**(list-group): 결제번호(settle_no) / 총 주문금액(Σprice) / 총 할인금액(use_emoney+use_cash+member_dc, 상세: 포인트+캐시(>0)+회원즉시(>0)) / 총 결제금액(total_price)
  3. **결제정보**(list-group): 결제PG(pg_provider) / 결제수단(getPaymentMethod) / 결제상태(getCheckoutStatus(step)) / 결제일자(payment_date) / 구매영수증(step=="2"일 때만 `a[href=bill_url][target=_blank]` "고객용 영수증 보기", li는 step≠2면 d-none)
- 세션/권한: 로그인 필수 + m_no 소유

## 인터랙션 (legacy JS)
- **배송조회**(btn_delivery_search): 동적 form POST _blank — delivery_code=="002" 우체국(sid1) / else CJ(slipno)
- **키 확인**(btn_license): order_system→mode(getAssetLicence/getZtormLicence/getGenbaLicence/getVaultnLicence/getPointNexusLicence) → `POST licence_activate.php {mode, ordno, settle_no}` → licenceModal `#license_result`에 응답 HTML 주입 + show. LoadingOverlay
- **키 활성화**(btn_activate): order_system→mode(setXxxActivate). data-preorder 미설정 → **preorderModal 분기 dead**(항상 activateModal). activateModal 열고 settle_no/ordno/mode/product_name 주입 → 수취확인(btn_activate) → `POST licence_activate.php` serializeArray → error_code=="99"면 alert(error_msg) / else location.reload. LoadingOverlay
- **취소요청**(btn_cancel): orderCancelModal 열고 settle_no/ordno/product_name 주입. payment_method ∈ {SC0040, SC0030, toss_bank} → 환불계좌 필드(message3 은행명/message4 계좌번호/message5 예금주) 노출. 취소요청(btn_order_cancel) → `POST order_cancel_proc.php` serializeArray(mode=order_cancel, settle_no, order_status(빈값), product_name, ordno, message3~5) → error_code=="OK"면 alert(error_msg)+reload. LoadingOverlay

## 모바일 head / 앱셸
- viewport device-width scale 1 고정 viewport-fit cover, theme #000, **mobile-web-app-capable**(apple-… 아님), title "주문 내역 상세보기", description/keywords 빈값, Noto Sans KR 링크(head) — 앱 공통 폰트로 커버
- 앱셸: `MobileSubHeader` + `/m/layout` bottom-nav/sidebar + bootstrap.min.js. 상품카드/모달/뮤테이션 → **client**
- 페이지별 mobile-assets CSS: 없음

## API 계약 (증분, 백엔드 전달)
- `GET /api/mypage/orders/view?settle_no=X` (세션) → `{ order: OrderViewOrder, items: OrderViewItem[] }`
  - `OrderViewOrder { settle_no, total_price, use_emoney, use_cash, member_dc, pg_provider, payment_method, step, payment_date, bill_url }`
    - 백엔드: getOrderV2(m_no 소유확인). **bill_url**: version=3 & step 조건에서 PG별 구성(kcp: payment_method SC0010 card/SC0030 acnt/SC0040 vcnt/SC0060 mcash + getOrderKcpLog tno/amount / payco: bill.payco.com/outseller/receipt/{orderNo} / toss: dashboard.tosspayments.com/receipt/redirection?transactionId={payment_key|tno}). version 1·2는 빈값
  - `OrderViewItem { ordno, order_date, product_name, price, status, send_status, is_actv, delivery_type, order_system, cancel_date, shipment_status, tracking_number, delivery_code }`
    - 백엔드: getOrderItemV2 + delivery_type≠1이면 getOrderShipment(shipment_status/tracking_number/delivery_code)
- `POST /api/mypage/orders/licence` (세션) — `{ settle_no, ordno, order_system }` → `{ html: string }`(제품키 HTML). 백엔드: order_system→getXxxLicence
- `POST /api/mypage/orders/activate` (세션) — `{ settle_no, ordno, order_system }` → `{ error_code, error_msg }`. 백엔드: order_system→setXxxActivate. error_code=="99"=실패 알림
- `POST /api/mypage/orders/cancel` (세션) — `{ settle_no, ordno, product_name, order_status, message3?, message4?, message5? }` → `{ error_code, error_msg }`. 백엔드: order_cancel_proc(취소요청 접수, PG 취소·환불은 후속 운영). error_code=="OK"=접수
- 응답 타입: `entities/mypage-order/model/order-view-types.ts`
- 라벨맵(프론트 상수, cancel-view 재사용): getPaymentMethod/getCheckoutStatus/getShipmentStatus

## 타겟 매핑
- middleware MOBILE_ROUTES +1: `/mypage/mypage_order_view.html`
- 라우트: `app/m/mypage/mypage_order_view.html/page.tsx`(server, requireMemberSession + `searchParams.settle_no` + getMypageOrderView deep import)
- screen: `screens/mobile-mypage-order-view`
  - `ui/mobile-mypage-order-view-screen.tsx`(server) — MobileSubHeader + 3섹션(주문정보/결제정보 static, 상품카드는 client) + bill_url 링크
  - `ui/mobile-order-view-items.tsx`(**client**) — 상품카드 + 버튼분기 + activateModal/licenceModal/orderCancelModal(React 제어) + 배송조회 외부폼 + 뮤테이션
- 재사용: `entities/mypage-order`(라벨맵·cancel-view 참조) · `member-auth`. **증분** order-view 엔티티(위)

## 보존할 legacy quirk
- preorderModal 분기 dead(btn_activate data-preorder 미설정) → preorder 경로/모달 미구현
- 구매영수증 li는 step≠"2"면 d-none(사실상 미표시) — step=="2"에서만 링크
- $order_shipment PHP 변수 스코프 carryover(배송조회 판정) → **per-item shipment로 정정 구현**(각 item.shipment_status 기준, 데이터 계약이 item별 제공). 다중 mixed 주문 edge의 스코프 버그는 재현 안 함(문서화)
- order_status 취소폼 hidden 빈값(JS 미설정)
- 총 주문금액=Σ item price(프론트 합산), 총 결제금액=order.total_price
- 배송조회 외부폼(우체국 002/CJ) _blank

## Parity 체크리스트 (모바일 UA)
- [ ] 세션 가드·MobileSubHeader("주문 내역 상세보기")·3섹션 구조
- [ ] 상품카드 상태배지(발송오류/수령완료·대기/배송상태/취소요청/취소완료+일자)
- [ ] 버튼분기(키확인/키활성화(delivery≠2)/취소요청/배송조회) 정확
- [ ] 주문정보(결제번호/총주문/할인상세/총결제) · 결제정보(PG/수단/상태/일자/영수증 step=2)
- [ ] 키확인→licenceModal HTML / 키활성화→activateModal→activate(99 alert/else reload) / 취소요청→orderCancelModal(환불계좌 조건부)→cancel(OK alert+reload)
- [ ] 배송조회 외부폼 새 탭 · preorder dead
- [ ] 모바일 head/theme #000/title · 하단 네비 · middleware rewrite + 데스크톱 폴백
