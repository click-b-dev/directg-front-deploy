# 액세서리/실물 상품 상세 (goods_item_view)

## 원본
- 파일: `pc/game/goods_item_view.html` (826줄, 라이브 — PS액세서리 목록(`goods_*`)·리다이렉트(game_view 특수 product_id) 진입). 선례: game_view/dlc_view, `widgets/product-detail`.

## 화면·플로우
- 진입: `/game/goods_item_view.html?product_id={title_sku}&sku={goods_sku}`.
- 상태: option_item.is_view=="Y" → Y (아니면 공개는 N; 사무실 IP는 Y — **공개 동작 = is_view만** 재현).
- 레이아웃 812/460. **cart/wishlist 게이트 없음**. 미디어 video 정상 스왑(오타 없음).

### content-left
1. 미디어(youtube + 스크린샷).
2. 옵션 상품 카드(가로형: `col-3` 이미지 + `col-9` 정보): 프로모션 종료일(sale_price>0) 또는 `&nbsp;`, 할인율(promotion.discount_rate>0→bg-danger font-14, else discount>0→bg-primary **font-12**), 소비자가 취소선(me-2), 판매가, wishlist/cart(게이트 없음).
3. 배송 안내 alert(4 ※ 고정 문구).
4. 상품설명(`#description_html`, overflow-auto, **토글 없음**): is_package_view면 구성상품 설명 조립, 아니면 옵션 설명 Parsedown — **백엔드가 description_html 렌더**.
5. 거래조건에 관한 정보 표(대부분 고정 + `attribute_info.delivery_method_info`·`as_information2`).
6. 교환/반품 정보 표(전부 고정).

### content-right
1. 관련상품 게임정보(`show_game_info` = delivery_type=="3" && steam_appid>0): steam JSON 해소(game_name, release_date(+1일 "Y년 m월 d일"), developer/publisher(implode), genres[].description, categories[].description) + 한국어지원(title_info) + 연령/등급(title_info age_limit/game_rate). **백엔드가 steam_game_info 조립**.
2. 상품 정보 제공 고시(`attribute_info`: 품명/모델명/KC(+rra 링크)/정격전압/소비전력/출시년월/제조자/제조국/크기/무게/주요사양/품질보증/AS).

## SSR·SEO
- title=title_name, description="", author=H2interactive.
- **canonical/alternate/amazonbot 없음**.
- OG: title, type=video.movie, **url=`http://directg.net/game/game_view.html?title_id={title_id}`**(http·game_view·title_id — 원본값), image=title header, description=""(원본 `$goods_description` 미정의), site_name="다이렉트게임즈".
- GA4 view_item: **items:null**(원본 `$ga4` 미정의 — 그대로 재현). JSON-LD 주석(미출력). viewport.

## 데이터 (백엔드 책임)
- getTitleInfoSku(product_id) / getGoodsMediaList / getGoodsItemDetailSku(sku) / getGoodsItemScreenshotList / getAttributeInfo(title_id) / getGoodsOptionDescription / getGoodsItemDeliveryList(연령체크) / steam JSON(apps_{appid}[_coming].json). is_package_view SQL(tbl_goods_option_bundle) 조립.

## API 계약
### `GET /api/game/goods-item-detail?product_id={title_sku}&sku={goods_sku}`
- 세션 쿠키. 응답: `goods_status`, `goods_status_msg`, `option_item`{...promotion,delivery_type,steam_appid,wishlist_chk}, `title_info`{title_id,title_name,age_limit,game_rate,spoken_korean,interface_korean}, `media_list`, `attribute_info`{15필드}, `description_html`, `show_game_info`("Y"/"N"), `steam_game_info`{game_name,release_date,developer,publisher,genres[],categories[]}|null.

## 타겟 매핑
- 라우트: `app/(pc)/game/goods_item_view.html/page.tsx`(GA4 Script). screen: `screens/game-goods-item`. entity: `entities/goods-item-detail`. mock: `goodsItemDetailFixture` + `/api/game/goods-item-detail`.

## Parity 체크리스트
- [ ] product_id+sku 진입·is_view 분기
- [ ] 미디어·옵션카드(가로형,게이트없음)·배송안내·상품설명·거래조건표·교환반품표
- [ ] 우측 관련게임정보(steam, delivery_type3)·연령등급·상품고시(attribute 15항목)
- [ ] SEO title/desc빈/OG(video.movie,url title_id)/GA4 items:null/canonical 없음
