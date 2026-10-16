# 옵션상품 카테고리 설정 (#36)

> 영역: 상품 > 옵션상품 관리 > 카테고리 설정. 옵션 sub-nav "카테고리 설정". 태그 그룹 체크박스 → `category` 콤마 저장. 장르(#35)와 동일 패턴, 카드 구성만 상이.

## 원본
- 파일: `pc/_Admin_/goods/goods_option_category_register.php`(370줄). 처리: `goods_option_category_ps.php`. 포함: `inc/sub_sidebar_option.php`(category active).
- 참조: [goods-option-genre](goods-option-genre.md)(동일 UI 패턴).

## 화면·플로우
- 진입: `/_Admin_/goods/goods_option_category_register.php?product_code=` → 타겟 `/goods/goods_option_category_register?product_code=`. col-2 sub-nav + col-10.
- page-title: `product_name(product_name_en)` — **장르와 달리 뱃지 없음**. breadcrumb 마지막 "옵션상품 카테고리 설정".
- 폼(post goods_option_category_ps.php): hidden 다수 + 상단 저장 버튼 "옵션상품 카테고리저장"(product_viewer 숨김).
- **4개 카드**(각 tag_group_code 접두어로 분류, name=category[]):
  1. "게임 카테고리" — `substr(key,0,1)=='C'`(C0001~) — card-body
  2. "홀로모델 카테고리" — `substr(key,0,2)=='HC'`(HC0001) — card-body
  3. "PS액세서리 카테고리" — `substr(key,0,1)=='P'`(P0001) — card-body px-3 py-2 font-13
  4. "Razer (레이저) 카테고리" — `substr(key,0,1)=='R'`(R0001) — card-body px-3 py-2 font-13
  - 각 카드: 그룹명 라벨(col-sm-2) + inline 체크박스(선택 시 checked).
- 저장: category[] → self 리다이렉트.

## 데이터 (legacy)
- 로드: tbl_goods_item(category/genre/steam_appid...). steam 자동체크(getSteamGamesCategory 등) → 없으면 goods_option_data.category 폴백. mock은 폴백 경로만 재현(주1).
- **저장**(category_ps): `$_POST['category']` implode(",") → `UPDATE tbl_goods_item SET category WHERE product_code`. 미선택 시 빈 문자열.

## API 계약 (백엔드 전달)
- **`GET /admin/goods/options/:productCode/category`** — `{ product{product_name,product_name_en}, groups[{group_code,group_name,tags[{tag_code,tag_name}]}](C*/HC*/P*/R*), selected: string[](현재 category) }`. 없으면 404.
- **`PUT /admin/goods/options/:productCode/category`** — body `{ category: string[] }` → UPDATE tbl_goods_item.category(콤마).

## 타겟 매핑
- 라우트: `routes/goods/goods_option_category_register.tsx` → `screens/goods-option-category`.
- 위젯: `widgets/option-sub-nav`(active="category").
- entities/goods-option: `OptionCategoryData`/`OptionCategoryProduct`/`SaveOptionCategoryRequest` + fetchOptionCategory/updateOptionCategory + useOptionCategory/useUpdateOptionCategory. `OptionTagGroup` 재사용.
- mock: CATEGORY_GROUPS(C0001~C0005 + HC0001 + P0001 + R0001, goods-title TAG_MASTER 정합) + categoryStore(선택 코드, view 시드 category 정합).
- 시각: legacy 4카드/카드별 body 클래스/체크박스 그대로. 프론트 접두어 분류(C/HC/P/R). product_viewer 저장 숨김. 저장 후 self+invalidate.

## Parity 체크리스트
- [ ] page-title product_name(영문), 뱃지 없음
- [ ] 4개 카드(게임/홀로모델/PS/Razer) 그룹 분류·body 클래스
- [ ] 현재 category 체크, 저장 → category 콤마 UPDATE → self
- [ ] product_viewer 저장 숨김
