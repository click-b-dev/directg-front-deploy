# 어드민 — 상품(Goods) 카탈로그

> 대상: `pc/_Admin_/goods/` 의 타이틀(대표상품)·옵션상품·그룹 영역.
> 재고(stock/asset)·외부연동(genba/vaultn/ztorm/pointnexus/grac/epic)은 별도 문서(다른 담당). 여기서는 "연계"로만 언급한다.
> 공통 인프라(세션·부트스트랩·레이아웃·페이지 유형 관례)는 어드민 공통 문서를 따르며 여기서 반복하지 않는다.

## 개요

directg 상품은 **2계층 구조**다.

- **대표상품(title / "타이틀")** — `tbl_goods`, PK `title_id`. 게임 "작품" 단위의 진열/SEO 상위 컨테이너. 스팀 appid·동영상·스크린샷·심의(GRAC)·태그·상세설명을 보유. 실제 판매·가격은 없다. 판매 가능한 옵션상품들을 진열 그룹(기본게임/에디션/DLC/번들/홀로모델…)으로 묶어 노출한다.
- **옵션상품(goods option / "옵션")** — `tbl_goods_item`, PK `product_code`(내부번호), 외부노출용 `goods_sku`(UUID4). 실제 **판매·가격·재고·배송(order_system)·특전·적립금** 단위. 하나의 title에 여러 옵션상품이 매달린다. 배송정보는 `tbl_goods_item_delivery`(order_system, item_id 등)로 분리.

### 핵심 코드값 (코드에서 확인)

- **`title_code`** (대표상품 종류): `33`=디지털 콘텐츠(게임) — 디지털상품 목록의 기준. `12`=실물/PS악세사리 계열 — 실물상품(accessories) 목록 기준. (그 외 값 존재 가능, 코드상 이 둘만 명시 확인.)
- **`game_type`** (옵션상품 종류, `getGoodsOptionGameType`): `game`=게임, `dlc`=DLC, `music`=사운드트랙, `bundle`=번들, `timedeal`=타임딜, `randombox`=랜덤박스, `accessories`=PS악세사리, `holomodels`/`holomodelsdlc`/`holomodelsedition`=홀로모델 계열.
- **`display_type`** (진열그룹): `basic`(기본게임), `edition`(에디션), `multi`(멀티팩), `dlc`, `game_bundle`/`dlc_bundle`/`etc_bundle`(번들 3종), `timedeal`, `holomodels`/`holomodelsdlc`/`holomodelsedition`.
- **`option_type`**: `digital`(디지털상품, 기본) / `retail`(실물상품).
- **옵션상품 `status`** (`getProductStatus`): `0`=판매중, `1`=판매중지, `3`=판매종료, `9`=승인대기.
- **대표상품 `sales_status`**: `C`(판매중 계열)/`S`/`E`(종료) — 목록 필터에서 사용. `is_view`(Y/N 노출여부), `coming_soon`(출시예정).
- 한국어 지원 플래그(옵션·타이틀 공통): `interface_korean`(인터페이스), `spoken_korean`(음성), `subtitle_korean`(자막), `exclusive_korean`(한국어 독점).
- 기타 옵션 플래그: `soldout`(품절 Y/N — **자동 품절 안 함**, 수동), `is_free`, `is_preorder`(예약구매), `is_bonus`(특전제공), `is_auth`(인증 필요), `is_naverpay_coupon`, `is_special`, `purchase_limit_yn`/`purchase_limit`(구매수량 제한).

### 도메인 클래스

- **`AdminGoods`** (`src/classes/AdminGoods.php`, ~1289줄, 83 메서드) — 옵션상품 목록/카운트/타이틀-옵션 관계 조회, 배송item 세팅, 이미지·스크린샷 정렬, 제공컨텐츠, 한글패치, 그룹, 플랫폼/game_type/display_type 라벨 변환 등. 상품 영역 핵심.
- **`Admin`** (`src/classes/Admin.php`) — 공통(getProductStatus, getOrderSystem, uuidgen4, setGoodsItemCode, setGoodsTitleId, 스팀정보, 미디어/스크린샷/GRAC 조회 등).
- **`Parsedown`** — 상세설명 마크다운 렌더.

