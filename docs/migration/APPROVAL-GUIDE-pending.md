# 승인 대기(🟢 셀프검증) 8건 — 개발자 대조 가이드

세션 이전부터 🟢 셀프검증 상태로 남아 개발자 parity 대조·승인이 필요한 8건. 각 항목을 legacy와 대조 후 이상 없으면 MIGRATION-MAP에서 ✅로 갱신한다. (전부 `directg-client`. 실행: `pnpm dev:client` → 모바일 UA는 devtools 기기 에뮬레이션.)

> legacy 기준 원본은 `../legacy-project/pc/` (PC), `../legacy-project/mobile/` (모바일). 타겟 URL은 UA 감지 rewrite로 URL 불변.

---

## 1. PC 메인 — 배너·공지 (2-1)
- **legacy** `pc/index.php`(상단 배너군·공지) → **타겟** `/`(데스크톱 UA), `screens/home`
- 문서: `migration/storefront/main/main-banner-notice.md`
- 확인: 배너 슬라이드 마크업/링크/이미지/target · caption 분기(show_prod_info/show_sale_info) · 가격/할인/뱃지/출시일(number_format) · 배너 Splide(loop/autoWidth/autoplay4s/커스텀 arrow) · 공지 마크업/날짜(앞10자) · 공지 Splide(ttb 세로/wheel/height56/autoplay3s) · page/main.css·splide CDN · 엣지(배너0/공지0/순수이미지 배너)
- caveat: title/meta/추적코드·footer_banner·cart 모달·게임리스트 섹션은 별도 단위(2-2~2-4). 데이터=fixture SSR(백엔드 계약 확정).

## 2. 모바일 서빙 기반 (미들웨어+layout+자산)
- **legacy** `mobile/index.php` UA 분기 + `mobile/assets/*` → **타겟** `middleware.ts`·`app/(pc)/layout`·`app/m/layout`·`public/mobile-assets/`
- 문서: `migration/storefront/mobile/_foundation.md`
- 확인: 모바일 UA→`/m/*` rewrite(URL 불변) · 데스크톱 UA→PC 렌더 불변 · 브랜치별 `<head>` CSS 분리·html/body 속성 분기 · `/mobile-assets/*` 404 없음 · `pnpm build:client` 성공

## 3. 모바일 앱셸 (sub-header/bottom-nav/dialogs)
- **legacy** `mobile/inc/sub_header.html`·`sub_bottom_menu.html`·`dialog_cart.html` → **타겟** `widgets/mobile-sub-header`·`mobile-bottom-nav`·`mobile-dialogs`(+`app/m/layout` 배선)
- 문서: `migration/storefront/mobile/_foundation.md`
- 확인: sub-header(뒤로/검색토글/장바구니) · bottom-nav 세션 분기(로그인/비로그인) · dialog_cart 마크업 · `<ion-icon>` 렌더 · sidebar offcanvas·base.js는 후속(범위 밖)

## 4. 모바일 전체게임 목록 파일럿 (game_thumb)
- **legacy** `mobile/game/game_thumb.html` → **타겟** `/game/game_thumb.html`(모바일 UA), `screens/mobile-game-thumb`
- 문서: `migration/storefront/mobile/game-thumb.md`
- 확인: appHeader("모든게임"/검색/장바구니) · thumb 카드 badge 분기·가격/할인 · 60/page·release_date desc · 더보기 append+마지막 alert · bottom nav 세션분기 · title/viewport/manifest · view_url 링크 문자열 legacy 동일
- caveat: offcanvas 필터/상세 view/wishlist·cart는 후속(이후 이관 완료됨).

## 5. 모바일 할인진행중 thumb (promotion_ing_thumb)
- **legacy** `mobile/promotion/promotion_ing_thumb.html` → **타겟** `/promotion/promotion_ing_thumb.html`(모바일 UA), `screens/mobile-promotion-ing-thumb`
- 문서: `migration/storefront/mobile/promotion-ing-thumb.md`
- 확인: 화면요소·필드/검증·분기/플로우·head/viewport·더보기(AJAX 증분)·엣지·middleware rewrite/폴백
- 참고: 오프캔버스 필터는 6번(공용 위젯) 소관.

## 6. 모바일 오프캔버스 필터 (공용 위젯)
- **legacy** `mobile/inc/game_filter.html`+`footer_common.html`(필터 JS) → **타겟** `widgets/mobile-game-filter`
- 문서: `migration/storefront/mobile/game-filter.md`
- 확인: search_top(칩+옵션검색 버튼)+offcanvas 5블록(aside 노출 규칙) · 체크박스/라디오/가격 URL 초기값 반영 · 검색 submit→GET 1페이지 재조회 · reset/칩×/fade · 총N개+정렬 offcanvas(sort radio)+list/thumb 뷰전환 링크(현재 뷰 강조) · promotion_ing 프로모션 체크박스 숨김(aside.promotion=false) · thumb·list 양쪽 동일 동작

## 7. 모바일 홀로모델 DLC 상세 (holomodelsdlc_view)
- **legacy** `mobile/game/holomodelsdlc_view.html` → **타겟** `/game/holomodelsdlc_view.html`(모바일 UA), `screens/mobile-holomodelsdlc-view`
- 문서: `migration/storefront/mobile/holomodelsdlc-view.md`
- 확인: sku 진입·status N error-page · 헤더카드(header 이미지/nl2br short_description) · alert#1(확장 애니메이션)·alert#2(holomodels_view 링크·본체) · DLC 카드(product_name/영문명/할인가격/위시·장바구니 or 품절) · 연령/등급 아이콘 · 디지털 고시5·상세정보=출시일만·구성정보·상세설명(토글 없음)·다운로드 배지·권리표기(strip_tags) · number_format · head(title=product_name/canonical dlc_view quirk/theme#000) · middleware rewrite/데스크톱 폴백 · 위시/장바구니 마크업만(order 이월)

## 8. 모바일 마이페이지 주문 상세보기 (mypage_order_view)
- **legacy** `mobile/mypage/mypage_order_view.html?settle_no=` → **타겟** 동일(모바일 UA), `screens/mobile-mypage-order-view` · **PG 인접**
- 문서: `migration/storefront/mobile/mypage-order-view.md`
- 확인: 세션가드·MobileSubHeader("주문 내역 상세보기")·3섹션 · 상품카드 상태배지(발송오류/수령·대기/배송/취소요청/취소완료+일자) · 버튼분기(키확인/키활성화 delivery≠2/취소요청/배송조회) · 주문정보·결제정보(PG/수단/상태/일자/영수증 step=2) · 모달(licence/activate 99 alert·else reload/orderCancel 환불계좌 조건부→OK alert+reload) · 배송조회 외부폼 새 탭·preorder dead · head theme#000·하단네비·middleware rewrite/폴백
- caveat: 실 PG 승인/bill_url은 백엔드 의존(구조 parity·검증한계).

---

## 승인 처리
각 항목 대조 후 이상 없으면 MIGRATION-MAP 해당 행 `🟢 셀프검증` → `✅ 검증완료`로 갱신(또는 "N번 승인" 지시 시 반영). 반려 시 지적 항목 알려주면 수정 후 재검증.
