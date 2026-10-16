# 카테고리별 목록 thumb (game/game-category-thumb)

> game 도메인 첫 목록 화면. promotion_ing_thumb와 **거의 동일 구조**(game_filter + game_filter_order + drawThumb). 차이: category_code 필터 + getTagName 동적 title, is_promotion 없음.

## 원본
- 파일: `pc/game/game_category_thumb.html` (**라이브** — `pc/inc/header.html:171` GNB "카테고리별" 드롭다운 → `?category_code=C0001001`(싱글플레이어) 등)
- **DB**: 리뉴얼 DB(`$dsn`) + `Goods::getGoodsList2`(상품 목록) + `Goods::getTagName`(카테고리명) + `Draw::drawThumb`(카드)
- 세션: 공개(비로그인 열람). wishlist_chk만 세션.
- 선례: `screens/promotion-ing`(동일 구조·필터/정렬/카드), `entities/product-thumb`(ProductThumbCard), `widgets/game-filter`·`game-filter-order`, `card-list.css`
- 참조: `docs/design-system/client.md`, `docs/migration/storefront/common/game-filter.md`

## promotion_ing_thumb 대비 차이
| 항목 | promotion_ing_thumb | game_category_thumb |
| --- | --- | --- |
| page_name | promotion_ing | game_category |
| is_promotion | "Y" 하드코딩 | **없음(전체 상품)** |
| category_code | 없음 | **GET, 기본 C0001001** |
| page_title | "할인진행중"(정적) | **getTagName(category_code)**(동적) |
| aside promotion | "false"(체크박스 숨김) | 미설정 → **프로모션 체크박스 표시** |
| 뷰전환 base | /promotion/promotion_ing | /game/game_category |

동일: 레이아웃(container>main>game_filter>content>game_filter_order>#thumb_list>pagination), 60/page, 카드(drawThumb→ProductThumbCard), filter_include(category_code는 category_where FULLTEXT), cart(후속).

## 화면·플로우
- 진입 URL: `/game/game_category_thumb.html?category_code=C0001001` (기본 C0001001). `?page=N&{필터}`.
- category_code → `getTagName` → page_title(카테고리명). filter_include가 category_code를 `MATCH(a.category) AGAINST` 조건에 추가(해당 카테고리 상품만).
- 나머지: promotion_ing_thumb 동일(필터/정렬/카드/페이지네이션).
- 후속: cart 모달, breadcrumb(sub_title "게임 > 카테고리별 ({tag})"), list/grid 뷰(game_category_list/grid).

## SSR·SEO (legacy)
- head: `<title>{getTagName(category_code)}</title>`(동적), `description=""`, `author=""`, `amazonbot noarchive`. favicon. canonical/OG 없음.
- viewport: `width=device-width, initial-scale=1.0`. `data-bs-theme="dark"`.
- CSS: card-list.css(#thumb_list, screen `<link>`) + 필터 CSS(directg/styleguide layout 전역).

## 데이터 (legacy)
- `Goods::getTagName(category_code)`: `SELECT tag_name FROM tbl_tags WHERE tag_code=:category_code` → 카테고리명(title).
- `Goods::getGoodsList2(page, add_where, orderby, param, 60, q)`: filter_include 생성 where(category_code FULLTEXT + 필터) → product_code[] → `getProductInfo` → ProductThumb 카드. **is_promotion 조건 없음**(전체 상품, category 필터).

## API 계약 (백엔드 전달)
- `GET /api/game/category?category_code=X&page=N&{필터}` (optional 세션 쿠키) → `{ list: ProductThumb[]; page; totalPages; total; tagName }`
  - `tagName`: getTagName(category_code) 카테고리명(page_title).
  - 백엔드: getGoodsList2 + `category_code`(filter_include category_where FULLTEXT MATCH), 60/page. **is_promotion 미적용**. 필터 파라미터는 game-filter와 동일(verbatim).
- 응답 타입: `entities/game-category/model/types.ts`(ProductThumb 재사용 + tagName).

## 타겟 매핑
- 라우트: `app/game/game_category_thumb.html/page.tsx` → `/game/game_category_thumb.html` (public, `getGameCategoryList(categoryCode, page, filters)`, **generateMetadata title=tagName**(category_code별 동적, notice-view 선례), category_code 기본 C0001001)
- screen: `screens/game-category/ui/game-category-screen.tsx` (server) — card-list.css + `GameFilter aside={{productType:true}}`(프로모션 표시) + content + `GameFilterOrder basePath="/game/game_category"` + #thumb_list(ProductThumbCard) + ServerPagination(category_code param 유지).
- widget: `GameFilterOrder` **basePath prop 일반화**(promotion 전용 `/promotion/` 하드코딩 제거 → `${basePath}_${type}.html`). promotion screen도 `basePath="/promotion/promotion_ing"`로 업데이트.
- entities: `entities/game-category` 신규 (`getGameCategoryList` server + 타입, ProductThumb 재사용)
- mock: `shared/mocks/fixtures/game-category.ts`(ProductThumb[] + tagName) + handler `GET */api/game/category`

## Parity 체크리스트
- [ ] 필터(프로모션 체크박스 표시)/정렬/카드(ProductThumbCard)/페이지네이션 (promotion 구조 재사용)
- [ ] category_code 기본 C0001001 + getTagName title(동적) + is_promotion 없음(전체)
- [ ] 뷰전환 링크 /game/game_category_{type}.html (basePath) + category_code param 유지
- [ ] SEO(title=tagName 동적/description·author 빈/amazonbot noarchive/viewport)
- [ ] 후속 명시: cart·breadcrumb·list/grid 뷰