### DB 접속 주의

대부분 메인 DB(`$conn`=directgames). **한글패치(`korean_patch_auth`)만 `$conn_dgkr`(dgkr DB)** 로 `AdminGoods`를 인스턴스화한다. 이관 시 데이터소스가 다르므로 주의.

---

## 메뉴 트리

`inc/sidebar_goods.php` 기준. `admin_level="1"`(상품뷰어, `$product_viewer=true`)과 일반운영자에게 **다른 메뉴 세트**가 렌더된다. 상품뷰어는 축소판(외부연동·Steam API·타임딜·랜덤박스 등 숨김), 일반운영자는 전체.

```
상품 대시보드                         goods/dashboard_goods.php
대표상품 관리
 ├ 디지털상품 목록                    goods/title_list.php            (title_code=33)
 ├ 실물상품 목록                      goods/accessories_list.php      (title_code=12)
 └ 심의정보 등록확인                  goods/title_grac_chk.php
대표상품 이미지 관리
 ├ Header 관리                        goods/title_image_header_chk.php
 ├ (미사용) Small capsule 관리        goods/title_image_small_capsule_chk.php   ※주석처리
 ├ Library capsule 관리               goods/title_image_library_capsule_chk.php
 └ Vertical capsule 관리              goods/title_image_vertical_capsule_chk.php
옵션상품 관리
 ├ 옵션상품 목록                      goods/goods_option_list.php
 ├ 실물상품 목록                      goods/goods_etc_list.php        (game_type=accessories)
 ├ 홀로모델 옵션상품                  goods/goods_holomodels_list.php
 ├ [X] Randombox 목록                 goods/goods_randombox_list.php  ※일반운영자만, 라벨상 비활성
 ├ [타임딜] 목록                      goods/goods_timedeal_list.php   ※일반운영자만
 └ 판매종료 옵션상품                  goods/goods_option_end.php      (status=3)
옵션상품 이미지 관리
 ├ Header 관리                        goods/goods_option_image_chk.php
 └ DLC 스크린샷 관리                  goods/goods_option_screenshot_chk.php
제공컨텐츠 관리
 ├ 제공컨텐츠 현황                    goods/supply_content.php
 ├ (미사용) 제공 컨텐츠 등록          goods/supply_content_register.php   ※주석처리
 ├ 회원별 제공 컨텐츠 조회            goods/supply_content_member.php
 └ 제공컨텐츠 다운로드 현황           goods/supply_content_download.php   ※일반운영자만
한글패치 관리
 ├ 한글패치 현황                      goods/korean_patch.php          ※일반운영자만
 └ 한글패치 인증정보 확인            goods/korean_patch_auth.php
심의정보 관리
 └ 심의정보 현황                      goods/grac/grac_list.php        (연계: grac — 별도 담당)
TAG 관리                              tag/*                            (별도 영역)
코드 관리                             code/*                           (플랫폼/공급처/배송방법 — 별도 영역)
그룹 관리
 └ 그룹 현황                          goods/group/group_list.php

(일반운영자 전용 추가) Steam API / Ztorm / Genba / Vaultn / PointNexus API  → 외부연동 별도 담당
```

**대표상품 서브탭** (`inc/sub_sidebar_title.php`, title_view 진입 후 좌측): 상세보기→기본정보 설정(title_modify)→상품정보 제공고시(title_attribute_set_register)→[title_code=33일 때만] 심의정보(title_grac_register)→태그(title_tag_register)→동영상(title_media_register)→스크린샷(title_screenshot_register)→이미지(title_image_register)→상세설명(title_description_register)→상세설명 v2(title_description_register_v2)→관련상품(title_option_register).

