# 모바일 주문서 (order)

order 도메인 2번째 모바일 단위. cart "주문하기" POST 목적지. PC `order-order` 이미 이관 → `entities/order` 재사용(증분 0). 결제(settle.html/PG)는 다음 하드 게이트.

## 원본 (legacy mobile)
- 파일: `mobile/order/order.html`(668줄, 라이브 — `order_20251024`·`old_order`·`test_order`·`yjs_order`는 dev/구본 제외)
- PC 대응 단위: `docs/migration/storefront/order/order.md` (재사용 출처)

## 화면·플로우 (legacy mobile 기준)
- 진입 URL: `/order/order.html`. cart `#orderFrm`(POST)의 action. **POST body 미사용** — `getOrderItemList(세션 m_no)`로 선택항목 재조회. 로그인 필수(`login_check.php`).
- 주문상품 0건 → `go(cart.html)` redirect.
- 데이터: `getOrderItemList(m_no)`(선택항목) + `getMemberEmoney(m_no)`(dgkr 포인트). **모바일은 `getMemberAddress` 미조회 → 배송지 prefill 없음**(PC와 차이).
- `is_delivery_address`: 항목 중 delivery_type 2·3(실물) 있으면 true → 배송지 섹션 노출.
- 화면 요소 / 마크업 조각:
  - 헤더: `inc/sub_header.html` include → `MobileSubHeader("주문하기")` 재사용(검색토글/뒤로/장바구니).
  - `#appCapsuleSub.full-height > form#orderFrm`(POST → `settle.html`): hidden `emoney_chk`(N)·`delivery_type`(**= 마지막 항목 delivery_type** — PHP foreach 잔여값 quirk)
  - **주문상품정보**(`section-title` + `card cart-item` 반복): 이미지 `card-img-top`(상대경로) + `card-title` product_name + `card-text` 가격. **hidden goods_sku[] 없음**(모바일 폼은 항목 미전송, 서버 재조회).
    - 가격: promotion → `badge bg-danger`(discount_rate %) + `strong.price.text-white.won`(sale_price) + `s.consumer_price.won`(consumer_price) / else → `badge bg-primary`(discount %, **무조건 — cart처럼 discount>0 가드 없음, 0%도 표시 quirk**) + strong price + s consumer_price
  - **다이렉트 게임즈 포인트 사용**(**항상 노출** — PC의 total_price>=3000 게이트 없음): 포인트 label + `btn_emoney_use`/`btn_emoney_cancel`(사용/취소) + `use_emoney` number input(step 100) + 잔여 포인트
  - **결제수단**(`input-list` radio): toss(일반결제, event.svg 기간게이트 + footer_banner + 주의 3) / naverpay(이벤트배너 기간게이트 만료 + 주의) / payco(주의) / SC0060 휴대폰(주의 + [환불정책] 링크) / SC0040 가상계좌(주의). **주석: toss_bank·SC0010·SC0030 미노출**(주석 유지).
  - **배송지**(`is_delivery_address` 시): 우편번호(readonly)+검색(Daum) / 주소(readonly) / 상세주소 / 주문자 이름(max20) / 휴대폰번호(max13) / 배송 요청메세지. **prefill 없음**(빈 입력).
  - **최종 결제 금액**(`card > ul.listview.flush.transparent`): 총 상품 가격(won) / 총 할인(text-danger m-won) / 포인트 사용(d-none↔d-flex 토글, text-info m-won) / 총 결제 금액(text-primary fw-bold fs-4 won, `data-total`)
  - **청약의사 재확인**(`section-title` + popover 전자상거래법 8조2항 + `ion-icon` information-circle): is_agree 체크박스
  - **결제하기** submit(`btn_order`)
- **PC와 차이(모바일)**: step nav·유의사항 alert·타입/플랫폼/배송/음성한국어/예약/특전 badge·주소 prefill 없음, 카드형(PC는 표), 포인트 섹션 항상 노출, POST(PC는 GET), 배송지 6필드 전체 필수 검증.

## 인터랙션 (JS)
- `set_real_settle_price(checkEmoney)`(ready 시 0, 포인트 사용/취소 시): real_settle = total_price − emoney → `#total_price` 갱신 → **결제수단 radio 전체 uncheck** → real_settle 가격대별 disable. 라이브 임계값(PC 동일): **toss≥300 · naverpay≥100 · payco≥100 · SC0060≥350 · SC0040≥10000**.
- 포인트 사용(`btn_emoney_use`): 빈/0 → alert "사용할 포인트(원)을 입력해주세요." → emoney_chk=Y → 100원 floor → 보유<1000 alert "보유한 포인트가 1000원 이상시 사용가능합니다."·0초기화 / 결제금액 초과→결제금액 cap / 보유 초과→alert "보유포인트보다 많은 포인트을 사용하실 수 없습니다."·0초기화. 성공 시 use_emoney readonly·display show·재계산.
- 포인트 취소(`btn_emoney_cancel`): emoney_chk=N, use_emoney>0이면 0·readonly 해제·재계산(0)·display hide.
- 우편번호(`btn_zipcode`) → `sample4_execDaumPostcode`(kakao cdn) → zipcode/address 채움, address2 focus → `openDaumPostcode()` 재사용.
- buyr_tel2 input: 전화번호 포맷(02/지역/휴대폰) → `formatPhone` 재현.
- submit(`#orderFrm`): emoney_chk=="N"이면 use_emoney=0 → settle_kind `:checked:not(:disabled)` 없고 total≠0이면 alert "결제수단을 선택해주세요." → delivery_type!="1"이면 zipcode/address/address2/buyr_name/buyr_tel2/msg 순차 필수 alert → is_agree 없으면 alert "결제진행을 위해선 청약의사 관련 내용에 동의가 필요합니다." → 통과 시 settle.html POST.
- 청약 popover: `new bootstrap.Popover`.

