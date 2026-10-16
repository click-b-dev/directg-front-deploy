# 옵션상품 태그 설정 (#37)

> 영역: 상품 > 옵션상품 관리 > 태그 설정. 옵션 sub-nav "태그 설정". 태그 그룹 체크박스 → `tag` 콤마 저장 + tbl_goods_item_tags upsert. 장르/카테고리(#35/#36)와 동일 패턴, 카드 2개.

## 원본
- 파일: `pc/_Admin_/goods/goods_option_tag_register.php`(318줄). 처리: `goods_option_tag_ps.php`. 포함: `inc/sub_sidebar_option.php`(tag active).
- 참조: [goods-option-genre](goods-option-genre.md), [goods-option-category](goods-option-category.md).

## 화면·플로우
- 진입: `/_Admin_/goods/goods_option_tag_register.php?product_code=` → 타겟 `/goods/goods_option_tag_register?product_code=`. col-2 sub-nav + col-10.
- page-title: `product_name(product_name_en)`, 뱃지 없음. breadcrumb 마지막 "옵션상품 태그 설정".
- 폼(post goods_option_tag_ps.php): hidden 다수 + 상단 저장 버튼 "옵션상품 태그저장"(product_viewer 숨김).
- **2개 카드**(name=tag[]):
  1. "게임 장르 연관태그" — `substr(key,0,2)=='GT'`(GT* 그룹) — card-body
  2. "게임 태그정보" — `substr(key,0,1)=='T'`(T* 그룹, H 배타) — card-body
  - 각 카드: 그룹명 라벨(col-sm-2) + inline 체크박스(선택 시 checked).
- 저장: tag[] → self 리다이렉트.

## 데이터 (legacy)
- 로드: tbl_goods_item(tag/genre/category/steam_appid...). steam 자동체크(getSteamTagKo 등) → 없으면 저장값 폴백. mock은 폴백 경로만(주1).
- **저장**(tag_ps): `$_POST['tag']` implode(",") →
  - `UPDATE tbl_goods_item SET tag WHERE product_code`
  - `INSERT tbl_goods_item_tags SET tags,product_code ON DUPLICATE KEY UPDATE tags` (미선택 시 빈 문자열로 upsert)
- self 리다이렉트.

## API 계약 (백엔드 전달)
- **`GET /admin/goods/options/:productCode/tag`** — `{ product{product_name,product_name_en}, groups[{group_code,group_name,tags[{tag_code,tag_name}]}](GT*/T*), selected: string[](현재 tag) }`. 없으면 404.
- **`PUT /admin/goods/options/:productCode/tag`** — body `{ tag: string[] }` → tbl_goods_item.tag UPDATE + tbl_goods_item_tags upsert(백엔드 트랜잭션).

## 타겟 매핑
- 라우트: `routes/goods/goods_option_tag_register.tsx` → `screens/goods-option-tag`.
- 위젯: `widgets/option-sub-nav`(active="tag").
- entities/goods-option: `OptionTagSettingData`/`SaveOptionTagRequest` + fetchOptionTag/updateOptionTag + useOptionTag/useUpdateOptionTag. `OptionTagGroup`/`OptionCategoryProduct` 재사용.
- mock: TAG_SETTING_GROUPS(GT0001 게임 장르 연관태그 + T0001 게임 태그정보 — **운영 미확인 placeholder**, 주2) + tagStore(선택 코드).
- 시각: legacy 2카드/체크박스 그대로. 프론트 접두어 분류(GT/T). product_viewer 저장 숨김. 저장 후 self+invalidate.

## Parity 체크리스트
- [ ] page-title product_name(영문), 뱃지 없음
- [ ] 2개 카드(게임 장르 연관태그 GT*, 게임 태그정보 T*)
- [ ] 현재 tag 체크, 저장 → tag 콤마 UPDATE(+tags upsert) → self
- [ ] product_viewer 저장 숨김

주1) steam 자동 체크 미구현(백엔드 계약). 주2) GT*/T* 태그 구조는 legacy DB(tbl_tags)에만 존재하고 코드/스크린샷 미확인 → mock placeholder. 운영 확인 시 교체.