**옵션상품 서브탭** (`inc/sub_sidebar_option.php`): 상세보기(goods_option_view)→기본정보(goods_option_modify)→장르(goods_option_genre_register)→카테고리(goods_option_category_register)→이미지(goods_option_image_register)→[game_type=dlc/accessories일 때만] 스크린샷(goods_option_screenshot_register)→판매 설정(goods_option_sales_register)→상세설명(goods_option_description_register)→상세설명 v2(goods_option_description_register_v2)→구성정보(goods_option_package_register)→태그(goods_option_tag_register)→적립금(goods_option_repay_register).

---

## 페이지별 정의

### 상품 대시보드 — `goods/dashboard_goods.php`
- **유형**: 대시보드(집계 뷰).
- **기능**: 상품 운영 이상징후 요약. 3블록 — (1) 재고 알림: `판매중&품절`(status=0,soldout=Y), `Asset 재고 있는데 품절 처리됨`(품절해제 후보, order_system='1', stock>0, status<>3). (2) 등록 품질 점검: `판매중인데 판매가 미설정`(is_free<>Y & price 없음), `판매중 디지털인데 order_system 미설정`. (3) 프로모션/일정: 진행예정/진행중/종료예정(7일내) 카운트, `프로모션 중인데 판매중 아님` 경고, 예약구매(is_preorder=Y) 임박순.
- **정책·규칙**: "자동 품절 안 함" 명시(수동 정책). 각 목록 상위 12~15건만 노출, 초과분은 카운트만. 재고 카드는 Asset 기준.
- **데이터 소스**: 직접 SQL(`tbl_goods_item`, `tbl_goods_item_delivery`, `tbl_promotion_schedule`). `Admin`(getOrderSystem, getProductStatus), `AdminGoods`(getGoodsOptionGameType).
- **연계**: `goods_link()`, `asset_link()`, `stock_check_link()` 헬퍼로 옵션상세·Asset·재고체크로 이동. 재고 대시보드(`goods/stock/dashboard_stock.php` — 별도 담당) 링크.
- **참조**: STOCK-MANAGEMENT.md, PROMOTION-EVENT-OPS.md.

### 대표상품(디지털) 목록/상세/등록/수정 — `title_list.php`, `title_view.php`, `title_register.php`, `title_modify.php`, `title_ps.php`
- **유형**: 목록 / 상세 / 폼(등록) / 폼(수정) / 처리(ps).
- **기능**:
  - `title_list.php` — `title_code='33'` 디지털 대표상품 목록. 검색: 상품명(국/영)/title_id/sku/publisher/developer, sales_status, is_view, age_limit, 한국어 4종(interface/spoken/exclusive/subtitle). 페이징.
  - `title_view.php` — 대표상품 상세. `tbl_goods` + 동영상(getGoodsMediaList)·게임정보(getGoodsDescription)·스크린샷(getTitleScreenshotList)·GRAC(getGameGrac, rateno 기반)·스팀정보(getSteamAppInfo/getSteamReviewInfo, steam_appid 기반). 좌측 서브탭 진입점.
  - `title_register.php` — 신규 등록. `setGoodsTitleId()`로 title_id 채번, `uuidgen4()`로 sku. `product_code` 파라미터 주어지면 옵션상품에서 값(이름/appid/release_date/개발사/퍼블리셔) 프리필. 기본값 is_view=N, sales_status=C, coming_soon=Y, title_code=33.
  - `title_modify.php` — 기본정보 수정 폼.
