# 타임딜 상세 (timedeal_view)

## 원본
- 파일: `pc/game/timedeal_view.html` (501줄, 라이브). `ini_set('display_errors','1')`(디버그 on이나 공개 라이브).
- 선례: dlc_view(단일 옵션), `widgets/product-detail`(PlatformLogo).

## 화면·플로우
- 진입: `/game/timedeal_view.html?sku=`. 상태: is_view=="Y"?Y:N.
- 레이아웃: `d-grid gap-3` grid-template-columns **`auto 460px`**(812 아님). content-left mt-3.
- **미디어 없음**(media_change JS만 존재, #media 블록 없음). **위시리스트 없음**. **cart만**(아이콘폰트 `fa-bag-shopping`, `text-info rounded-0`, data-age). 로그인 게이트 없음. #btn_buy 핸들러 있으나 트리거 없음 → 미재현. 타이머: `$goods_product_chk['promotion_end']` 미정의 → no-op.

### content-left
1. 타임딜 카드: header(name + 플랫폼 로고 1/34/35) + footer(가격 + cart). 가격: timedeal_price>0이면 할인율 badge(bg-primary, `round((consumer-timedeal)*100/consumer)`), consumer 취소선(₩ `&#8361;`), timedeal_price(₩). 프로모션 종료일 바 없음. soldout → 품절(**bg-success**).
2. 상세설명(Parsedown, 토글 없음).
3. 시스템 요구사항(Parsedown, 토글 없음).
4. Copyright(legal_text).

### content-right
- title 카드: header img(**상대경로** `/upload/product/{product_code}/header/header.jpg`) + short_description(bg-body) + hr + 연령/등급(age_limit/game_rate, legacy `?t=time()` 캐시버스트는 생략) + hr + 정보 dl(출시일 / 개발사·퍼블리셔=**steam_info** / 한국어지원(spoken||interface, 빈 badge span 포함) / 장르·카테고리 `bg-secondary` badge getTagName).
- steam drm/ext 계정 alert.
- 상품 정보 제공 고시(6항목, **`$goods_dlc_info` 오타로 이용조건 링크 빈값**(href=""/label 빈) — 버그 재현). refund_policy.php.

## SSR·SEO
- title=product_name, description="", author=H2interactive. **canonical/alternate/amazonbot 없음**.
- OG: title, type=video.movie, **url=상대 `/game/game_view.html?product_id={title_info.sku}`**, **image=`/upload/product//header/header.jpg`**(legacy `$dlc_info` 미정의 → 빈 product_code 버그 재현), description=short_description, site_name.
- GA4·JSON-LD 없음. viewport.

## 데이터 (백엔드 책임)
- getGoodsItemDetailSku(sku)→timedeal_info, getTimedealSchedule(product_code)→{timedeal_price}, getGoodsOptionDescription→short_description/description/requirements/legal_text, getSteamAppInfo→developer/publisher/drm/ext, getTitleDetail→{sku}(OG url). getTagName 해소.

## API 계약
### `GET /api/game/timedeal-detail?sku={goods_sku}`
- 응답: `goods_status`, `goods_status_msg`, `timedeal_info`{product_code,product_name(_en),goods_sku,product_platform,soldout,consumer_price,age_limit,game_rate,spoken_korean,interface_korean,release_date}, `timedeal_schedule`{timedeal_price}, `title_info`{sku}, `steam_info`{developer,publisher,drm_notice,ext_user_account_notice}, `goods_description`{short_description}, `description_html`, `requirements_html`, `legal_html`, `genre_names`[], `category_names`[].

## 타겟 매핑
- 라우트: `app/(pc)/game/timedeal_view.html/page.tsx`. screen: `screens/game-timedeal`(+ `TimedealCart` client: 아이콘 cart 버튼 + cart 모달, 위시리스트 없음). entity: `entities/timedeal-detail`. mock: `timedealDetailFixture` + `/api/game/timedeal-detail`.

## Parity 체크리스트
- [ ] sku·is_view, grid auto/460, 타임딜 카드(할인율 계산·₩·품절 bg-success·cart만 게이트없음)
- [ ] 상세설명/시스템요구사항/Copyright(토글 없음)
- [ ] 우측 title(상대 img)·age/rating·정보dl(steam dev/pub·빈 한국어 badge)·steam alert·상품고시(빈 링크 버그)
- [ ] SEO title/desc빈/OG(상대 url·빈 product_code image)/canonical 없음/GA4 없음
