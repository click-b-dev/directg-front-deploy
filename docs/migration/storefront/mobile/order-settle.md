# 모바일 결제하기 (settle) — 구조 parity · 0원(DG0000)+KCP 파일럿

order 도메인 3번째 모바일 단위. **하드 게이트**. 개발자 승인(2026-09-17, PC settle 2026-09-11 선례 계승):
- **범위 = 구조 parity**: 결제 페이지 UI + client 오케스트레이션(reserve AJAX → SDK/리다이렉트) + MSW mock. 실제 PG 거래는 백엔드 reserve/승인/webhook + merchant 자격증명 준비 후.
- **PG 범위 = 0원(DG0000) + KCP 파일럿**. toss/toss_bank/naverpay/payco 오케스트레이션은 **후속**.
- **order→settle = GET 쿼리 전환**: 모바일 `mobile-order-form` `method` **POST→GET** 소폭 수정(App Router 서버 페이지 searchParams 수신, PC 선례 승인 이탈).

## 원본 (legacy mobile)
- 파일: `mobile/order/settle.html`(753줄, 라이브 — `old_settle`·`test_settle`·`yjs_settle` 제외)
- PC 대응 단위: `docs/migration/storefront/order/settle.md` (재사용 출처)

## 화면·플로우 (legacy mobile 기준)
- 진입: order.html 결제하기 → `/order/settle.html`(POST → **GET 전환**: settle_kind, use_emoney, emoney_chk 없음(모바일 order는 emoney_chk를 hidden으로 보냄), zipcode, address, address2, buyr_name, buyr_tel2, msg). 로그인 필수. 항목0 → cart redirect. 보유<사용포인트 → "보유한 포인트보다 많은 포인트는 사용하실 수 없습니다." exit.
- **모바일 order 폼은 emoney_chk를 hidden으로 전송** → settle은 use_emoney를 그대로 사용(PC는 emoney_chk!="Y"면 0). 모바일 legacy settle은 emoney_chk 미참조·use_emoney 직접 검증 → GET 전환 시 emoney_chk 쿼리도 전달되나 settle-init 계약(use_emoney/emoney_chk)으로 재사용.
- 서버 매핑(settle_kind → pg): PC와 **동일**(`getSettleKindMapping` 재사용) — naverpay(N)/payco(P)/SC0010·SC0030·SC0040·SC0060(K,kcp)/toss_bank(T,toss)/toss(T,toss). 미일치 → `DG`+time·DG0000·"전액할인".
- buyr_name 빈값 → 세션 name(없으면 nickname), shop_user_id/buyr_mail = 세션 m_id (settle-init `buyr_name_fallback`/`shop_user_id`/`m_no` 재사용).
- 화면 요소 / 마크업 조각:
  - 헤더: `sub_header.html` → `MobileSubHeader("결제하기")` 재사용.
  - `m_Completepayment(FormOrJson, closeEvent)` 스크립트(KCP 인증완료 콜백, kcp_spay_hub.js보다 먼저 선언) — PC 동일.
  - `#checkoutFrm`(hidden: settlekind, pg_provider, use_emoney, zipcode, address, address2, buyr_name, buyr_tel2, msg):
    - 주문상품정보 `card cart-item`(이미지 + `goods_sku[]` hidden + 상품명 + 가격 promotion/else). **else 가격은 discount>0 가드 있음**(order와 달리 cart식, 정가 stray `</s>` 무효).
    - 배송지(실물 시): `ul.listview` 읽기전용(우편번호/주소+상세/이름/휴대폰/메시지)
    - 결제수단: `section-title` + `wide-block p-2`(label 텍스트)
    - **SC0040 가상계좌 필드**: 입금자명(va_name, default buyr_name) + 은행(va_bankcode select 13) + 현금영수증 구분(va_receipt_gubn, **값 ""/"1"/"2"** — PC는 ""/"0"/"1"과 다름, 모바일 verbatim) + 식별번호(va_taxno)
    - 최종 결제 금액 `ul.listview`: 총 상품 가격(won) / 총 할인(text-danger m-won) / 포인트 할인(use_emoney>0 시, m-won id total_point) / 총 결제 금액(fw-bold won, data-total)
    - `total_price` hidden + `btn_checkout` "결제하기"
  - `form_trade_reg`(KCP 거래등록, action=action_url): site_cd/site_name/Ret_URL/user_agent/ordr_idxx=settle_no/good_mny/good_cd/good_name/use_emoney/배송지/pay_method/escw_used/deli_term/va_*
  - `order_info`(KCP 승인, action `/order/<pg>/kcp_api_pay.php`): req_tx/shop_name/site_cd/currency=410/ordr_idxx/good_mny/good_cd/good_name/shop_user_id/buyr_*/res_cd·res_msg/enc_*/escw_used/pay_method/param_opt_1=m_no·param_opt_2=use_emoney/approval_key/PayUrl/[escrow rcvr_*·bask_cntx·good_info]/[SC0040 va_*]
  - PG SDK: `payco.js`(항상) · `kcp_spay_hub.js`(pg=kcp) · tosspayments k-adapter(pg=toss) · loadingoverlay
- **PC와 차이(모바일)**: step nav·유의사항 alert 없음, 카드형(PC 표), 배송지 listview(PC card), 결제수단 section-title(PC card), va_receipt_gubn 값 1/2(PC 0/1), 최종금액 4줄 listview(PC 요약카드).