- **정책·규칙**: 목록은 항상 `title_code='33'` 고정. 대표상품 자체는 판매/가격 없음. 심의정보(GRAC) 탭은 `title_code=='33'`에서만 노출.
- **데이터 소스**: `tbl_goods`, `Admin`.
- **폼 필드**: title_name/title_name_en, sku, age_limit, is_view, sales_status, release_date, developer, publisher, steam_appid, game_rate, rateno/orgname/domain(심의), coming_soon/coming_soon_date, 한국어 4종, title_code.
- **처리(`title_ps.php`, ~68KB, 최대 핸들러)** — mode 스위치 다수:
  - 기본: `register`, `modify`, `attribute_set`(상품정보 제공고시), `attribute_set2`(거래조건 정보), `make_sku`.
  - 관련상품(진열) 검색/추가/삭제: `option_game_*`, `option_edition_*`, `option_dlc_*`, `option_bundle_*`, `option_etc_*`, `option_holomodels_*`, `option_holomodelsdlc_*`, `option_holomodelsedition_*`. (검색 시 옵션상품 status 0/1/3/9 라벨 분기.)
  - 상세설명 저장: `short_description_save`, `description_save`~`description_save4`, `description_save_v2`, `requirements_save`, `legal_text_save`, `region_msg_save`.
  - 동영상: `add_youtube`/`delete_youtube`. 옵션/DLC 인라인: `addOption`/`deleteOption`/`addDLC`/`deleteDLC`.
  - 구성/번들/패키지: `bundle_info`, `package_info`, `package_item_list`, `package_item_search`, `package_add`(→`setGoodsOptionPackage`), `special_info`.
  - 프랜차이즈: `franchise_search`/`franchise_save`(→`setTitleFranchise`).
  - 이미지 업로드: `header_upload`(460x215), `capsule_upload`(616x353), `library_upload`(600x900), `hero_capsule_upload`/`hero_capsule_chk`.
  - 심의/장르/카테고리/출시: `grac_save`, `genre_save`, `category_save`, `release_save`.
  - 스크린샷: `screenshot_upload`, `screenshot_sort_up`/`down`(→`setScreenshotSort`).
- **연계**: 서브탭 전체(아래 대표상품 서브탭 참조), 옵션상품(관련상품 진열), grac/steam.

### 대표상품(실물) 목록 — `accessories_list.php`
- **유형**: 목록.
- **기능**: `sales_status<>'E' and title_code='12'` 실물(PS악세사리 등) 대표상품 목록. 검색축은 title_list와 유사(+rateno/orgname). 드롭다운에서 태그정보 설정 등으로 이동 시 `title_code=12` 전달.
- **정책**: title_code로 디지털/실물 분기. `title_view`는 공용.
- **데이터 소스**: `tbl_goods`.

### 대표상품 서브탭 페이지들 (title_id 기준, 처리는 대부분 `title_ps.php`)
- `title_modify.php` — 기본정보 설정 폼.
- `title_attribute_set_register.php` — 상품정보 제공고시(전자상거래 고시) 설정.
- `title_grac_register.php` / `title_grac_chk.php` — 심의(GRAC) 설정 / 등록확인. (grac 시스템은 별도 담당, 여기선 title 연결부만.)
- `title_tag_register.php`(+`title_tag_ps.php`, `title_tag_chk.php`) — 태그정보 설정. `title_tag_ps.php`는 태그 add/delete만 처리.
- `title_media_register.php` / `title_video_chk.php` — 동영상(YouTube) 설정 / 점검.
- `title_screenshot_register.php` / `title_screenshot_chk.php` — 스크린샷 설정 / 점검.
- `title_image_register.php` / `title_image_chk.php` — 이미지 설정(header/capsule/library) / 점검.
- `title_description_register.php` / `title_description_register_v2.php` — 상세설명(마크다운/스마트에디터) 설정 v1/v2.
- `title_option_register.php` — **관련상품(진열) 설정**. title에 매달린 옵션상품을 진열 그룹별(기본게임/에디션/DLC/번들/기타/홀로모델/홀로DLC/홀로에디션)로 조회·정렬. 조회 메서드: `getTitleGameList`, `getTitleEditionList`, `getTitleDLCList`, `getTitleEtcList`, `getTitleHolomodelsList` 등. 추가/삭제/검색은 `title_ps.php`의 `option_*` mode.
- `title_category_chk.php` / `title_genre_chk.php` — 대표상품 카테고리/장르 관리(점검).
- `title_related.php` — 연관상품(코드상 서브탭에서 주석처리, 미사용 추정).

