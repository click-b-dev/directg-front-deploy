# goods_category PS액세서리 카테고리별 (thumb/list/grid)

## 원본
- 파일: `pc/game/goods_category_{thumb,list,grid}.html`(라이브 — GNB "액세서리" 카테고리 `?category_code=P...`).
- 선례: `screens/game-category`(category+getTagName 동형), `screens/game-goods`(accessories 필터 축소).

## 화면·플로우
- 진입 URL: `/game/goods_category_{thumb,list,grid}.html?category_code=P0003001`(기본).
- aside: product_type=accessories, platform/genre/korean=false → 필터 상품유형/플랫폼/장르/한국어 숨김, 가격+top행만.
- page_title = `getTagName(category_code)`. sub_title = `<a href='/game/goods_list.html'>PS액세서리</a> > 카테고리별 (`, sub_title2 = `)`.
- product_type=accessories → `find_in_set(a.game_type,'accessories')` + category FULLTEXT(백엔드). getGoodsList2 with q.

## breadcrumb
- `다이렉트 게임즈 > PS액세서리 > 카테고리별 ({tagName})`. **"PS액세서리" 링크 = `/game/goods_list.html`**(하드코딩, viewType 무관 — game_category의 viewType 링크와 대비).

## SSR·SEO
- title={tagName} 동적, description/author 빈, amazonbot noarchive, viewport 동일. canonical/OG/구조화 없음. card-list.css.

## API 계약 (백엔드)
- **기존 `GET /api/game/category` 재사용** — `category_code`(기본 P0003001) + `product_type=accessories` 필터. 응답 `GameCategoryResponse`(list/page/totalPages/total/tagName).

## 타겟 매핑
- 라우트: `app/game/goods_category_{thumb,list,grid}.html/page.tsx`(viewType, category_code 기본 P0003001, product_type=accessories 주입).
- screen: `screens/goods-category` — viewType + filter(accessories 축소)/order(basePath `/game/goods_category`)/pagination + breadcrumb.
- entities: `entities/game-category`(`getGameCategoryList` 재사용). mock: 기존 `/api/game/category`(tagName 매핑에 P 코드 필요 시 fallback).

## Parity 체크리스트
- [ ] 필터: 상품유형/플랫폼/장르/한국어 숨김, 가격 표시
- [ ] breadcrumb `PS액세서리(→/game/goods_list.html) > 카테고리별 ({tagName})`
- [ ] category_code 기본 P0003001, 목록 3뷰, pagination baseUrl `/game/goods_category_{viewType}.html`
- [ ] title={tagName}, product_type=accessories 백엔드 필터
