# 모바일 할인진행중 목록 (promotion_ing_thumb)

## 원본 (legacy mobile)
- 파일: `mobile/promotion/promotion_ing_thumb.html` + `mobile/promotion/promotion_ing_thumb_ajax.php` + `mobile/game/thumb_inc.php`.
- 라이브 판별: `sub_bottom_menu.html`의 "할인진행중" 링크가 `/promotion/promotion_ing_thumb.html`로 진입한다.
- PC 대응 단위: `docs/migration/storefront/promotion/promotion-ing-thumb.md`, `promotion-ing-list-grid.md`, `common/game-filter.md`.

## 화면·플로우 (legacy mobile 기준)
- 진입 URL/파라미터: `/promotion/promotion_ing_thumb.html`; `page` 기본 1. 필터/정렬 GET 파라미터는 수집하지만 `$is_promotion = "Y"`로 고정한다.
- 화면 요소 / 마크업 조각:
  - `sub_header.html`: `pageTitle` = "진행중인 프로모션", 뒤로가기, 검색 토글, 장바구니 링크.
  - `#appCapsuleSub.full-height` 안에 `game_filter.html`(offcanvas 필터), `.section.full`, `.wide-block`, `#goods_thumb`, `#btn_paging`.
  - `thumb_inc.php`: 모바일 thumb 카드(`.card.thumb-card.card-shadow.border-0.rounded-0`), 상품명, 헤더 이미지, game_type/display_type badge, 할인율, 정가 취소선, 판매가.
  - `sub_bottom_menu.html`, `sidebar.html`, `dialog_cart.html`은 모바일 앱셸 공통.
- 폼 필드/검증: 화면 내 제출 폼 없음. 더보기 버튼은 `data-page`/`data-total` 기준.
- 분기/리다이렉트: 없음. 더보기 마지막 페이지에서 `alert("마지막페이지입니다")`.
- 세션/권한 의존: 공개. 세션 쿠키는 `wishlist_chk` 계산에 쓰이나 모바일 thumb 카드에는 표시되지 않는다.

## 모바일 head / 앱셸
- viewport / theme-color / apple-web-app 메타: `width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, viewport-fit=cover`, `theme-color=#000000`, `apple-mobile-web-app-capable=yes`, status bar `black-translucent`.
- title: `진행중인 프로모션`; description/keywords 빈값.
- 사용 앱셸: `MobileSubHeader(pageTitle="진행중인 프로모션")`, bottom-nav/dialogs는 `app/m/layout.tsx` 공통.
- 페이지별 mobile-assets CSS: 전역 `style.css`, `dg_style.css`, `styleguide.css` 사용. 추가 CSS 없음.

## 데이터
- 재사용 엔티티: `entities/promotion-ing` `getPromotionIngList(page, filters)` / `PromotionIngResponse`, `entities/product-thumb` `ProductThumb`와 `MobileThumbCard`.
- 모바일 전용 동작(증분/AJAX): `promotion_ing_thumb_ajax.php`는 현재 `data-page`를 받아 서버에서 `+1` 후 `getGoodsList2(..., 60)` 결과의 `thumb_inc.php` HTML만 반환한다.

## API 계약 (증분만, 백엔드 전달)
- 신규 계약 없음.
- 재사용: `GET /api/promotion/ing?page=N&{필터}`. legacy mobile의 `promotion_ing_thumb_ajax.php`는 동일 목록 API를 다음 page로 호출하는 서버 액션으로 대체한다(HTML 조각 대신 JSON + React 렌더).

## 타겟 매핑
- middleware MOBILE_ROUTES 추가 경로: `/promotion/promotion_ing_thumb.html`.
- 라우트: `app/m/promotion/promotion_ing_thumb.html/page.tsx`.
- screen: `screens/mobile-promotion-ing-thumb`.
- 재사용 entities: `entities/promotion-ing`, `entities/product-thumb`.
- 신규 UI: `MobilePromotionIngThumbList`(client), `loadMorePromotionIng`(server action).
- mock: 기존 `promotion/ing` MSW handler 재사용.

## 범위 제외
- `game_filter.html` offcanvas 필터 UI와 `offcanvas_sort.html` 정렬 UI는 모바일 공통 필터 단위로 후속 이관한다.
- 장바구니/위시리스트 mutation은 order 도메인 후속 범위다.

## Parity 체크리스트 (모바일 UA)
- [ ] 화면 요소 일치
- [ ] 필드/검증 일치
- [ ] 분기/플로우 일치
- [ ] 모바일 head/viewport 일치
- [ ] 증분/AJAX 동작 일치
- [ ] 엣지케이스 일치
- [ ] middleware rewrite/폴백 동작 확인
