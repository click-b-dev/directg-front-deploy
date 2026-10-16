# 판매종료 옵션상품 목록 (#47)

> 영역: 상품 > 옵션상품 관리 > 판매종료 옵션상품. sidebar_goods "판매종료 옵션상품". 옵션상품 목록(#32)의 자매 화면 — **status=3 고정 필터** + 자체 검색폼 + 확장 서브행(배송정보/부가정보). #32 엔티티/서브행/ServerPagination 재사용.

## 원본

- 파일: `goods_option_end.php`(622줄). 데이터: `Admin::getGoodsOptionList($page,$where,$orderby,$param,'30')`, `getSupplierList`, `getGoodsItemDeliveryList`, `AdminGoods::getTitleID`.
- 참조: [goods-option-list](goods-option-list.md)(#32, 동일 목록 골격).

## 화면·플로우

- 진입: `?page&search_*` → `/goods/goods_option_end`. page_title/breadcrumb "판매종료 옵션상품"(상위 "옵션상품 관리").
- **기본 필터(고정)**: `status='3' and display_type<>'timedeal' and game_type<>'randombox'`. 정렬 `product_code desc`, 30/page.
- **검색필터 카드**(native GET): 옵션상품코드 · 상품옵션명(국문) · 상품옵션명(영문) · 공급처(select) · 플랫폼(select) · 옵션상품 유형(radio Game/DLC) · 진열상태(radio Y/N) · 판매상태(radio 9/0/1/3) · 특전제공유무(radio Y/N, is_special) · 한국어 지원(checkbox 인터페이스/자막·음성·독점). "옵션상품 검색".
- 상단: 총 개수 + "옵션상품 등록"(legacy 오타 그대로) → goods_option_register.
- **테이블**: 코드/SKU/옵션상품명(+영문)/플랫폼/출시일/판매상태/할인율/가격/비고(dropdown). 각 행 아래 **서브행**:
  - **배송정보**: getGoodsItemDeliveryList → 연동시스템/아이템코드/명/유형/플랫폼/공급처/남은재고.
  - **부가정보**: title_id 뱃지 + Steam Appid/Packageid/Bundleid + 진열 뱃지 + 한국어(음성/인터페이스·자막/독점) 뱃지 + (title_id 없으면) "대표상품 등록" 버튼.
  - (#32와 달리 장르/카테고리 행 없음.)
- dropdown 액션: 상세보기/기본정보 설정/이미지 설정/태그 설정/판매 설정. (legacy의 미완성 bonus 링크는 제외.)
- 페이지네이션: links_html → ServerPagination.

## API 계약 (백엔드 전달)

- **`GET /admin/goods/options/end`** — query `{ page, search_product_code, search_product_name, search_product_name_en, search_supplier_code, search_product_platform, search_game_type, search_is_view, search_status, search_is_special, search_interface_korean, search_spoken_korean, search_exclusive_korean }` → `OptionListResponse`(items: OptionListItem[+title_id], pagination, suppliers). **백엔드: status=3 && display_type<>timedeal && game_type<>randombox 고정 + 검색 조건 AND.** 정렬 product_code desc, 30/page.
  - OptionListItem에 `title_id`(getTitleID) 추가. 배송정보는 item.deliveries 재사용.

## 타겟 매핑

- 라우트: `routes/goods/goods_option_end.tsx`(search 필터) → `screens/goods-option-end`.
- entities/goods-option: `OptionListItem`에 `title_id?`/`is_special?` 추가, `OptionEndSearch` 타입 + `fetchOptionEndList` + `useOptionEndList`. `OptionListResponse`/`OptionListItem`/서브행 재사용.
- 페이지네이션: `shared/ui/ServerPagination`(#8).
- mock: `END_LIST`(status=3, listItem 팩토리 + title_id/is_special) + GET 핸들러(option_end 필터). suppliers 재사용.
- 시각: 필터폼/테이블/서브행/dropdown legacy 클래스 그대로. "옵션상품 등록" 오타 유지.

## Parity 체크리스트

- [ ] page-title/breadcrumb "판매종료 옵션상품", status=3 고정 목록
- [ ] 검색필터(코드/명/영문/공급처/플랫폼/유형/진열/상태/특전/한국어) + 검색
- [ ] 테이블 + 서브행(배송정보/부가정보 title_id/steam/korean, 대표상품 등록 버튼)
- [ ] dropdown 액션 5종, ServerPagination
- [ ] 총 개수, "옵션상품 등록"(오타 유지)
