# 모바일 game_page (product_code → 상세 301 리다이렉트 리졸버)

## 원본 (legacy mobile)

- 파일: `mobile/game/game_page.html` (53줄). **UI 없음 — 순수 리다이렉트 헬퍼.**
- 로직:
  1. GET `product_code`. 빈값 → `echo "잘못된 접근입니다."; exit;` (HTML 셸 없이 텍스트만).
  2. `getGoodsItemDetail(product_code)` → `goods_item`(game_type, goods_sku), `getGoodsOptionTitleInfo(product_code)` → `title_info`(sku).
  3. game_type별 view_url:
     - game → `/game/game_view.html?product_id={title_sku}&sku={goods_sku}`
     - dlc → `/game/dlc_view.html?sku={goods_sku}`
     - music → `/game/dlc_view.html?sku={goods_sku}`
     - bundle → `/game/bundle_view.html?sku={goods_sku}`
     - accessories → `/game/goods_item_view.html?product_id={title_sku}&sku={goods_sku}`
  4. `header("HTTP/1.1 301 Moved Permanently"); header('Location: '.$view_url); exit;`
- PC 대응: **없음**(PC `(pc)/game/game_page.html` 미존재). 공유 resolve 계약도 없음 → 신규 도출.

## 데이터 / 계약 (신규 증분)

- **신규 계약** `GET /api/game/page-resolve?product_code=X` → `{ game_type, goods_sku, title_sku }`
  - legacy `getGoodsItemDetail(product_code)`(game_type/goods_sku) + `getGoodsOptionTitleInfo(product_code)`(title sku) 조합. 백엔드 전달.
  - 신규 엔티티 `entities/game-page` (`getGamePageResolve`, `GamePageResolve`).
- view_url 조립(game_type switch)은 프론트(route). MSW mock: `game/page-resolve` 핸들러+fixture(game 타입 예시).

## 타겟 매핑

- middleware MOBILE_ROUTES: `/game/game_page.html`
- 라우트: `app/m/game/game_page.html/page.tsx` (server)
  - `product_code` 빈값 → `잘못된 접근입니다.` 텍스트 렌더(legacy echo+exit 대응)
  - else → `getGamePageResolve` → game_type switch로 view_url → `permanentRedirect(view_url)`
- 재사용: 없음(신규 엔티티). 신규 UI: 없음(리다이렉트).

## ⚠️ Parity caveat (게이트)

- **301 vs 308**: legacy는 `301 Moved Permanently`. Next `permanentRedirect()`는 **308**(둘 다 영구 리다이렉트, 브라우저 동작 동일). Next는 301 직접 발급 API가 없어 308 사용(promotion_group 307↔302 선례와 동일 근사).
- **에러 텍스트 셸**: legacy는 HTML 셸 없이 "잘못된 접근입니다." 텍스트만 출력(exit). 타겟은 `/m/layout` 셸이 감싼다(경미한 이탈, 리다이렉트 성공 경로엔 영향 없음).
- **UA 스코프**: PC 대응 없음 → 모바일 UA만 `/m/game/game_page.html`로 rewrite. 데스크톱은 PC `/game/game_page.html` 부재로 별도(공유/PC 버전은 후속).

## Parity 체크리스트 (모바일 UA)

- [ ] product_code 빈값 → "잘못된 접근입니다."
- [ ] game/dlc/music/bundle/accessories별 view_url 정확 조립
- [ ] 영구 리다이렉트 동작(308≈301)
- [ ] middleware rewrite
