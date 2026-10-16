# 모바일 퍼블리셔별 목록 publisher_* (thumb + list, 15 브랜드)

## 원본 (legacy mobile)

- 파일: `mobile/game/publisher_<brand>_thumb.html`·`_list.html` (브랜드 15종 × 2뷰 = 30 페이지). 카드: `thumb_inc.php`/`list_inc.php`. 필터: `game_filter.html`.
- PC 대응: `app/(pc)/game/publisher_*_{thumb,list,grid}` — **factory `makePublisherPage({publisherCode, basePath, viewType})`** 패턴(`screens/game-publisher`). **계약/패턴 출처**.
- 데이터: `entities/game-publisher` `getGamePublisherList(publisher_code, page, filters)` + `GamePublisherResponse`(list/page/totalPages/total/publisherName) **이미 존재**. mock `game/publisher` 존재.

## 구조 (브랜드 불변, 코드만 다름)

각 브랜드 파일은 `$publisher_code`만 하드코딩하고 나머지는 동일:
- base where: `find_in_set(game_type,'game,dlc,music,bundle')` + `a.supplier_code='$publisher_code'`
- `page_title = getPublisher($publisher_code)` (백엔드 도출)
- `page_name="publisher_<brand>"`, page_type=thumb/list
- **aside 미설정 → 필터 5블록 전부 노출**
- 데이터: `getGoodsList2($page,$add_where,$orderby,$param,60)`

### 브랜드 → publisher_code 맵 (legacy 하드코딩)

| brand | code | brand | code | brand | code |
|-------|------|-------|------|-------|------|
| 2k | 12 | clouded_leopard | 132 | paradox | 30 |
| 505_games | 46 | focus | 22 | playstation | 162 |
| asw | 47 | gmode† | 372 | sega | 93 |
| capcom | 34 | hooded_horse | 277 | square_enix† | 36 |
| neowiz | 117 | marvelous† | 314 | thq | 23 |

† `gmode`·`marvelous`·`square_enix`는 **PC에 라우트 미이관(모바일 전용)** 이나, 공유 entity `getGamePublisherList`가 임의 publisher_code를 처리하므로 계약 재사용 성립. legacy 모바일에 라이브 파일 존재 → parity로 포함. (게이트에서 명시)

## 데이터 / 재사용

- 재사용 엔티티: `entities/game-publisher` `getGamePublisherList(publisherCode, page, filters)` + `GamePublisherResponse`. **증분 없음**(PC publisher 계약).
- 카드: thumb=`MobileThumbCard`, list=`MobileListCard`.
- 필터: `MobileGameFilter(aside={}, viewBasePath=basePath, pageType=viewType)` — 전체 블록.
- 더보기: `getGamePublisherList(publisherCode, nextPage, filters)`.

## API 계약 (증분만)

증분 없음. `GET /api/game/publisher?publisher_code=X&page=N&{필터}` (PC publisher 계약).

## 타겟 매핑

- **factory** `screens/mobile-game-publisher` `makeMobilePublisherPage({publisherCode, basePath, viewType})` (PC `makePublisherPage` 미러 — mobile viewport theme#000, title=publisherName 동적)
- 공용 screen `MobileGamePublisherScreen`(data, basePath, viewType): `MobileSubHeader(publisherName)` + `#appCapsuleSub.full-height` + `MobileGameFilter(aside={}, total, viewBasePath=basePath, pageType=viewType)` + items(#goods_thumb/#goods_list, MobileThumbCard/MobileListCard, 더보기)
- 라우트: `app/m/game/publisher_<brand>_thumb.html`·`_list.html` 30개 — 각 `makeMobilePublisherPage({publisherCode, basePath:"/game/publisher_<brand>", viewType})` 얇은 래퍼
- middleware MOBILE_ROUTES: 30 경로
- 재사용: `game-publisher`, `product-thumb`, `promotion-ing`(ProductFilterParams), `mobile-sub-header`, `mobile-game-filter`
- 신규 UI: 없음. mock: 기존 `game/publisher`.

## Parity 체크리스트 (모바일 UA)

- [ ] 브랜드별 title=publisherName 동적 / 필터 전체 블록 / thumb·list 카드 / 더보기
- [ ] publisher_code 브랜드별 정확 매핑(15종)
- [ ] 뷰전환 list↔thumb=`/game/publisher_<brand>_*`
- [ ] head/viewport theme#000
- [ ] middleware rewrite/폴백(30 경로)
- caveat: gmode/marvelous/square_enix PC 미이관(모바일 전용), 더보기 구형카드 divergence(game_list 승인 동일), base `publisher_<brand>.html`(무접미) 페이지는 후속, 위시/장바구니 마크업만
