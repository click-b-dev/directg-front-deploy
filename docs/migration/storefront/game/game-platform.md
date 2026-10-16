# game_platform 플랫폼별 목록 (thumb/list/grid)

## 원본

- 파일: `pc/game/game_platform_{thumb,list,grid}.html`(라이브 — header GNB "플랫폼별" → `?platform=1|34|35`). `game_platform.html`(15KB)·`old_game_platform.html`은 GNB 미참조 죽은 파일 → 제외.
- 참조 문서: `docs/design-system/client.md`, `pc/assets/js/filter.js`
- 선례: `screens/game-category`(viewType + platform 아닌 category param, breadcrumb, filter/order 재사용), `screens/game-list`(동일 데이터 shape `GameListResponse`).

## 화면·플로우

- 진입 URL/파라미터: `/game/game_platform_{thumb,list,grid}.html` — `?platform=`(기본 1), `?page=`, 필터/`q`.
- **platform 기본값**: `if(!platform && !platform_1 && !platform_34 && !platform_35) platform=1` → platform 파라미터 없고 platform_N 체크박스도 없으면 `1`(Steam).
- **page_title = platform 코드 정적 switch** (DB 조회 없음): `1`→`Steam`, `34`→`Epic Games`, `35`→`Rockstar Games`, 그 외→미설정(빈 title). 프론트 매핑으로 재현.
- 목록 컨테이너(game_category 동일): thumb `#thumb_list` / list `#card_list>.row.g-3` / grid `#grid_list`.
- 세션/권한: 공개 SSR. 카드 wishlist/cart는 세션(m_no) 의존.

## 필터(game_filter) aside 매핑

`$aside['platform']="false"` + `product_type="game"` → **platform 블록 숨김**(genre 페이지가 genre 숨기듯), 상품유형/한국어/**장르**/가격은 표시. → `<GameFilter aside={{ productType: true, platform: false }} />`.

### platform 파라미터 라운드트립 (legacy 동작 대조 — game_category와 동형)

- **정렬 변경**: migrated `GameFilterOrder`는 searchParams 전체 보존 → platform 유지. (legacy `filter.js`는 platform 미보존이나, game_category에서 승인된 확립 패턴 = context 보존 우선. 동일 적용.)
- **검색(btn_filter) 제출**: legacy `goodsFilter()`는 `input[name=platform]:checked`(hidden 미매칭)라 platform 미보존 → 검색 시 platform 유실 → 라우트 default=1(Steam) 복귀. migrated GameFilter도 platform 블록 미렌더 → 제출 폼에 platform 없음 → 동일하게 default=1 복귀. **game_category의 category_code 처리와 동일 계열(승인됨)** — 공유 위젯 무수정.

## SSR·SEO (legacy)

- head: `<title>{platformName}</title>`(정적 매핑), description·author 빈, `amazonbot noarchive`, viewport `width=device-width, initial-scale=1.0` — 3뷰 동일.
- canonical/OG/구조화데이터: 없음(미추가). 페이지별 CSS: `card-list.css`. Splide 없음.
- SSR/CSR: 목록/카드/breadcrumb SSR. 필터/정렬/뷰전환만 client.

## breadcrumb

- legacy: `<a href='/game/game_{page_type}.html'>게임</a> > 플랫폼별 (` + page_title + `)` → `다이렉트 게임즈 > 게임(링크) > 플랫폼별 ({platformName})`.
- 타겟: `items={[{ label: "게임", href: `/game/game_${viewType}.html` }, { label: `플랫폼별 (${platformName})` }]}`.

## 데이터 (legacy)

- `Goods::getGoodsList2($page,$add_where,$orderby,$param,60,$q)`: platform 필터는 filter_include가 `platform` 파라미터로 조립. page_title은 별도 DB 없음(정적 switch).
- AJAX/POST: 없음.

## API 계약 (백엔드 전달)

- **기존 `GET /api/game/list` 재사용** — platform은 필터 파라미터일 뿐(전용 엔드포인트 불요, 서버 추가 데이터 없음). 요청: `page`, `platform`(기본 1), 그 외 필터/`q`. 응답 `GameListResponse { list, page, totalPages, total }`.
- 백엔드 책임: filter_include platform 조건 + 필터/정렬/페이징.

## 타겟 매핑

- 라우트: `app/game/game_platform_{thumb,list,grid}.html/page.tsx` (viewType, platform 기본 1, platformName 매핑).
- screen: `screens/game-platform` — viewType + platformName(title/breadcrumb) + filter(platform 숨김)/order(basePath `/game/game_platform`)/pagination.
- entities: `entities/game-list`(`getGameList` 재사용), `entities/product-thumb`(카드 3종), `widgets/game-filter`·`game-filter-order`·`breadcrumb` 재사용.
- mock: 기존 `GET /api/game/list` handler 재사용(추가 없음).

## Parity 체크리스트

- [ ] 목록 3뷰 + filter_order 뷰전환 active
- [ ] 필터: **platform 블록 숨김**, 상품유형/한국어/장르/가격 표시
- [ ] page_title/breadcrumb: 1→Steam, 34→Epic Games, 35→Rockstar Games
- [ ] platform 기본값 1(파라미터 없을 때)
- [ ] breadcrumb `게임(viewType 링크) > 플랫폼별 ({platformName})`
- [ ] pagination baseUrl `/game/game_platform_{viewType}.html`, platform param 유지
- [ ] SEO title=platformName·description/author 빈·amazonbot noarchive 3뷰 동일
