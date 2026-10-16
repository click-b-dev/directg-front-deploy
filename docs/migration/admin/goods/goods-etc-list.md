# 실물상품 목록 (옵션 레벨) (#49)

> 영역: 상품 > 옵션상품 관리 > 실물상품 목록. sidebar_goods "실물상품 목록"(옵션상품 관리 그룹). **#48 홀로모델 자매** — 옵션(item) 레벨, `game_type='accessories'`. (title 레벨 accessories_list.php는 별건 미이관.)

## 원본

- 파일: `goods_etc_list.php`(661줄). page_title "실물상품 목록". 데이터: `getGoodsOptionList($page,$where,'product_code desc',$param,'30')`, getSupplierList, getGoodsItemDeliveryList, getTitleInfo(title_id/view_url).
- 참조: [goods-holomodels-list](goods-holomodels-list.md)(#48), [goods-option-end](goods-option-end.md)(#47).

## 화면·플로우

- 진입: `?page&search_*` → `/goods/goods_etc_list`. page_title/breadcrumb "실물상품 목록"(상위 옵션상품 관리).
- **기본 필터(고정)**: `status<>'3' and game_type='accessories'`. 정렬 product_code desc, 30/page.
- **검색필터**(native GET, #48보다 단순): 옵션상품코드 · 상품옵션명(국문) · 상품옵션명(영문) · 공급처(select) · 플랫폼(select) · 판매상태(9/0/1/3) · 진열상태(Y/N) · 배송유형(radio 2 실물배송/3 실물+디지털코드) · 품절여부(checkbox). "실물상품 검색". (한국어/특전/예약/쿠폰 필터 없음.)
- 상단: 총 개수 + "옵션상품 등록"(오타) → goods_option_register.
- **테이블**: 코드/SKU/옵션상품명/플랫폼/출시일/**판매상태(색상 badge, ProductStatusBadge)**/할인율/가격/dropdown.
- **서브행**(#48과 다름):
  - **col-2**: header 이미지(`/upload/product/{code}/header/header.jpg`) + figcaption `domain`.
  - **col-10** 테이블:
    - (delivery_type==3만) **디지털상품 배송정보**: 배송 테이블(연동시스템/아이템코드/명/유형/플랫폼/공급처/**연령제한(age_limit)**/남은재고) + 코드수령제한.
    - **실물상품 배송정보**: `[model_code] model_name`.
    - **장르**: getTagName(genre).
    - **카테고리**: getTagName(category).
    - **부가정보**: title_id 뱃지 + 진열 뱃지 + (title_id 없으면) "대표상품 등록" + delivery_type 라벨 뱃지(1 디지털코드/2 실물/3 실물+디지털코드) + soldout 뱃지.
- **dropdown**(8액션): 상세보기/기본정보/카테고리/상세설명/이미지/판매/포인트/페이지 미리보기(goods_item_view). (구성정보/장르/태그 없음.)
- 데드코드: bundle-modal/package-modal(트리거 미렌더) → 제외.
- 페이지네이션: links_html → ServerPagination.

## API 계약 (백엔드 전달)

- **`GET /admin/goods/options/etc`** — query `{ page, search_product_code, search_product_name, search_product_name_en, search_supplier_code, search_product_platform, search_status, search_is_view, search_delivery_type, search_soldout }` → `OptionListResponse`(items: OptionListItem[+model_code/model_name/domain/delivery_type/title_id/view_url, deliveries[+age_limit]], pagination, suppliers). **백엔드: status≠3 && game_type=accessories 고정 + AND 검색.** 정렬 product_code desc, 30/page.

## 타겟 매핑

- 라우트: `routes/goods/goods_etc_list.tsx`(search 필터) → `screens/goods-etc-list`.
- entities/goods-option: `EtcSearch` 타입 + `fetchEtcList` + `useEtcList`. `OptionListItem`에 `model_code?/model_name?/domain?/delivery_type?`, `OptionDeliveryItem`에 `age_limit?` 추가. `OptionListResponse` 재사용.
- 공용: `shared/ui/ServerPagination`, `shared/ui/ProductStatusBadge`(#판매상태 badge).
- mock: `ETC_LIST`(game_type accessories, model, domain, delivery_type, deliveries age_limit) + GET 핸들러. suppliers 재사용.
- 시각: 필터폼/테이블/서브행/dropdown legacy 클래스 그대로. "옵션상품 등록" 오타 유지.

## Parity 체크리스트

- [ ] page-title "실물상품 목록", status≠3 + accessories 고정 목록
- [ ] 실물 검색폼(배송유형 필터), 판매상태 색상 badge
- [ ] 서브행(header 이미지+domain / 디지털배송(dt=3, age_limit) / 실물배송 model / 장르/카테고리 / 부가 delivery_type 라벨)
- [ ] dropdown 8액션, ServerPagination
