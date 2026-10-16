# 마이페이지 메인 (대시보드)

> mypage 도메인 2번째 단위. 세션 인프라(`requireMemberSession`)·`widgets/mypage-aside` 재사용. 데이터 대시보드.

## 원본
- 파일: `pc/mypage/mypage_main.html` (라이브), 가드 `login_check.php`
- 도메인: `Order`, `Mypage2` (m_no 기준 집계/목록)
- 선행: `mypage/member-level-info.md`(세션/가드/aside 인프라)

## 화면·플로우
- 진입 URL: `/mypage/mypage_main.html` (GET, **로그인 필요**)
- 레이아웃: `container my-3 pb-5 > main.d-grid(240px auto)` + aside_mypage(**active 없음** — mypage_main은 `$aside_menu` 미설정) + `section#content.content.rounded-0`. main 뒤 `footer_banner`(기획 고정 배너2)
- 콘텐츠:
  1. **환영+통계 카드**(`widget-inline`): 헤더 "{name} 님 환영합니다." + 6칸(회원등급/보유포인트/총주문건수/총주문금액/총취소건수/총취소금액). 앞 2칸 border 없음, 뒤 4칸 `border-start`. 첫 칸 `col-offset-2 col-sm-2`(legacy 오타 그대로), 나머지 `col-sm-2`. 금액에 `<span class="won">` (앞 공백)
  2. **최근 주문완료 내역(1개월)** 표: 주문일자(주문번호)/상품정보/주문금액/진행상태/비고. 상품정보=delivery_type 뱃지(1 코드발송/2 택배발송/3 코드+택배발송)+상품명. 진행상태=코드(is_actv 1 구매확정/그외 수령대기) 또는 배송상태(shipment). 비고=상세보기(mypage_order_view?settle_no). 빈: "주문완료 내역이 없습니다." 전체보기→mypage_order
  3. **최근 취소완료 내역(1개월)** 표: 취소일자/주문번호/상품명/취소금액/비고(mypage_cancel_view?settle_no). 빈: "취소완료 내역이 없습니다." 전체보기→mypage_cancel_end
  4. **최근 포인트 내역(1개월)** 표: 날짜/적립·사용(emoney_type +적립/-사용)/사유(memo)/포인트. 빈: "적립금 내역이 없습니다." 전체보기→mypage_point
- 회원등급 map: 1=일반, 2=정회원, 3=VIP (세션 mem_level). 이름/등급은 세션에서
- 숫자: number_format(천단위 콤마) — [[directsend-balance-number-format]] 선호와 일치

## SSR·SEO (legacy)
- `<title>마이페이지</title>`, viewport `width=device-width, initial-scale=1.0`, description·author 빈값, canonical/OG 없음
- 렌더: 정적 SSR(데이터는 SSR fetch). 인터랙션 없음 → 서버 컴포넌트

## 데이터/계약 (백엔드 전달)
### `GET /api/mypage/dashboard`
- 쿠키 세션 → m_no. 최근 1개월(now-1month ~ now) 기준.
- 응답:
  ```
  {
    member_emoney: number,            // 보유 포인트
    order_info: { cc: number, ss: number },   // 총 주문 건수/금액 (status 2)
    cancel_info: { cc: number, ss: number },  // 총 취소 건수/금액 (status 9)
    order_list: [{ order_date, ordno, delivery_type: "1"|"2"|"3", product_name, price, is_actv: "1"|..., shipment_status_label?, settle_no }],
    cancel_list: [{ cancel_date, ordno, product_name, price, settle_no }],
    point_list: [{ regdt, emoney_type: "+"|"-", memo, amt_delta }]
  }
  ```
- 백엔드: `getMemberEmoney`, `getOrderItemCount(m_no, '2'|'9')`, `getOrderListMain(m_no, '2'|'9', start, end)`, `getPointListMain`, 배송상태는 `getOrderShipment`+`getShipmentStatus` 라벨(delivery_type≠1). 주문상태 badge(getOrderStatus)는 legacy 주석 → 제외

## 타겟 매핑
- 라우트: `app/mypage/mypage_main.html/page.tsx` (서버 — `requireMemberSession()`로 가드+세션(name/level), dashboard fetch)
- screen: `screens/mypage-main` (서버, props: member name/level + dashboard)
- entities: `entities/mypage-dashboard` `getMypageDashboard`(server, 쿠키 전달)
- widget: `widgets/mypage-aside`(active optional화), `widgets/footer-banner-section`(재사용)
- mock: `GET /api/mypage/dashboard` + fixture(샘플 주문/취소/포인트 + 통계)

## Parity 체크리스트
- [ ] 가드(미로그인 redirect) / 로그인 시 렌더
- [ ] 환영 카드 6통계·border·오타 클래스·회원등급 map·천단위 콤마
- [ ] 3개 표 컬럼·뱃지·상세보기·빈 목록 문구·전체보기 링크
- [ ] footer_banner(기획 배너2)
- [ ] SEO(title/viewport) 일치
