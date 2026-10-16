# 모바일 주문완료 (order_end)

order 도메인 4번째 모바일 단위. settle 결제완료 후 redirect되는 결과 표시 화면(폼/뮤테이션 없음). PC `order-end` 이미 이관 → `entities/order` 재사용(증분 0).

## 원본 (legacy mobile)
- 파일: `mobile/order/order_end.html`(162줄, 라이브)
- PC 대응 단위: `docs/migration/storefront/order/order-end.md` (재사용 출처)

## 화면·플로우 (legacy mobile 기준)
- 진입 URL: `/order/order_end.html?settle_no=&wait=`. settle 결제완료 redirect. 로그인 필수(login_check).
- `wait>0` → `sleep(10)`(DB 전파 대기, **백엔드/no-op**, 프론트 미재현).
- 데이터: `getOrder(settle_no)`(order_info) + `getOrderItem(settle_no)`(항목, gtag용) + pg=kcp면 `getKcpLog(settle_no)`(가상계좌 payment_log).
- 화면 요소 / 마크업 조각:
  - 헤더: `sub_header.html` → `MobileSubHeader("주문완료")`.
  - `#appCapsuleSub.full-height > .section.full.px-3.pt-2 > .card > .card-body`:
    - `h4` "주문이 정상적으로 완료되었습니다."(text-dark-50 text-center fw-bold fs-4)
    - 결제번호(settle_no) / 결제수단(`payment_method_label[payment_method]`)
    - **SC0040(가상계좌)**: 결제금액(payment_log.amount 원) / 입금자(va_name) / 입금계좌정보(bank_name / account) / 예금주(depositor) / 입금마감시기(va_date `YYYY-MM-DD HH:MM:SS` substr 파싱 — **PC는 HH:MM, 모바일은 초까지**)
    - **그 외**: 결제금액(total_price 원) / 결제일자(reg_date → 계약 `payment_date`)
    - `주문내역 확인하기` 버튼 → `/mypage/mypage_order_view.html?settle_no=`(mdi-home 아이콘)
  - gtag `purchase`(transaction_id=settle_no, value=total_price, items goods_sku/product_name/price/quantity 1)
- payment_method_label(프론트 static, PC 동일): SC0010 신용카드·SC0030 계좌이체·SC0040 가상계좌·SC0060 휴대폰·PAYCO 페이코·POINT 네이버포인트·toss_bank 퀵계좌이체(토스)·DG0000 전액할인·toss_pay 토스페이머니.
- **PC와 차이(모바일 단순화)**: step nav·주문정보표(상품 목록)·결제정보표(상태/총액 상세)·쇼핑 계속하기 버튼 **없음**. 단일 카드에 결제번호/수단/금액/일자(또는 SC0040 입금안내)만.

## 폼 필드/검증
- 없음(표시 전용). 인터랙션은 gtag purchase(1회)뿐.

## 분기/리다이렉트
- 비로그인 → login. SC0040 여부로 결제금액/일자 vs 가상계좌 입금안내 분기.

## 세션/권한 의존
- `$_SESSION['member']` 로그인. `requireMemberSession()` 가드. 주문 조회 settle_no 기준(회원 소유 검증 백엔드).

## 모바일 head / 앱셸
- viewport: theme#000, scale 고정. metadata: title "주문완료", description/keywords 빈값.
- head `popover` style은 **dead**(모바일 order_end엔 popover 없음) → 미이식(렌더 무효).
- 앱셸: `MobileSubHeader("주문완료")` / bottom-nav·sidebar 전역(하단바 표시).

## 데이터
- 재사용 엔티티: `entities/order` `getOrderComplete`(order_info/items/payment_log) + `OrderComplete`/`OrderInfo`/`OrderCompleteItem`/`PaymentLog` 타입. **증분 0**.
- 모바일 사용 필드(subset): order_info(settle_no/payment_method/total_price/payment_date) + payment_log(amount/va_name/bank_name/account/depositor/va_date, SC0040) + items(goods_sku/product_name/price, gtag). (checkout_status/step/use_emoney·item 표시필드는 모바일 미사용.)

## API 계약 (증분만, 백엔드 전달)
- **증분 없음**. `GET /api/order/complete?settle_no=`는 PC order-end 단위 계약 완료(`docs/migration/storefront/order/order-end.md`). mock `orderCompleteFixture` + handler 재사용.

## 타겟 매핑
- middleware `MOBILE_ROUTES` 추가 경로: `/order/order_end.html`
- 라우트: `app/m/order/order_end.html/page.tsx`(server, `requireMemberSession` + searchParams settle_no + `getOrderComplete` + viewport theme#000 / metadata "주문완료")
- screen: `screens/mobile-order-end` — `mobile-order-end-screen.tsx`(**server** 표시: `MobileSubHeader` + `#appCapsuleSub.full-height` + 완료 카드 + SC0040 분기 + `MobilePurchaseGtag`) + `purchase-gtag.tsx`(**client**, gtag purchase 1회)
- 재사용: `entities/order`(getOrderComplete) · `MobileSubHeader` · mock
- 신규 UI: 없음
- mock: 재사용(`orderCompleteFixture`)

## Parity 체크리스트 (모바일 UA)
- [ ] MobileSubHeader("주문완료") · appCapsuleSub full-height
- [ ] 완료 카드: 헤드라인·결제번호·결제수단(label 매핑)
- [ ] SC0040: 결제금액/입금자/입금계좌/예금주/입금마감시기(초까지) 분기
- [ ] 그 외: 결제금액/결제일자
- [ ] 주문내역 확인하기 → mypage_order_view.html?settle_no=
- [ ] gtag purchase(1회, settle_no/total_price/items)
- [ ] 모바일 head/viewport(theme#000) · title "주문완료"
- [ ] middleware rewrite / 하단바 표시

## 보류/후속
- `order_fail`(주문실패) — 다음 order 단위.
- `wait` sleep·회원소유 검증은 백엔드(프론트 미재현).
- 실제 진입(settle 결제완료 redirect)은 백엔드 승인 완료 후.
