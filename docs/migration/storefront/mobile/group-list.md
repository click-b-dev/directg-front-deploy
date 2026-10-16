# 모바일 그룹/번들 목록 group (thumb + list)

## 원본 (legacy mobile)

- 파일: `mobile/game/group_thumb.html`·`group_list.html`. 더보기: `group_*_ajax.php`. 카드: `thumb_inc.php`/`list_inc.php`. 필터: `game_filter.html`.
- PC 대응: `app/(pc)/game/group_thumb.html`·`group_list.html` → `screens/game-group`(getGameGroupList + access 가드 + 배너) — **계약/패턴 출처**.
- 데이터: `entities/game-group` `getGameGroupList(idx, page, filters)` + `GroupResponse`(access/subject/banner/bannerDomain/list...) **이미 존재**. mock `game/group` 존재.

## 화면·플로우 (legacy mobile 기준)

- 진입 URL: `/game/group_thumb.html?idx=N`·`/game/group_list.html?idx=N`.
- tbl_group 조회(idx + use_flag=Y): subject/banner/start_date/end_date/use_flag/banner_domain/banner_url.
- **접근판정**(백엔드): use_flag≠Y/미존재 → `access="invalid"`(alert "잘못된 접근입니다." + `/` redirect) / 기간 밖 & 비관리자 → `access="closed"`(alert "프로모션 기간이 아닙니다. 일정을 확인해 주시기 바랍니다." + `/` redirect). 관리자(sati@…/kch821012@…) 세션은 기간 밖이어도 ok.
- 배너: `banner_url` 우선, 없으면 `banner_domain+upload/banner/banner`. 있으면 `#publisher_info` 이미지 섹션(목록 위).
- title/pageTitle = `group_info.subject`.
- base where: thumb=`b.group_idx='idx'` / **list=`find_in_set(game_type,'game,dlc,music,bundle')` + group_idx**(list에만 game_type 제한 — legacy 내부 quirk). 데이터: `getGoodsGroupList(page, add_where, orderby, param, 60)`.
- aside: **미설정 → 필터 5블록 전부 노출**(promotion 포함).

## group_thumb vs group_list 차이
- page_type/include(thumb_inc vs list_inc) + list에만 base where `find_in_set(game_type,'game,dlc,music,bundle')` 추가.

## 데이터 / 재사용

- 재사용 엔티티: `entities/game-group` `getGameGroupList(idx, page, filters)` + `GroupResponse`. **증분 없음**. PC group 계약과 동일.
- 카드: thumb=`MobileThumbCard`, list=`MobileListCard` **재사용**.
- 접근 가드: **신규** `MobileGroupAccessGuard`(client, alert+`/` redirect — PC `GroupAccessGuard`와 메시지 동일, 모바일 네임스페이스). 두 screen 공유(thumb 공개 API로 재사용).
- 배너: `#publisher_info` 이미지(`${bannerDomain}upload/banner/${banner}`) — PC 선례. **banner_url 우선 처리는 백엔드 책임**(GroupResponse에 banner_url 미노출, PC 동일).

### base where game_type quirk (게이트 caveat)
legacy list는 group_idx에 더해 `find_in_set(game_type,'game,dlc,music,bundle')`를 걸어 thumb과 결과가 다를 수 있으나, 공유 계약(GroupResponse)엔 이 축이 없고 **PC(✅)도 두 뷰를 동일 호출**한다. PC 선례대로 두 뷰 동일 `getGameGroupList` 호출 — game_type 차이는 백엔드 quirk로 위임(게이트에서 명시).

## API 계약 (증분만)

증분 없음. `GET /api/game/group?idx=X&page=N&{필터}` (PC group 단위 계약 확정, access/subject/banner 백엔드 판정).

## 타겟 매핑

- middleware MOBILE_ROUTES: `/game/group_thumb.html`, `/game/group_list.html`
- 라우트: `app/m/game/group_thumb.html/page.tsx`·`group_list.html/page.tsx` — theme#000, `generateMetadata` title=subject 동적(getGameGroupList로 조회), idx/collectFilters
- screen:
  - `screens/mobile-group-thumb` `MobileGroupThumbScreen`: access≠ok→`MobileGroupAccessGuard` / ok→`MobileSubHeader(subject)` + `#appCapsuleSub.full-height` + `MobileGameFilter(aside={}, total, viewBasePath="/game/group", pageType="thumb")` + 배너(#publisher_info, banner 있을 때) + thumb items(#goods_thumb, MobileThumbCard, 더보기)
  - `screens/mobile-group-list` `MobileGroupListScreen`: 동일 + `pageType="list"` + list items(#goods_list, MobileListCard)
  - `MobileGroupAccessGuard`(mobile-group-thumb/ui, 공개 API export → list 재사용)
  - 각 `api/load-more-group-*.ts`: `getGameGroupList(idx, nextPage, filters)`
- 재사용: `game-group`, `product-thumb`, `promotion-ing`(ProductFilterParams), `mobile-sub-header`, `mobile-game-filter`
- 신규 UI: `MobileGroupAccessGuard`. mock: 기존 `game/group`.

## Parity 체크리스트 (모바일 UA)

- [ ] 접근판정 (invalid/closed alert+redirect, 관리자 ok)
- [ ] 배너(#publisher_info, banner 있을 때만)
- [ ] 헤더 title=subject 동적
- [ ] 필터 전체 블록(aside 미설정) / 뷰전환 list↔thumb=`/game/group_*`?idx 유지
- [ ] 카드(MobileThumbCard/MobileListCard) / 더보기 append + 마지막 alert
- [ ] head/viewport theme#000
- [ ] middleware rewrite/폴백
- caveat: group_list game_type base-where(백엔드), 필터 폼 제출 시 idx 미보존(공유 위젯 동작), 더보기 구형카드 divergence(game_list 승인 동일)