### 대표상품 이미지 관리(일괄 점검) — `title_image_header_chk.php`, `title_image_library_capsule_chk.php`, `title_image_vertical_capsule_chk.php`, `title_image_small_capsule_chk.php`
- **유형**: 목록/점검(chk).
- **기능**: 대표상품별 이미지(Header/Library capsule/Vertical capsule) 등록 여부를 일괄 조회·업로드하는 운영 점검 화면. small capsule은 (미사용) 표기.
- **데이터 소스**: `AdminGoods::getGoodsImageChkList` 및 스팀 이미지 체크(`setSteamImageChk`).

### 옵션상품 목록 — `goods_option_list.php`
- **유형**: 목록(42KB, 검색축 대량).
- **기능**: 기본 `status<>'3'`(판매종료 제외), `game_type in('game','dlc','music','bundle')`. 검색: 상품명(국/영)/product_code/goods_sku, product_platform, status, game_type, display_type, supplier_code, is_special/is_view/is_bonus/is_auth/soldout/is_preorder/is_naverpay_coupon, 한국어 4종, 장르(fulltext `match...against`).
- **정책**: game_type 미지정 시 game/dlc/music/bundle만. 한국어 필터는 N일 때 `is null` 포함.
- **데이터 소스**: `tbl_goods_item`, `AdminGoods::getGoodsOptionList`.
- **연계**: 각 행 → goods_option_view 및 서브탭.

### 옵션상품 유형별 목록 — `goods_game_list.php`, `goods_dlc_list.php`, `goods_music_list.php`, `goods_bundle_list.php`, `goods_holomodels_list.php`, `goods_etc_list.php`, `goods_item_list.php`, `goods_bonus_list.php`, `goods_option_end.php`, `goods_timedeal_list.php`, `goods_randombox_list.php`
- **유형**: 목록(각 game_type/display_type 필터 프리셋).
- **기능**:
  - `goods_game_list`([Game]), `goods_dlc_list`([DLC]), `goods_music_list`([Music]), `goods_bundle_list`([Bundle]) — game_type별 전용 목록.
  - `goods_holomodels_list` — 홀로모델 옵션상품.
  - `goods_etc_list` — 실물상품 목록(`status<>'3' and game_type='accessories'`). is_free/is_special/soldout 등 추가 필터.
  - `goods_item_list` — (page_title 없음) 옵션상품 아이템 범용 목록 추정.
  - `goods_bonus_list` — 특전제공 상품 관리("특전제공 상품 관리").
  - `goods_option_end` — 판매종료 옵션상품(`status='3' and display_type<>'timedeal' and game_type<>'randombox'`).
  - `goods_timedeal_list` — [타임딜] 목록. `goods_randombox_list` — Randombox 목록(사이드바에 `[X]` 표기 = 비활성/폐기 추정, page_title 없음).
- **데이터 소스**: `tbl_goods_item`.
- **참조**: STOCK-MANAGEMENT.md(품절/재고), PROMOTION-EVENT-OPS.md(타임딜/랜덤박스).