## 인터랙션 (btn_checkout, PC 오케스트레이션 동일)
- gtag `add_payment_info`(value=total_amount, payment_type=label, items).
- total_amount=="0"(0원) → `postFullDiscount`(payload) → 반환 URL 이동. **[파일럿]**
- else switch(pg_provider):
  - **kcp** → `postKcpReserve`(payload) → code 분기: NG("로그인 해 주세요"·reload) / NG_POINT(alert·order_fail redirect) / 1(가상계좌 confirm→order_info res_cd/res_msg/use_pay_method/va_* 채우고 submit) / 0(`KCP_Pay_Execute_Web(order_info)`). **[파일럿]**
  - payco/naverpay/toss → **후속**(미배선).
- KCP 콜백 `m_Completepayment`: GetField→res_cd=="0000"이면 order_info.submit, 아니면 alert+closeEvent.

## 모바일 head / 앱셸
- viewport: theme#000, scale 고정. metadata: title "결제하기", description/keywords 빈값.
- 페이지 `<style>`: `.popover-header{background:#303D4E;font-size:14px}` + `.popover-body{font-size:12px}` verbatim(모바일 settle엔 popover 없으나 head style 존재 → 무해 이식).
- 앱셸: `MobileSubHeader("결제하기")` / bottom-nav·sidebar 전역(하단바 표시).
- 자산: 추가 복사 없음(플랫폼 아이콘 등 기존분).

## 데이터
- 재사용 엔티티: `entities/order` `getSettleInit`(settle_no_seq/items/member_emoney/buyr_name_fallback/shop_user_id/m_no) + `getSettleKindMapping`·`buildKcpGoodInfo`(lib) + `postKcpReserve`·`postFullDiscount`(client) + `OrderItem`/`SettleInit` 타입. **증분 0**.
- SettleContext 조립(query+init+매핑+파생값)은 PC `order-settle-screen`의 `buildContext`와 **동일 로직을 모바일 screen에 복제**(FSD: 스크린 간 import 금지 → 엔티티 헬퍼 공유·조립부만 복제).

## API 계약 (증분만, 백엔드 전달)
- **증분 없음**. `GET /api/order/settle-init` · `POST /api/order/full-discount`(0원) · `POST /api/order/kcp/reserve`(KCP) 모두 PC settle 단위 계약 완료(`docs/migration/storefront/order/settle.md`). mock `settleInitFixture` + 핸들러(settle-init/full-discount/kcp reserve) 재사용. KCP 승인/toss/naverpay/payco reserve는 백엔드·후속.

## 타겟 매핑
- middleware `MOBILE_ROUTES` 추가 경로: `/order/settle.html`
- **order 폼 수정**: `screens/mobile-order-order/ui/mobile-order-form.tsx` `method="POST"` → `method="get"`(settle GET 전달, 개발자 승인 parity 이탈).
- 라우트: `app/m/order/settle.html/page.tsx`(**GET**, `requireMemberSession` + searchParams(settle_kind/use_emoney/emoney_chk/zipcode/address/address2/buyr_name/buyr_tel2/msg) + `getSettleInit` + 항목0 `redirect("/order/cart.html")` + viewport theme#000 / metadata "결제하기")
- screen: `screens/mobile-order-settle` — `mobile-order-settle-screen.tsx`(**server**: `MobileSubHeader` + `#appCapsuleSub.full-height` + `buildContext` 조립 + `MobileSettleCheckout`) + `mobile-settle-checkout.tsx`(**client**: checkoutFrm/order_info/form_trade_reg + btn_checkout 오케스트레이션[0원·KCP] + m_Completepayment + KCP SDK `<Script>` + gtag)
- 재사용: `entities/order`(settle 계약 전부) · `MobileSubHeader` · settle mock
- 신규 UI: 없음
- mock: 재사용(`settleInitFixture`)

## Parity 체크리스트 (모바일 UA, 구조)
- [ ] MobileSubHeader("결제하기") · appCapsuleSub full-height
- [ ] settle_kind→pg 매핑(8종)·settle_no prefix·DG0000 fallback
- [ ] 주문상품 카드(이미지/goods_sku[]/상품명/가격 분기)·배송지 listview(실물 시)·결제수단 label·SC0040 va 필드(은행13/현금영수증 1·2)·최종금액 4줄(상품가/할인/포인트/결제 data-total)
- [ ] order_info KCP 폼 필드·SDK 로드(pg별 payco/kcp)·m_Completepayment
- [ ] btn_checkout: gtag·0원(full-discount)·kcp(reserve 4분기·가상계좌 confirm·KCP_Pay_Execute_Web)
- [ ] order→settle GET 전달(order 폼 method get)·항목0 redirect·title "결제하기"
- [ ] middleware rewrite / 하단바 표시
- [ ] toss/naverpay/payco 후속 명시

## 보류/후속
- **toss/toss_bank·naverpay·payco 오케스트레이션**: 각 후속(reserve→SDK/redirect/팝업).
- 백엔드: `getSettleNo`·`*_reserve`·`kcp_api_pay`·`webhook`·`order_full_discount` 등.
- **검증 한계**: 실제 결제 플로우는 백엔드 reserve/승인/webhook + PG 계정 없이 end-to-end 검증 불가. 본 단위 parity = 구조(마크업·매핑·오케스트레이션 로직·SDK 로드) + MSW mock 흐름.
- order_end/order_fail(결제 완료/실패 목적지) — 후속 단위.
