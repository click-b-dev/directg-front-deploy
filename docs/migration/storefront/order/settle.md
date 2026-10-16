# 결제하기 (settle.html) — 구조 parity · 0원(DG0000)+KCP 파일럿

order 영역 결제 단위(03 결제하기). **하드 게이트**. 개발자 승인 결정(2026-09-11):
- **범위=구조 parity**: 결제 페이지 UI + 클라이언트 오케스트레이션(reserve AJAX→SDK/리다이렉트) + MSW mock. 실제 PG 거래는 백엔드 reserve/승인/webhook + merchant 자격증명 준비 후.
- **PG 범위=0원(DG0000)+KCP 파일럿**. toss/toss_bank/naverpay/payco 오케스트레이션은 **후속 단위**.
- **order→settle 전달=GET 쿼리 전환**: legacy native POST → App Router GET(searchParams). 승인된 `order.html` 폼 `method` POST→GET 소폭 수정(parity 이탈, 본 게이트 승인).

## 원본
- 파일: `pc/order/settle.html`(907줄, 라이브 — `yjs_settle.html`·`old_settle.html`·`test_settle.html` 제외)
- 참조: `docs/design-system/client.md`, `../legacy-project/docs/PAYMENT-APPROVAL.md`, `ORDER-WORKFLOW-AUDIT.md`

## 화면·플로우
- 진입: order.html 주문하기 → `/order/settle.html`(GET 쿼리: settle_kind, use_emoney, emoney_chk, zipcode, address, address2, buyr_name, buyr_tel2, msg). 로그인 필수(login_check). 항목0→cart redirect. `emoney_chk!="Y"`면 use_emoney=0. 보유<사용 포인트면 "보유한 포인트보다 많은…" exit.
- 서버 매핑(settle_kind → pg):
  | settle_kind | label | pg_provider | prefix | pay_method | site_cd | escw | deli_term |
  |---|---|---|---|---|---|---|---|
  | naverpay | 네이버페이 | naverpay | N | — | — | — | — |
  | payco | 페이코 | payco | P | — | — | — | — |
  | SC0010 | 신용/체크카드 결제 | kcp | K | 100000000000 | AKPV0 | N | — |
  | SC0030 | 실시간계좌이체 결제 | kcp | K | 010000000000 | AKPV0 | Y | 3 |
  | SC0040 | 가상계좌(무통장입금) 결제 | kcp | K | 001000000000 | AKPV0 | Y | — |
  | SC0060 | 휴대폰 결제 | kcp | K | 000010000000 | AKPV0 | N | — |
  | toss_bank | 퀵계좌이체 결제 | toss | T | 010000000000 | directg | Y | 3 |
  | toss | 일반결제 | toss | T | — | directg | — | — |
  - settle_no = prefix + `getSettleNo()`(백엔드 시퀀스). 매핑 미일치(빈 settle_no) → `DG`+time, settle_kind=DG0000, label="전액할인".
  - buyr_name 빈값 → 세션 name(없으면 nickname). shop_user_id/buyr_mail = 세션 m_id.
- 화면 요소:
  - step nav(03 결제하기 active)
  - 유의사항 alert(3 li: 주문실수/7일취소/수량제한)
  - `checkoutFrm`(hidden: settle_no, settlekind, pg_provider, use_emoney, zipcode, address, address2, buyr_name, buyr_tel2, msg + goods_sku[]/item + total_price):
    - 주문상품정보 표(item: 이미지/타입badge[basic→info·edition→primary, cart식]/플랫폼PNG(w-50)/배송badge/상품명/가격 프로모션·상시할인·정가)
    - col-8: 배송지 card(zipcode 있을 때) + 결제수단 card(settle_kind_label; **SC0040→입금자명/은행select13/현금영수증구분/식별번호** card-footer) + 포인트사용 card(use_emoney>0)
    - col-4: 최종 결제금액(총주문금액 total_order_price·포인트할인·총결제금액 total_amount data-total=total_price) + `btn_checkout` 결제하기
  - `order_info` 폼(KCP, action `/order/<pg>/kcp_api_pay.php`): KCP 파라미터 다수(site_cd/site_name/pay_method/ordr_idxx=settle_no/good_mny=total_price/good_cd/good_name/currency/escw_used/pay_mod/shop_user_id/buyr_*/rcvr_*/bask_cntx/good_info/res_cd·res_msg·enc_*·tran_cd·use_pay_method/ordr_chk/cash_*/va_*[SC0040]/deli_term[escrow]/used_card[SC0010]/param_opt_1=m_no·param_opt_2=use_emoney)
  - PG SDK: `payco.js`(항상) · `kcp_spay_hub.js`(pg=kcp) · tosspayments(pg=toss)
- 파생값: total_order_price=Σsell / total_goods_price=Σconsumer / total_price=Σsell−use_emoney / good_name=첫상품명(+" 외 N개") / good_cd=첫 goods_sku(+외) / good_info=KCP 항목문자열(seq/ordr_numb=settle_no_(k+1)/good_name/good_cntx=1/good_amtx=price, join chr(31)/chr(30)) / ordno=settle_no_(k+1).