### 옵션상품 상세/기본정보/등록 — `goods_option_view.php`, `goods_option_modify.php`, `goods_option_register.php`, `goods_option_ps.php`
- **유형**: 상세 / 폼(수정) / 폼(등록) / 처리(ps, 47.8KB — 옵션 전반 핸들러).
- **기능**:
  - `goods_option_view.php`(57KB, 최대 뷰) — 옵션상품 종합 상세. 기본정보+판매+배송(delivery item)+특전+구성+가격+이미지 요약. 좌측 옵션 서브탭 진입점.
  - `goods_option_modify.php` — 기본정보 폼. product_code 있으면 modify, 없으면 register. game_sku 없으면 uuidgen4. option_type(digital/retail), game_type, display_type(진열그룹), bundle_type, 한국어 4종, is_free, is_special, publisher_code, age_limit, game_rate(문자열 각 자리 1/0 = 심의등급 다중 플래그), model_code/model_name.
  - `goods_option_register.php` — 신규 등록 폼. `setGoodsItemCode()`로 product_code 채번.
- **처리(`goods_option_ps.php`)** — mode:
  - `register`(game_type별 후속처리 분기: game/dlc/music/bundle/randombox/accessories/timedeal/holomodels…), `modify`, `make_sku`.
  - **판매 설정 `sales_config`**: is_view, status, soldout, purchase_limit(_yn), start_date/end_date, release_date/delivery_date, delivery_type, is_bonus/is_preorder/is_naverpay_coupon/is_auth 를 `tbl_goods_item` 업데이트. (status=3이면 판매종료 처리 분기.)
  - **가격/공급처**: `price_save`, `supplier_save`, `preorder_config`(예약구매), `timedeal_config`(타임딜), `repay_config`/`add_repay_config`(적립금).
  - **배송(delivery item) 검색/추가/삭제**: `asset_search`/`asset_add`, `ztorm_search`/`ztorm_add`, `genba_search`/`genba_add`, `vaultn_search`/`vaultn_add`, `pointnexus_search`/`pointnexus_add`, `delivery_item_delete`. 공통 세터 `setGoodsOptionDeliveryItem(product_code, platform, id, name, publisher, order_system, type)`. (외부연동·재고는 별도 담당 — **연계만**.)
  - **특전(bonus)**: `special_search`(기본게임/DLC/스탠드얼론/번들/특전 유형별), `bonus_search`, `bonus_config`, `bonus_delete`, `bonus_description_save`.
  - **구성(package/bundle)**: `package_list`/`package_delete`/`package_view_config`, `bundle_list`/`bundle_delete`, `goods_option_search`/`goods_option_unit_add`/`goods_option_unit_delete`.
  - **title 연결**: `title_search`/`title_add`(→`setTitleAdd`, 옵션을 대표상품에 매달기).
  - 상세설명: `description_save`/`description_save2`/`short_description_save`/`region_msg_save`/`requirements_save`/`legal_text_save` (→`setGoodsItemDescription`).
  - 이미지/스크린샷: `header_upload`(460x215), `capsule_upload`(231x87), `diskn_upload_chk`, `screenshot_upload`, `screenshot_sort_up`/`down`.
- **정책·규칙**: game_type=dlc/accessories일 때만 스크린샷 탭 노출. 배송아이템 source가 asset/ztorm/genba/vaultn/pointnexus로 다양(옵션 하나에 배송채널 연결).
- **데이터 소스**: `tbl_goods_item`(+`tbl_goods_item_delivery`, 특전/구성/적립금 테이블). `AdminGoods`, `Admin`.
- **참조**: ORDER-WORKFLOW-AUDIT.md, PAYMENT-APPROVAL.md(order_system), STOCK-MANAGEMENT.md.

