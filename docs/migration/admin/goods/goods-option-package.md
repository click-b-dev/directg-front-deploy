# 옵션상품 구성정보 설정 (#43, 핵심 col-8 분리)

> 영역: 상품 > 옵션상품 관리 > 구성정보 설정. 옵션 sub-nav "구성정보 설정"(package active). 대형 화면(708줄) — **핵심 col-8 분리**: 구성정보 설정 + 구매특전 설정. **분리(후속)**: col-4 Steam 구성정보 참고(steam API 패키지/번들 아이템·가격 + 동기화).

## 원본
- 파일: `goods_option_package_register.php`(708줄) + `goods_option_ps.php`(goods_option_search/goods_option_unit_add/goods_option_unit_delete/package_view_config/bonus_description_save). 포함: `inc/sub_sidebar_option.php`(package active).
- 도메인: tbl_goods_option_bundle(구성상세), `AdminGoods::getGoodsOptionSearch`, `setGoodsItemDescription`. 에디터 SmartEditor2(bonus_description).
- 참조: [goods-option-delivery-search](goods-option-delivery-search.md)(검색 모달 패턴), [goods-option-description-v2](goods-option-description-v2.md)(SmartEditor2).

## 화면·플로우 (col-8 범위)
- 진입: `?product_code=` → `/goods/goods_option_package_register?product_code=`. col-2 sub-nav + col-10 → col-8(범위) + col-4(분리).
- page-title: `<h4 class="">` product_name + 뱃지 3개(platform/game_type/display_type) + `<small>sku:</small>`. breadcrumb "구성정보 설정".
- **구성정보 설정 카드**:
  - is_package_view 라디오(Y 구성정보 사용 / N 미사용) — **클릭 즉시 저장**(package_view_config → reload).
  - 구성상세 목록 테이블: 번호 / 옵션상품코드(unit_code) / 구성명(unit_type 뱃지 1=Game·2=DLC·3=Music + unit_name) / 삭제(btn_unit_delete → goods_option_unit_delete, confirm).
  - tfoot: ① 직접추가(unit_type select[유형/1기본게임/2DLC/3Music/4특전/5기타] + unit_name input + "구성추가" → goods_option_unit_add, unit_code 빈값) · ② 옵션상품검색(search_option_code input + "옵션상품검색" → goods_option_search → **모달** → 구성추가(unit_code=검색 product_code)).
- **bonus_description 프리뷰**: 구성정보 카드와 구매특전 카드 사이에 cleaned bonus_description HTML echo(dangerouslySetInnerHTML).
- **구매특전 설정 카드**: is_bonus 라디오(Y/N, **표시 전용** — legacy 저장 트리거 없음) + bonus_description **SmartEditor2** + "특전설명 저장"(bonus_description_save).
- 인터랙션: is_package_view 즉시저장(reload), unit add/delete(reload), 검색→모달→add(reload), bonus 저장(reload).

## 데이터 (legacy)
- 로드: tbl_goods_item(is_package_view/is_bonus/product_*) + tbl_goods_item_description(bonus_description) + tbl_goods_option_bundle(구성상세, order unit_type/unit_name).
- **goods_option_search**: getGoodsOptionSearch(search_option_code) → 1건. unit_type=game_type 매핑(game→1/dlc→2/music→3), unit_name=product_name+플랫폼접미(스팀/에픽게임즈).
- **goods_option_unit_add**: INSERT tbl_goods_option_bundle(product_code/unit_type/unit_code/unit_name).
- **goods_option_unit_delete**: DELETE by idx.
- **package_view_config**: UPDATE tbl_goods_item.is_package_view.
- **bonus_description_save**: setGoodsItemDescription(bonus_description, SmartEditor2 HTML).

## API 계약 (백엔드 전달)
- **`GET /admin/goods/options/:productCode/package`** — `{ product{product_name,platform_name,game_type,display_type,goods_sku}, is_package_view, is_bonus, units[{idx,unit_code,unit_type,unit_name}], bonus_description, bonus_description_preview_html }`. 없으면 404.
- **`PUT /admin/goods/options/:productCode/package-view`** — body `{ is_package_view }`(Y|N) → UPDATE. `{ success }`. reload.
- **`POST /admin/goods/options/:productCode/package-units`** — body `{ unit_type, unit_code, unit_name }` → INSERT. `{ success }`. reload.
- **`DELETE /admin/goods/options/:productCode/package-units/:idx`** — DELETE by idx. `{ success }`. reload.
- **`POST /admin/goods/options/:productCode/package-units/search`** — body `{ search_option_code }` → `{ item: { unit_code, unit_type, unit_name, game_type } | null }`. 백엔드: getGoodsOptionSearch.
- **`PUT /admin/goods/options/:productCode/bonus-description`** — body `{ value }`(SE2 HTML) → setGoodsItemDescription. `{ success }`. reload.
  - 백엔드: bonus_description 프리뷰 정제(font-family/빈 style 제거)·strip_tags 에디터 초기값.

## 타겟 매핑
- 라우트: `routes/goods/goods_option_package_register.tsx`(search product_code) → `screens/goods-option-package`.
- 위젯: `widgets/option-sub-nav`(active="package", gameType=data.product.game_type).
- entities/goods-option 확장: `OptionPackageData`/`OptionPackageUnit`/`OptionPackageProduct`/요청 타입 + `fetchOptionPackage`/`savePackageView`/`addPackageUnit`/`deletePackageUnit`/`searchPackageOption`/`saveBonusDescription` + 훅(모두 reload→invalidate; 검색은 mutation 결과만).
- 에디터: `shared/ui/SmartEditor`(bonus_description). 검색 모달: React 제어(createPortal). is_bonus는 표시 전용(로컬 state, 미저장).
- mock: `packageStore`(units/is_package_view/is_bonus/bonus_description) + 핸들러.
- 시각: 카드/뱃지/테이블/tfoot legacy 클래스 그대로. product_viewer 시 추가/삭제/저장 버튼 숨김. col-4 Steam 참고 제외(분리).

## Parity 체크리스트
- [ ] page-title 뱃지3+sku, breadcrumb "구성정보 설정"
- [ ] is_package_view 즉시저장 토글
- [ ] 구성목록(뱃지1/2/3) + 직접추가(select+input) + 삭제(confirm)
- [ ] 옵션상품검색 → 모달 → 구성추가(unit_code)
- [ ] bonus_description 프리뷰(HTML) + SmartEditor2 + 특전설명 저장
- [ ] is_bonus 표시 전용(미저장), product_viewer 버튼 숨김, col-4 제외(분리)
