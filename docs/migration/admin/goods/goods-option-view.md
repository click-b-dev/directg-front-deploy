# 옵션상품 상세보기 (#34)

> 영역: 상품 > 옵션상품 관리 > 상세보기. 옵션 sub-nav "상세보기". 읽기전용 종합 화면 + 인라인 편집(배송아이템/구성정보). 스코프: 표시+편집 완전 이관.

## 원본
- 파일: `pc/_Admin_/goods/goods_option_view.php` (1541줄, 단일 라이브). 처리: `goods_option_ps.php` + `goods_ps.php`(package). 포함: `inc/sub_sidebar_option.php`(view active).
- 조회 메서드: `Admin`/`AdminGoods`/`Goods` (src/classes). 참조: [goods-option-modify](goods-option-modify.md).

## 화면 구성 (레이아웃 col-2 sub-nav + col-10)
좌측 col-8:
- **옵션상품 기본정보** 카드: product_code/goods_sku/product_name/product_name_en/model_code/model_name/product_platform(뱃지)/genre(getTagName 뱃지, genre 있을때)/category(뱃지, category 있을때)/release_date/option_type/game_type/delivery_type(뱃지: 1코드발송·2택배발송·3코드+택배)/[option_type≠retail일때 display_type]/한국어지원(spoken·interface·exclusive 뱃지)/is_view. footer "기본정보 설정" 버튼→modify.
- **대표상품 정보** 카드: title header 이미지 `/upload/title/{title_id}/header/{title_id}.jpg` + title_name/title_name_en/publisher(뱃지)/release_date(뱃지). (getTitleInfo via tbl_title_option 조인)
- **옵션상품 스크린샷** 카드: 대표이미지(screenshot[0].url) + 썸네일 목록(thumbnail). 썸네일 클릭 → 메인 img src 교체(순수 JS).
- **옵션상품 설명** 카드: Parsedown(description). is_package_view=="Y"면 tbl_goods_option_bundle 구성별 설명(unit_name + unit_code의 description) 조합.
- **옵션상품 시스템 요구사항** 카드: Parsedown(requirements).

우측 col-4:
- **이미지정보**: game_type≠bundle && bundle_type≠4 일때 → 이미지도메인(domain)/header.jpg/short_description.
- **판매정보**: 판매상태(getProductStatus 뱃지)/구매제한여부(purchase_limit_yn)/구매제한수량(purchase_limit)/품절여부(is_stock)/판매가능수량(item_stock).
- **가격정보**: consumer_price/price/discount(%).
- **공급처정보**: 공급처(getPublisherName(supplier_code))/product_srp/product_ppr/product_rs(%).
- **Steam 정보**: steam_appid/packageid/bundleid/퍼블리셔(빈칸)/개발사(빈칸).

하단 col-12:
- **배송아이템** 테이블: getGoodsItemDeliveryList(tbl_goods_item_delivery). 컬럼 연동시스템(getOrderSystem: 1Asset·2Ztorm·8Vaultn·9Genba·10PointNexus)/플랫폼/유형/ID/이름/배송상태(flag=="Y"?배송중:종료)/비고(flag=="Y"면 삭제버튼).
- **구성정보** 테이블: goods_package_item(tbl_goods_item_package, order item_type asc,appid asc). 컬럼 번호/appid(item_type 1게임·2DLC는 appid, 3패키지는 item_code)/app_type/app_name/app_price(steam getSteamAppPrice/100)/삭제버튼(package_srl). + steam json 미등록 후보(bundle_item/package_item, steam_sync/저장 버튼) — 단순화(주1). 헤더에 packageid/bundleid 표시 + 구성 동기화 버튼(steam python). footer 구성추가(appid/type/name → package_add).

**Dead 모달(트리거 미렌더)**: title/asset/ztorm/package/package-second 모달 마크업은 존재하나 이를 여는 버튼(`#btn_title_find`/`#btn_asset_find`/`#btn_ztorm_find`/`#btn_package_search`)이 뷰 본문에 렌더되지 않음 → legacy에서도 열 수 없는 정적 마크업. 마크업만 재현, 동작 불필요.