### 옵션상품 서브탭 등록 페이지들 (product_code 기준, 처리는 대부분 `goods_option_ps.php`, 일부 전용 ps)
- `goods_option_sales_register.php`(55KB) — 판매 설정(sales_config).
- `goods_option_price_register.php` / `goods_option_bonus_register.php` — 가격 설정(price_save). (bonus_register page_title도 "옵션상품 가격 설정"으로 되어있어 실제 용도 확인 필요, 추정: 특전가격.)
- `goods_option_genre_register.php`(+`goods_option_genre_ps.php`) — 장르 설정.
- `goods_option_category_register.php`(+`goods_option_category_ps.php`) — 카테고리 설정.
- `goods_option_image_register.php` / `goods_option_image.php` / `goods_option_image_chk.php` — 이미지 설정 / 일괄점검.
- `goods_option_screenshot_register.php` / `goods_option_screenshot_chk.php` — DLC 스크린샷 설정 / 점검.
- `goods_option_description_register.php` / `_v2.php` / `goods_option_description_chk.php` — 상세설명 v1/v2 / 점검.
- `goods_option_package_register.php` / `goods_package_image.php` — 구성정보(패키지) 설정 / 패키지 이미지.
- `goods_option_tag_register.php`(+`goods_option_tag_ps.php`) — 태그 설정.
- `goods_option_repay_register.php` — 적립금(포인트) 설정(repay_config).
- `goods_option_delivery.php` — **빈 파일(0B)**. 미사용.
- `goods_package_item_sync.php` / `goods_sync.php` — 패키지 구성/상품 동기화 처리(화면 없음, AJAX/배치성).
- `bonus_list.php`/`bonus_register.php`/`bonus_view.php`/`bonus_ps.php` — 특전(bonus) 마스터 CRUD(특전정보 관리/등록/상세/처리). `goods_option_bonus_register`는 옵션에 특전을 연결하는 쪽.
- `timedeal_register.php` — 타임딜 설정 폼(옵션상품 타임딜).

### 제공컨텐츠 관리 — `supply_content.php`, `supply_content_member.php`, `supply_content_download.php`, `supply_content_register.php`
- **유형**: 목록/조회.
- **기능**: 제공컨텐츠(사은/추가 지급 콘텐츠) 현황(`getSupplyContentList` + 상품별 `getSupplyContentGoodsList`), 회원별 조회, 다운로드 현황. `supply_content_register`는 사이드바 주석처리(미사용).
- **데이터 소스**: `AdminGoods`(getSupplyContentList 등).

### 한글패치 관리 — `korean_patch.php`, `korean_patch_auth.php`, `korean_patch_download.php`
- **유형**: 목록/조회.
- **기능**: 한글패치 현황, 인증정보 확인(패치 goods 선택 → prefix/encode_type 기반 인증), 다운로드 현황.
- **데이터 소스**: `korean_patch_auth.php`는 **`$conn_dgkr`(dgkr DB)** 로 `AdminGoods::getKoreanPatchList` 호출. 나머지 확인 필요.
- **정책**: DB 분리 주의(위 "DB 접속 주의" 참조).

### 그룹 관리 — `group/group_list.php`, `group/group_register.php`, `group/group_view.php`, `group/group_ps.php`
- **유형**: 목록 / 폼(등록) / 상세 / 처리(ps).
- **기능**: 상품 진열/프로모션 **그룹(`tbl_group`)** CRUD. 그룹 `type`: `1`=프로모션, `2`=타임딜, `3`=프랜차이즈, `99`=기타. 배너(이미지 업로드→`/upload/banner/`), 노출기간(start_date/end_date, strtotime 저장), use_flag, sort, banner_domain(diskn=`https://image.directg.net/` / dgkr=`/`), banner_url/pc_banner_url.
- **처리(`group/group_ps.php`)**: `register`(파일 업로드+INSERT), 그 외 modify/delete 추정. `ini_set('max_input_vars', 9000)` — 대량 필드 처리.
- **데이터 소스**: `tbl_group`, `AdminGoods::getGroupList`.
- **참조**: PROMOTION-EVENT-OPS.md.

---

## 변형/실험 파일

