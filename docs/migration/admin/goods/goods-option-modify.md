# 옵션상품 기본정보 설정 (#33)

> 영역: 상품 > 옵션상품 관리 > (단일) 기본정보 설정. 옵션상품 목록 드롭다운 "기본정보 설정" + 옵션 sub-nav "기본정보 설정". 옵션 sub-nav 첫 이관.

## 원본
- 파일: `pc/_Admin_/goods/goods_option_modify.php` (549줄). 처리: `goods_option_ps.php` mode=modify(158~192). 포함: `inc/sub_sidebar_option.php`(옵션 sub-nav, modify active).
- 참조: [goods-option-register](goods-option-register.md), [goods-option-list](goods-option-list.md).

## 화면·플로우
- 진입: `/_Admin_/goods/goods_option_modify.php?product_code=` → 타겟 `/goods/goods_option_modify?product_code=`. `$page_title="옵션상품 기본정보 설정"`. 레이아웃 col-2 sub-nav + col-10.
- 로드: `SELECT * FROM tbl_goods_item WHERE product_code`. goods_sku 없으면 uuid.
- 폼(post goods_option_ps.php mode=modify) — 카드 "옵션상품 기본정보":
  - product_code(required, 편집가능), goods_sku(readonly).
  - product_name(국문), product_name_en(영문), **keyword(검색키워드)**.
  - **[option_type=='retail'(로드값)일 때만] model_code(실물상품 모델코드), model_name(실물상품 모델명)**.
  - product_platform(select), option_type(select — **로드값 정상 반영**, register와 달리 버그 없음), game_type(select: game/dlc/music/bundle/**timedeal/randombox**/accessories/holomodels), display_type(select).
  - 음성/인터페이스/자막/독점 한국어(data-switch 토글).
  - steam_appid, packageid, bundleid.
  - (심의결정등급 age_limit·내용정보표시 game_rate[]·상품정보고시 폼 — 모두 주석처리 = 미포함. game_rate_text hidden은 game_rate 체크박스 없어 "0" leftover.)
  - submit "옵션상품 저장"(product_viewer 숨김).
- 제출: UPDATE 후 `go("goods_option_modify.php?product_code=")` = 자기 페이지 reload.

## 데이터 (legacy)
- 로드: tbl_goods_item.
- **modify UPDATE**(goods_option_ps 158): `UPDATE tbl_goods_item SET product_name, product_name_en, keyword, product_platform, steam_appid, packageid, bundleid, option_type, game_type, display_type, bundle_type, spoken/interface/exclusive/subtitle_korean, goods_sku, model_code, model_name, publisher, age_limit, game_rate=str_pad(game_rate_text,7,'0'), update_date=now() WHERE product_code`. (publisher/age_limit는 이 폼 미제공 → 빈값, game_rate="0000000".)

## API 계약 (백엔드 전달)
- **`GET /admin/goods/options/:productCode`** — 수정 로드(#31에서 정의, keyword/model_code/model_name 포함으로 확장). 없으면 404.
- **`PUT /admin/goods/options/:productCode`** — modify UPDATE(#31 정의 재사용). body에 keyword/model_code/model_name 추가.

## 타겟 매핑
- 라우트: `routes/goods/goods_option_modify.tsx`(search product_code) → `screens/goods-option-modify`.
- **위젯: `widgets/option-sub-nav`(신규)** — sub_sidebar_option 재현(상세보기/기본정보 설정/장르/카테고리/이미지/[스크린샷 if dlc·accessories]/판매/상세설명/상세설명 V2/구성정보/태그/적립금). props: productCode, active, gameType. 옵션 하위화면 공용.
- entities/goods-option 확장: `GoodsOption`에 keyword/model_code/model_name 추가(register 페이로드도 빈값 포함). fetchOption/updateOption 재사용.
- mock: opt() 기본값에 keyword/model_code/model_name 추가. 시드에 반영.
- 시각: 카드/셀렉트/토글 legacy 클래스 그대로. option_type 정상 반영, game_type timedeal/randombox 포함, retail 조건부 model 필드. product_viewer 저장 숨김. 저장 후 self 이동+invalidate(legacy self reload).

## Parity 체크리스트
- [ ] 옵션 sub-nav(col-2, modify active) + col-10 폼
- [ ] register 대비 확장(keyword, retail model_code/name, option_type 반영, game_type timedeal/randombox)
- [ ] 셀렉트 로드 selected, 한국어 토글, steam id 3종
- [ ] 저장 → UPDATE → self 이동, product_viewer 숨김
