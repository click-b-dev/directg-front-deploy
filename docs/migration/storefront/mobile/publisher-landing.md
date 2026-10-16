# 모바일 퍼블리셔 랜딩 publisher_<brand>(무접미, 8종)

## 원본 (legacy mobile)

- 파일: `mobile/game/publisher_<brand>.html`(무접미) — **8종**: 2k·capcom·gmode·marvelous·neowiz·paradox·playstation·sega. (505_games·asw·clouded_leopard·focus·hooded_horse·square_enix·thq는 무접미 랜딩 없음 — _thumb/_list만.) PC 대응 없음(_thumb/_list/_grid만).
- 더보기: `game_publisher_ajax.php`(POST {page,publisher_code,sort}).
- fetcher: `getPublisherGoodsSearch(page,add_where,orderby,param,is_bonus)` — supplier_code + preorder/bonus 기간 + genre/platform/category MATCH + sort.

## 구조 (브랜드 불변, config만 다름)

- `$publisher_code` 하드코딩 + `$page_title` 하드코딩(getPublisher 아님) + **배너**(외부링크+이미지 하드코딩).
- base where: `find_in_set(game_type,'game,dlc,music,bundle')` + `supplier_code`.
- 필터: is_preorder(preorder_start/end 기간), is_bonus(bonus 기간), genre(match), platform, category(match, comma+).
- sort: release/pricedown/priceup(+discount 기본). default → release desc(sort="discount" 내부).
- 배너 `#publisher_info`: `<a target=_blank href={link}><img src={image} alt={alt} class="w-100 rounded-0"></a>`.
- 총: N 개 + sort select + `#goods_list`(search 카드) + 더보기.

### 브랜드 config

| brand | code | title | banner alt |
|-------|------|-------|-----------|
| 2k | 12 | 2K | 2K |
| capcom | 34 | CAPCOM | CAPCOM |
| gmode | 372 | G-MODE | **2K**(legacy alt 오타) |
| marvelous | 314 | Marvelous | Marvelous |
| neowiz | 117 | NEOWIZ | **2K**(legacy alt 오타) |
| paradox | 30 | Paradox Interactive | Paradox Interactive |
| playstation | 162 | PlayStation Publishing LLC | PlayStation Publishing LLC |
| sega | 93 | SEGA | SEGA |

## 데이터 / 재사용

- **신규 엔티티** `entities/game-publisher-landing` — `getPublisherLanding(publisherCode, page, filters, sort)` + `PublisherLandingResponse`(list/page/totalPages/total, ProductThumb). **신규 계약 `GET /api/game/publisher-landing`** + mock(gameListFixture).
- 카드: `MobileGameSearchCard` **재사용**(game_search 카드와 동일 legacy 마크업 — `@screens/mobile-game-search` 공개 API export).
- sort select onChange → `{basePath}.html?sort={val}`(sort만 유지 quirk). 더보기 → `loadMorePublisherLanding(publisherCode, nextPage, sort)`(publisher_code·sort만, 다른필터 드롭 quirk).

## 타겟 매핑

- **factory** `screens/mobile-publisher-landing` `makePublisherLandingPage(brandKey)` + `lib/brands.ts`(PUBLISHER_BRANDS config) + 공용 `MobilePublisherLandingScreen`(배너 + 총N + sort + items) + `MobilePublisherLandingItems`(search 카드 + 더보기) + `MobilePublisherLandingSort`.
- 라우트: `app/m/game/publisher_<brand>.html/page.tsx` 8개 얇은 래퍼.
- middleware +8 경로.
- 재사용: `product-thumb`, `mobile-sub-header`, `mobile-game-search`(카드). 신규: entity/mock/factory.

## Parity 체크리스트 (모바일 UA)

- [ ] 브랜드별 배너(링크/이미지/alt 오타 포함)·title
- [ ] 총 N 개 + sort select(sort만 리셋 quirk)
- [ ] search 카드 목록 + 더보기(publisher_code·sort만 quirk)
- [ ] head theme#000
- [ ] middleware rewrite(8경로)
- caveat: offcanvas 필터 dead 미이식, gmode/neowiz alt="2K" 오타 verbatim, PC 대응 없어 모바일 UA만, 무접미 랜딩 없는 7브랜드는 범위 밖
