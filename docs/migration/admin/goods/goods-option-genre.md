# 옵션상품 장르 설정 (#35)

> 영역: 상품 > 옵션상품 관리 > 장르 설정. 옵션 sub-nav "장르 설정". 태그 그룹 체크박스 → `genre` 콤마 저장.

## 원본
- 파일: `pc/_Admin_/goods/goods_option_genre_register.php`(292줄). 처리: `goods_option_genre_ps.php`. 포함: `inc/sub_sidebar_option.php`(genre active).
- 참조: title-tag(#27, 동일 태그 UI 패턴), [goods-option-view](goods-option-view.md).

## 화면·플로우
- 진입: `/_Admin_/goods/goods_option_genre_register.php?product_code=` → 타겟 `/goods/goods_option_genre_register?product_code=`. 레이아웃 col-2 sub-nav + col-10.
- page-title: `product_name` + 플랫폼 뱃지(getPlatformName)/game_type 뱃지/display_type 뱃지. (breadcrumb 마지막은 legacy 오타 "옵션상품 태그 설정" 그대로 — 재현)
- 폼(post goods_option_genre_ps.php): hidden mode/product_code/referer/page/genre_code. 상단 저장 버튼 "옵션상품 장르저장"(product_viewer 숨김).
- 카드 "옵션상품 장르설정":
  - row1: tag_group_code가 **G0**로 시작하는 그룹 → 그룹명 라벨(col-sm-2) + inline 체크박스(genre[] value=tag_code, 선택 시 checked).
  - row2: **HG**로 시작하는 그룹(홀로모델 장르) → 동일.
- 저장: genre[] → 리다이렉트 self(referer?product_code=).

## 데이터 (legacy)
- 로드: tbl_goods_item(genre/category/steam_appid/game_type/product_name/product_platform/display_type).
- getSteamTagKo/getSteamGamesGenre/getSteamGamesCategory: steam json 기반 자동 체크. **없으면 goods_option_data.genre(콤마 코드) 기준 체크** → mock은 이 폴백 경로만 재현(steam 자동체크 미구현, 주1).
- getTagList/getTagGroupInfo: 태그 마스터/그룹명. G0*/HG* 그룹만 이 화면 렌더.
- **저장**(genre_ps): `$_POST['genre']` implode(",") → `UPDATE tbl_goods_item SET genre WHERE product_code`. 미선택 시 빈 문자열.

## API 계약 (백엔드 전달)
- **`GET /admin/goods/options/:productCode/genre`** — `{ product{product_name,product_platform,game_type,display_type}, groups[{group_code,group_name,tags[{tag_code,tag_name}]}](G0*/HG*), selected: string[](현재 genre 코드) }`. 없으면 404.
- **`PUT /admin/goods/options/:productCode/genre`** — body `{ genre: string[] }` → UPDATE tbl_goods_item.genre(콤마). 서버 steam 자동체크 로직은 백엔드 책임.

## 타겟 매핑
- 라우트: `routes/goods/goods_option_genre_register.tsx`(search product_code) → `screens/goods-option-genre`.
- 위젯: `widgets/option-sub-nav`(active="genre").
- entities/goods-option: `OptionGenreData`/`OptionTagGroup` 타입 + fetchOptionGenre/updateOptionGenre + useOptionGenre/useUpdateOptionGenre.
- mock: GENRE_GROUPS(G0001 게임 장르 10종 + HG0001 홀로모델 장르) + genreStore(선택 코드, view 시드와 정합). product 정보는 optionStore 재사용.
- 시각: legacy 카드/체크박스/뱃지 클래스 그대로. product_viewer 저장 숨김. 저장 후 self 이동+invalidate.

## Parity 체크리스트
- [ ] page-title 뱃지(플랫폼/구분/진열그룹)
- [ ] G0*/HG* 그룹 라벨 + inline 체크박스, 현재 genre 체크
- [ ] 저장 → genre 콤마 UPDATE → self 이동, product_viewer 숨김
- [ ] breadcrump legacy 오타("태그 설정") 재현
