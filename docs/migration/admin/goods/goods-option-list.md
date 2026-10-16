# 옵션상품 목록 (#32)

> 영역: 상품 > 옵션상품 관리 > 옵션상품 목록. 좌측 사이드바 "옵션상품 목록". 옵션상품 등록/상세/수정의 실제 진입점.

## 원본
- 파일: `pc/_Admin_/goods/goods_option_list.php` (899줄). 도메인: `Admin::getGoodsOptionList`(page/where/order/param, 20/page, `links_html`=Pagination.php), getSupplierList/getProductStatus/getTagName/getGoodsItemDeliveryList, `AdminGoods::getGoodsOptionGameType/getGoodsOptionDisplayType/getPlatformName/getPublisherName`.
- 참조: [title-list](title-list.md)(ServerPagination), [goods-option-register](goods-option-register.md).

## 화면·플로우
- 진입: `/_Admin_/goods/goods_option_list.php` → 타겟 `/goods/goods_option_list`. breadcrumb 홈/상품/옵션상품 관리/옵션상품 목록.
- **검색 필터 카드**(native GET form): 
  - search_key(옵션상품명/코드/sku) + search_value.
  - 판매상태(status radio): 9 승인대기 / 0 판매중 / 1 판매중지. (3 판매종료 주석).
  - 플랫폼(select): Steam(1)/Epic(34)/Ubisoft(30)/Rockstar(35)/Bethesda(33)/Origin(3)/기타(32).
  - 공급처(supplier select, getSupplierList).
  - 옵션상품 구분(game_type radio): game/dlc/music/bundle.
  - 진열상태(is_view radio): Y/N. 진열그룹(display_type radio): basic/edition/multi/dlc/game_bundle/dlc_bundle/etc_bundle.
  - 인터페이스/자막/음성/독점 한국어(radio Y/N) 4종.
- **목록 상단**: 총 개수(total_results) + "옵션상품 등록" 버튼(→ goods_option_register).
- **테이블**(컬럼: 옵션상품코드/SKU/옵션상품정보/플랫폼/출시일/판매상태/할인율/가격/비고). 각 상품 = **2행**:
  1. 메인행: 코드(→주문통계 external)/sku/정보(명+영문+뱃지[option_type·game_type·display_type·publisher])/플랫폼/출시일(10자)/상태(getProductStatus)/할인율(is_free=N시 discount%)/가격(is_free Y→무료 / else 소비자가 취소선+판매가)/비고(드롭다운).
     - 드롭다운: 상세보기(goods_option_view)·기본정보 설정(goods_option_modify)·이미지 설정·[구성정보 설정 if edition]·상세설명 설정·장르/카테고리/태그/판매/포인트 설정·페이지 미리보기(external)·[구성안내 미리보기 if package_view].
  2. 상세행(colspan): 배송정보(getGoodsItemDeliveryList 중첩테이블: 연동시스템/아이템코드/명/유형/플랫폼/공급처/남은재고 + 코드수령제한 delivery_date) / 게임 장르정보(genre badges) / 게임 카테고리정보(category badges) / 부가정보(steam appid·package·bundle + 진열/한국어4/특전/인증/품절/예약/네이버페이 badges).
- 페이징: `links_html`(Pagination.php) → `shared/ui/ServerPagination`. order product_code desc, 20/page.
- (하단 bundle-modal은 트리거 불명확 = 미포함.)

## 데이터 (legacy)
- `getGoodsOptionList`: `SELECT ... FROM tbl_goods_item WHERE status<>'3' [+필터] ORDER BY product_code DESC LIMIT`. game_type 미지정 시 game/dlc/music/bundle 한정.
- 배송정보: `getGoodsItemDeliveryList(product_code)`(연동시스템별 asset 재고).
- 연동시스템 코드→명: 1 Asset API / 2 Ztorm API / 9 Genba API / 8 Valutn API / 10 PointNexus API.

## API 계약 (백엔드 전달)
- **`GET /admin/goods/options`** — query: page, search_key, search_value, search_status, search_product_platform, search_supplier_code, search_game_type, search_is_view, search_display_type, search_interface/subtitle/spoken/exclusive_korean. 응답 `{ items: OptionListItem[], pagination, suppliers: {code,name}[] }`.
  - OptionListItem: product_code, goods_sku, product_name, product_name_en, option_type, game_type, game_type_name, display_type, display_type_name, platform, platform_name, supplier_name, release_date, status, status_name, is_free, discount, consumer_price, price, steam_appid, packageid, bundleid, is_view, spoken/interface/subtitle/exclusive_korean, is_bonus, is_auth, soldout, is_preorder, is_naverpay_coupon, delivery_date, view_url, package_view_url, is_package_view, genres:{code,name}[], categories:{code,name}[], deliveries: DeliveryItem[].
  - DeliveryItem: order_system_name, item_id, item_name, item_type, item_platform, item_publisher, stock.
  - 기본: status<>3, game_type in(game,dlc,music,bundle), order product_code desc, 20/page.

## 타겟 매핑
- 라우트: `routes/goods/goods_option_list.tsx`(validateSearch 필터). native GET form(전체 페이지 이동, title-list 방식).
- entities/goods-option 확장: `OptionListItem`/`OptionListQuery`/`OptionListResponse`, fetchGoodsOptionList + useGoodsOptionList.
- mock: goods-option handler에 목록 엔드포인트 + 리스트 샘플(register store와 별개 리스트 시드). 필터/페이징.
- 시각: 필터/테이블/뱃지/드롭다운 legacy 클래스 그대로. 드롭다운 위치는 data-bs-popper(title-list와 동일). 미이관 설정 링크는 대상 경로 anchor. ServerPagination 재사용.

## Parity 체크리스트 (셀프 검증 완료 — 개발자 승인 대기)
- [x] 필터 폼(검색어/상태/플랫폼/공급처/구분/진열상태·그룹/한국어4) native GET
- [x] 테이블 메인행(코드/SKU/정보뱃지/플랫폼/출시일/상태/할인/가격/드롭다운, data-bs-popper)
- [x] 상세행(배송정보 중첩테이블/장르/카테고리/부가정보 뱃지)
- [x] 총개수 + "옵션상품 등록" 버튼(→ register) + ServerPagination(20/page, product_code desc)
- 보류: 배송정보/장르/카테고리/공급처/플랫폼명은 백엔드 해석(mock 샘플). 드롭다운 설정 링크(view/modify/image/… 미이관)는 대상 경로 anchor. bundle-modal(트리거 불명확) 미포함. 주문통계 링크는 external anchor.
- 신규 목록 엔드포인트 `GET /admin/goods/options`(entities/goods-option 확장, handlers/goods-option 목록 시드).
- 기계 검증: tsc 0 / lint 0 / build 성공.