## 데이터 (legacy 조회)
- tbl_goods_item(기본+판매/가격/공급처/Steam/이미지 필드), tbl_goods_item_description(description/requirements/short_description).
- getProductScreenshotList: tbl_goods_item_screenshot(idx,screenshot_num,file_name,url,thumbnail,sort) order sort,screenshot_num.
- getTitleInfo(AdminGoods): tbl_goods a inner join tbl_title_option b on title_id where product_code → title_id/title_name/title_name_en/publisher/release_date/genre 등.
- getGoodsItemDeliveryList: tbl_goods_item_delivery order item_id.
- goods_package_item: tbl_goods_item_package order item_type asc,appid asc.
- genre/category: tbl_goods_item.genre/.category (콤마 코드) → getTagName(tbl_tags.tag_name).
- getProductStatus: 0판매중/1판매중지/3판매종료/9승인대기(색상 뱃지). getPublisherName: tbl_publisher.
- (steam json 파일 의존: getSteamPackageItem/getSteamBundleItem/steam appid json publisher·developer — mock 스텁, 주1)

## API 계약 (백엔드 전달)
- **`GET /admin/goods/options/:productCode/view`** — 통합 응답: `{ option(tbl_goods_item 전체), description{description,requirements,short_description}, screenshots[], title_info{title_id,title_name,title_name_en,publisher,release_date}, deliveries[{order_system,item_platform,item_id,item_type,item_name,flag}], package_items[{package_srl,appid,item_type,item_code,item_name,app_price}], genres[{code,name}], categories[{code,name}] }`. 없으면 404.
- **`DELETE /admin/goods/options/:productCode/deliveries`** — body{item_id,order_system}. DELETE tbl_goods_item_delivery.
- **`DELETE /admin/goods/options/packages/:packageSrl`** — setGoodsItemPackageDelete.
- **`POST /admin/goods/options/:productCode/packages`** — body{item_type,item_name,appid,item_code?}. INSERT tbl_goods_item_package. (legacy goods_ps.php package_add)
- **`DELETE /admin/goods/options/bundles/:bndlNo`** — setGoodsItemBundleDelete.
- **`GET /admin/goods/titles/search?q=`** — 대표상품 검색(title_id/title_name/title_name_en/publisher). (dead 모달용, 계약만)
- **`POST /admin/goods/options/:productCode/title`** — body{title_id,game_type,bundle_type}. setTitleAdd. (dead 모달용, 계약만)
- 외부 카탈로그(asset/ztorm/genba/vaultn/pointnexus search·add), steam python sync — 백엔드 책임. 뷰에서 트리거 미렌더(dead)라 프론트 구현 불요, 계약만 기록.

## 타겟 매핑
- 라우트: `routes/goods/goods_option_view.tsx`(search product_code) → `screens/goods-option-view`.
- 위젯: `widgets/option-sub-nav`(active="view").
- entities/goods-option: `GoodsOptionView` 통합 타입 + fetchOptionView/useOptionView + 편집 mutation(deleteDeliveryItem/deletePackage/addPackage/deleteBundle) 훅. genre/category 태그명은 응답에 포함(서버 getTagName 대응).
- mock: view 통합 응답 + delivery/package store + mutation. 시드(스크린샷·배송·구성·대표상품·설명).
- 시각: legacy 카드/테이블/뱃지 클래스 그대로. Parsedown → 마크다운 렌더(shared 마크다운→HTML). dead 모달 정적 마크업. product_viewer는 삭제/추가 버튼 숨김(legacy `if(!$product_viewer)`).

주1) Steam json 파일 기반 미등록 후보(bundle_item/package_item)와 app_price는 실서버 파일시스템/외부 API 의존. mock에서는 등록된 goods_package_item만 표시하고 미등록 후보 섹션은 빈 배열로 재현(동작 동일성: 데이터 없을 때와 같은 화면). log로 단순화 명시.

## Parity 체크리스트
- [ ] 좌8/우4 카드 구성·필드 일치, 뱃지 색상/라벨 일치
- [ ] 스크린샷 썸네일 클릭 메인 교체
- [ ] 배송아이템 테이블·flag별 삭제버튼, 삭제 동작
- [ ] 구성정보 테이블·패키지 삭제·구성추가
- [ ] dead 모달 마크업 존재(트리거 없음)
- [ ] product_viewer 편집버튼 숨김