## 모바일 head / 앱셸
- viewport: `width=device-width, scale 1 고정, viewport-fit=cover`, `theme-color #000`. metadata: title "주문하기", description/keywords 빈값. canonical/OG 없음.
- 페이지 `<style>`: `.popover-header{background:#303D4E;font-size:14px}` + `.popover-body{font-size:12px}` verbatim.
- 사용 앱셸: `MobileSubHeader("주문하기")` / bottom-nav·sidebar = `app/m/layout.tsx` 전역(하단바 표시).
- 자산: `public/mobile-assets/images/order/`의 `event.svg`·`toss_logo.svg`·`logo_npaybk_small.svg`·`PAYCO_Logo_Basic.svg` **재사용**(foundation 정적자산 네임스페이스 복사 `9c73daa9`에서 이미 존재, 별도 복사 불필요). 주석 결제수단용 `m_toss_quick`/`quick`/`PAYCO_Logo_white`도 foundation 복사분(미참조).

## 데이터
- 재사용 엔티티: `entities/order` `getOrderCheckout`(items/member_emoney/**member_address 미사용**/is_delivery_address) + `OrderItem` 타입. `openDaumPostcode`(shared/lib). **증분 0**.
- 모바일 사용 필드(subset): product_code, product_name, promotion, consumer_price, price, discount, delivery_type, goods_sku(key). (game_type/display_type/product_platform/spoken_korean/is_preorder/is_bonus는 모바일 미사용 — badge 없음.)
- 모바일 전용 동작: 없음. settle.html은 native POST(PG는 다음 단위).

## API 계약 (증분만, 백엔드 전달)
- **증분 없음**. `GET /api/order/checkout`(items+member_emoney+member_address+is_delivery_address)는 PC order 단위 계약 완료(`docs/migration/storefront/order/order.md`). mock `orderCheckoutFixture` 재사용. settle POST 계약은 결제 단위에서 확정.

## 타겟 매핑
- middleware `MOBILE_ROUTES` 추가 경로: `/order/order.html`
- 라우트: `app/m/order/order.html/page.tsx`(server, `requireMemberSession` + `getOrderCheckout` + 항목0 `redirect("/order/cart.html")` + viewport theme#000 / metadata "주문하기")
- screen: `screens/mobile-order-order` — `mobile-order-order-screen.tsx`(**server 셸**: `MobileSubHeader` + `#appCapsuleSub.full-height` + 기간게이트(toss/naver 서버평가) + deliveryType 계산 + `MobileFooterBanner` 슬롯) + `mobile-order-form.tsx`(**client**: 항목/포인트/결제수단/배송지/요약/제출/daum/popover)
- 재사용: `entities/order`(getOrderCheckout/OrderItem) · `openDaumPostcode` · `MobileSubHeader` · `MobileFooterBanner`(기간게이트 만료→null)
- 신규 UI: 없음
- mock: 재사용(`orderCheckoutFixture`)

## Parity 체크리스트 (모바일 UA)
- [ ] MobileSubHeader("주문하기") · appCapsuleSub full-height
- [ ] 주문상품정보 카드(이미지/상품명/가격 promotion·else bg-primary 무조건 badge)
- [ ] 포인트 사용 항상 노출 · 검증(빈/1000미만/100단위/cap/초과) · 사용/취소 · 재계산 · display 토글
- [ ] 결제수단 5종(toss event.svg 기간게이트+footer_banner / naverpay 만료배너 / payco / SC0060 환불링크 / SC0040) · 최소금액 disable(임계값) · 포인트변경 시 uncheck
- [ ] 배송지(실물 시)·prefill 없음·우편번호검색(daum)·전화포맷·제출 6필드 순차검증
- [ ] 최종 결제 금액 4줄(상품가/할인/포인트/결제=total−emoney)
- [ ] 청약 popover · is_agree 없으면 alert · 결제하기 settle.html POST
- [ ] 모바일 head/viewport(theme#000) · title "주문하기"
- [ ] 항목0 → cart.html redirect
- [ ] middleware rewrite(모바일 UA `/order/order.html`) / 데스크톱 PC 유지
- [ ] 하단바 표시

## 보류/후속
- **settle.html + PG(kcp/toss/naver/payco)**: 하드 게이트, 다음 단위. order.html submit은 settle.html 라우트 부재 시 폴백/404(예상).
- add_cart(상품페이지 담기 wiring) — 별도 단위.
- toss_bank·SC0010·SC0030 결제수단 legacy 주석 = 미이관(주석 상태 유지).
- delivery_type hidden = 마지막 항목값 quirk(섹션 노출은 any-실물, 제출 검증은 last-item) verbatim 보존.