- 담당 범위(goods/ 루트 + group/)에서 `yjs_*`, `kdy_*`, 날짜접미(`_YYYYMMDD`), `tmp`, `test`, `_bak/_old/copy` 패턴 파일은 **발견되지 않음**.
- 다만 다음은 사이드바에서 비활성/미사용으로 표기되어 실사용 여부 불명확:
  - `goods_option_delivery.php` — **0B 빈 파일**.
  - `goods_randombox_list.php` — 사이드바 라벨 `[X] Randombox 목록`(비활성 추정), page_title 없음.
  - `title_image_small_capsule_chk.php` — 사이드바에 "(미사용)"로 주석처리.
  - `supply_content_register.php` — 사이드바 주석처리.
  - `title_related.php` — 서브탭에서 주석처리.
  - `_v2` 상세설명 페이지들(title/option `description_register_v2`)은 v1과 병존 — 라이브 여부(둘 다 노출) 확인 필요.

---

## 마이그레이션 유의점

1. **상품뷰어 권한(`admin_level="1"`)**: `sidebar_goods.php`가 상품뷰어와 일반운영자에게 **완전히 다른 메뉴 트리**를 렌더한다(상품뷰어는 외부연동/Steam/타임딜/랜덤박스 숨김, 로고 링크 없음). 권한은 **메뉴 숨김 방식**이라 서버 차단이 거의 없음 → Next.js에서는 라우트 가드/네비게이션 필터로 동일 노출 스코프를 재현하되, 서버측 접근제어는 legacy와 동일하게(사실상 없음) 두어야 동작 동일성 유지. 의도적으로 서버 차단을 추가하면 회귀.
2. **2계층 모델(title ↔ option)**: `tbl_goods`(title_id) ↔ `tbl_goods_item`(product_code) ↔ `tbl_goods_item_delivery`. title은 판매/가격이 없고, 옵션이 판매단위. 진열은 title_option_register의 display_type 그룹으로 구성. 엔티티 설계 시 이 분리를 그대로 반영.
3. **코드값 다수 상수화 필요**: title_code(33/12), game_type 9종, display_type 13종, status(0/1/3/9), sales_status(C/S/E), 한국어 4플래그, soldout/is_free/is_preorder 등. `getProductStatus`·`getGoodsOptionGameType`·`getGoodsOptionDisplayType`의 라벨 매핑을 그대로 이식.
4. **거대 ps 핸들러(mode 스위치)**: `title_ps.php`(~90 mode), `goods_option_ps.php`(~80 mode), `goods_ps.php`가 한 파일에서 CRUD·검색·업로드·상세설명·구성·특전을 모두 처리. Next.js에서는 mode별 API 라우트/서버액션으로 분해하되 **입력 검증·기본값·분기 결과가 legacy와 동일**해야 함(예: sales_config의 status=3 특수처리, 한국어 필터 N일 때 is null 포함).
5. **외부연동 배송채널 결합**: 옵션상품의 배송아이템이 asset/ztorm/genba/vaultn/pointnexus 5개 소스와 `setGoodsOptionDeliveryItem` 공통 세터로 연결됨. 이 연동부는 별도 담당이지만, 옵션 등록/판매 플로우가 여기에 강하게 의존하므로 이관 순서상 배송/재고 문서와 계약을 맞춰야 함.
6. **DB 분리**: 한글패치 인증(`korean_patch_auth`)은 dgkr DB(`$conn_dgkr`). 대부분은 메인 DB. 데이터소스 매핑 시 혼동 주의.
7. **이미지 업로드 규격 고정**: header(title 460x215, option 460x215), capsule(title 616x353, option 231x87), library(600x900) 등 사이즈별 처리 분기 존재. 파일 저장 경로(`/upload/banner/`, `image.directg.net`)와 도메인 스위치(diskn/dgkr) 그대로 재현.
8. **SQL 인젝션(원본 이슈)**: 목록 검색 where가 파라미터 바인딩 없이 문자열 결합(`like '%".$search_value."%'`)됨. legacy 버그지만 **임의 수정은 범위 밖** — 이관 시 동작은 유지하되 파라미터화는 보안상 별도 협의 대상.