### 클라이언트 오케스트레이션(btn_checkout)
- gtag `add_payment_info`(value=total_amount, payment_type=label, items).
- total_amount=="0"(0원) → `order_full_discount.php`(AJAX, checkoutFrm serialize) → 반환 URL로 redirect(order_end). **[파일럿 구현]**
- else switch(pg_provider):
  - **kcp** → `kcp_reserve.php`(AJAX json) → code 분기: NG("로그인 해 주세요"·reload) / NG_POINT(alert·order_fail redirect) / 1(가상계좌 confirm→order_info의 res_cd/res_msg/use_pay_method/va_* 채우고 order_info.submit) / 0(`jsf__pay(order_info)`→`KCP_Pay_Execute_Web`). **[파일럿 구현]**
  - payco → `callPaycoUrl()`→payco_reserve→payco_open 팝업. **[후속]**
  - naverpay → naverpay_reserve→payment_url redirect. **[후속]**
  - toss → toss_reserve→toss_widget.php 팝업→localStorage 'toss_payment_complete'→order_end. **[후속]**
- KCP 콜백 `m_Completepayment(FormOrJson,closeEvent)`(kcp_spay_hub.js보다 먼저 선언 필수): GetField→res_cd=="0000"이면 order_info.submit, 아니면 alert+closeEvent.

### 세션/권한 의존
- `$_SESSION['member']`(m_no/m_id/name/nickname). 쿠키 포워딩. `requireMemberSession` 가드. 포인트=dgkr DB.

## SSR·SEO
- title "결제하기", 빈 desc/author, viewport, Cache-Control no-cache(동적). 인라인 style #price-summary/.bg-table-head. canonical/OG 없음.

## API 계약 (백엔드 전달)
### `GET /api/order/settle-init?settle_kind=&use_emoney=&emoney_chk=` (쿠키 세션)
- 응답: `{ settle_no_seq, items: OrderItem[], member_emoney, buyr_name_fallback, shop_user_id }`
- 백엔드: `getSettleNo`(시퀀스), getOrderItemList(선택), getMemberEmoney(dgkr), buyr_name 세션 fallback, 포인트 유효성. 항목0→프론트 cart redirect.
### `POST /api/order/full-discount` (0원 전액할인 — 파일럿)
- 요청: checkoutFrm 필드. 응답: redirect URL(order_end). 백엔드: order_full_discount.php(주문확정·키발급).
### `POST /api/order/kcp/reserve` (KCP 예약 — 파일럿)
- 요청: checkoutFrm 필드. 응답: `{ code: "0"|"1"|"NG"|"NG_POINT", res_cd?, res_msg?, use_pay_method? }`. 백엔드: kcp_reserve.php(예약·포인트검증·가상계좌 1분기).
### KCP 승인 `POST /order/kcp/kcp_api_pay.php`(order_info 폼 target) — **백엔드**(KCP 승인). webhook/naverpay_apply/toss_widget/payco_reserve 등은 각 후속·백엔드.

## 타겟 매핑
- 라우트: `app/(pc)/order/settle.html/page.tsx`(GET, `requireMemberSession` + searchParams + `getSettleInit` 쿠키포워딩 + 항목0 redirect + metadata "결제하기")
- screen: `screens/order-settle` — `order-settle-screen.tsx`(server: settle context 조립[query+init+매핑] + step nav·유의사항·checkoutFrm 요약·배송지·결제수단·가상계좌필드·가격요약·인라인style·footer_banner) + `settle-checkout.tsx`(client: btn_checkout 오케스트레이션[0원·kcp]·order_info 폼·KCP SDK/m_Completepayment·gtag)
- entities: `entities/order` `getSettleInit`(쿠키포워딩)·`postKcpReserve`·`postFullDiscount`(client)·`lib/settle-kind.ts`(매핑) 추가. OrderItem 재사용.
- **order.html 수정**: `OrderForm` 폼 `method` POST→GET(settle GET 전달). parity 이탈(개발자 승인).
- widgets: FooterBannerSection 재사용. KCP SDK `<Script>`(pg=kcp).
- mock: `settle-init` fixture + handlers(settle-init·kcp/reserve·full-discount).

### 구현 노트
- settle_kind 매핑(pg/pay_method/site_cd/escrow/label/prefix)은 `lib/settle-kind.ts`(deterministic, legacy client-visible 상수). settle_no=prefix+seq.
- toss/naverpay/payco: 페이지는 렌더하되 btn_checkout 오케스트레이션 **미배선**(후속). 파일럿은 kcp/0원만.
- KCP `KCP_Pay_Execute_Web`·order_info→kcp_api_pay.php·m_Completepayment는 **KCP merchant/백엔드 없이 기능 불가**(구조만 재현).
- **검증 한계**: 실제 결제 플로우는 백엔드 reserve/승인/webhook + PG 계정 없이 end-to-end 검증 불가. 본 단위 parity=구조(마크업·매핑·오케스트레이션 로직·SDK 로드) + MSW mock 흐름.

## Parity 체크리스트(구조)
- [ ] settle_kind→pg 매핑(8종)·settle_no prefix·DG0000 fallback
- [ ] 주문상품표(badge basic→info·플랫폼PNG·가격분기)·배송지(zipcode시)·결제수단 card·SC0040 가상계좌 필드(은행13/현금영수증)·포인트사용(조건)·가격요약(total_order/할인/total_price)
- [ ] order_info KCP 폼 필드·SDK 로드(pg별)·m_Completepayment
- [ ] btn_checkout: gtag·0원(full-discount)·kcp(reserve 4분기·가상계좌 confirm·KCP_Pay_Execute_Web)
- [ ] order→settle GET 전달·항목0 redirect·SEO title
- [ ] toss/naverpay/payco 후속 명시

## 보류/후속
- **toss/toss_bank·naverpay·payco 오케스트레이션**: 각 후속 단위(reserve→SDK/redirect/팝업).
- 백엔드: `getSettleNo`·`*_reserve`·`kcp_api_pay`·`webhook`·`order_full_discount`·`toss_widget`·`payco_return`·`naverpay_apply`.
- add_cart 상품페이지 wiring — 별도 단위.
