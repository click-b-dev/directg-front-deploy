# 홀로모델 옵션상품 목록 (#48)

> 영역: 상품 > 옵션상품 관리 > 홀로모델 옵션상품. sidebar_goods "홀로모델 옵션상품". **#32 옵션상품 목록의 홀로모델 변형** — 동일 테이블/서브행(배송/장르/카테고리/부가)/dropdown. 차이: 기본 필터(status≠3 + game_type holomodels 계열) + 홀로모델 전용 검색폼 + 서브행 라벨("디지털상품 …") + holomodels view_url.

## 원본
- 파일: `goods_holomodels_list.php`(824줄). page_title "옵션상품 목록"(#32와 동일). 데이터: `getGoodsOptionList($page,$where,'product_code desc',$param,'20')`, getSupplierList, getGoodsItemDeliveryList, getTitleInfo(holomodels view_url).
- 참조: [goods-option-list](goods-option-list.md)(#32, 동일 골격), [goods-option-end](goods-option-end.md)(#47, 목록 변형 패턴).

## 화면·플로우
- 진입: `?page&search_*` → `/goods/goods_holomodels_list`. page_title/breadcrumb "옵션상품 목록"(상위 "옵션상품 관리").
- **기본 필터(고정)**: `status<>'3'` + (search_game_type 없으면) `game_type in ('holomodels','holomodelsdlc','holomodelsedition')`. 정렬 product_code desc, 20/page.
- **검색필터**(native GET): search_key(옵션상품명/코드/sku)+search_value · 판매상태(9/0/1, **3 제외**) · 공급처(select2) · 옵션상품 구분(radio 홀로모델=holomodels) · 진열그룹(radio holomodels/holomodelsedition/**holomodeldlc**(legacy 값 오타 그대로)) · 진열상태(Y/N) · 품절여부(checkbox soldout) · 인터페이스/자막/음성/독점 한국어(각 Y/N radio) · 구매특전(Y/N) · 예약판매(Y/N) · 네이버페이 쿠폰(Y/N). "옵션상품 검색".
- 상단: 총 개수 + "옵션상품 등록" → goods_option_register.
- **테이블**: #32와 동일(코드/SKU/옵션상품정보(뱃지: 디지털/실물·game_type·display_type·공급처)/플랫폼/출시일/판매상태/할인율/가격/dropdown).
- **서브행**(#32와 동일 구조): 배송정보(+코드수령제한) / **디지털상품 장르정보** / **디지털상품 카테고리정보** / 부가정보(steam ids·진열·한국어·특전 뱃지).
- **dropdown**: 상세보기/기본정보/이미지/구성정보(edition)/상세설명/장르/카테고리/태그/판매/포인트/페이지 미리보기(holomodels view_url)/구성안내(is_package_view).
- 데드코드: bundle-modal/package-modal + btn_package_info/btn_bundle_info(트리거 미렌더) → 제외.
- 페이지네이션: links_html → ServerPagination.

## API 계약 (백엔드 전달)
- **`GET /admin/goods/options/holomodels`** — query(#32 유사): `{ page, search_key, search_value, search_status, search_supplier_code, search_product_platform, search_game_type, search_display_type, search_is_view, search_soldout, search_is_bonus, search_is_preorder, search_is_naverpay_coupon, search_interface_korean, search_subtitle_korean, search_spoken_korean, search_exclusive_korean }` → `OptionListResponse`(items: OptionListItem[view_url=holomodels], pagination, suppliers). **백엔드: status≠3 && game_type in holomodels 계열(구분 미선택 시) 고정 + AND 검색.** 정렬 product_code desc, 20/page.

## 타겟 매핑
- 라우트: `routes/goods/goods_holomodels_list.tsx`(search 필터) → `screens/goods-holomodels-list`.
- entities/goods-option: `HolomodelsSearch` 타입 + `fetchHolomodelsList` + `useHolomodelsList`. `OptionListItem`/`OptionListResponse` 재사용.
- 페이지네이션: `shared/ui/ServerPagination`.
- mock: `HOLO_LIST`(game_type holomodels/holomodelsdlc, platform 51, genres/categories, holomodels view_url) + GET 핸들러(기본 필터 + 검색). suppliers 재사용.
- 시각: 필터폼/테이블/서브행/dropdown legacy 클래스 그대로. select2는 plain select. holomodeldlc 값 오타 유지.

## Parity 체크리스트
- [ ] page-title "옵션상품 목록", status≠3 + holomodels 계열 고정 목록
- [ ] 홀로모델 검색폼(구분/진열그룹 holomodels 값, 한국어4, 특전/예약/쿠폰)
- [ ] 테이블 + 서브행(배송/디지털상품 장르·카테고리/부가) + dropdown 12액션
- [ ] holomodels view_url(페이지 미리보기), ServerPagination
