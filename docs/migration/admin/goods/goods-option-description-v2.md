# 옵션상품 상세설명 설정 (#39, 운영 병합 페이지)

> 영역: 상품 > 옵션상품 관리 > 상세설명 설정. **운영 대조 반영** — 운영에선 v1/v2 sub-nav가 단일 "상세설명 설정"으로 통합되고 v2 URL이 병합 페이지다(#29 title과 동일 패턴). 제 legacy 스냅샷 v2 파일은 마크다운 필드가 주석처리돼 실제 운영과 달랐음. 개발자 운영 스크린샷(`product_code=60000676`)으로 교정.

## 원본
- 파일: `pc/_Admin_/goods/goods_option_description_register_v2.php`(648줄, 스냅샷). 운영은 주석처리 필드(requirements/legal/short/region) 활성. 처리: `goods_option_ps.php`(description_save2/requirements_save/legal_text_save/short_description_save/region_msg_save) + `../steam/get_steam_game_info.php`(steam_sync_desc/steam_sync_system). 포함: `inc/sub_sidebar_option.php`.
- 에디터: **Naver SmartEditor2**(description_v2, HTML) + **EasyMDE 마크다운**(requirements/legal_text) + textarea(short_description/region_msg).
- 참조: [title-description-v2](title-description-v2.md)(#29 병합 선례). 옵션은 title과 달리 **독점설명(dgkr) 카드 없음**.

## 화면·플로우 (운영 기준)
- 진입: `?product_code=` → 타겟 `/goods/goods_option_description_register_v2?product_code=`. 레이아웃 col-2 sub-nav + col-10 → row(col-8 + col-4).
- page-title: `<h4 class="">`(page-title 클래스 아님) — `{product_name}` + 뱃지 3개(`getPlatformName(product_platform)` / `game_type` / `display_type`, `badge bg-dark`) + 아래 `<small>sku: {goods_sku}</small>`. breadcrumb 마지막 "상세설명 설정".
- **col-8** (카드 3개):
  1. **옵션상품 상세설명 (ver2)**: **SmartEditor2**(description_v2). 초기값 description_v2(없으면 백엔드 parsedown fallback). footer: col-4 sync(`btn_steam_sync`, steam_sync_desc) + offset col-4 text-end "상세설명 저장"(description_save2).
  2. **옵션상품 시스템 요구사항**: **EasyMDE 마크다운**(requirements). footer: sync(`btn_steam_sync_system`, steam_sync_system) + "시스템 요구사항 저장"(requirements_save).
  3. **권리표기**: **EasyMDE 마크다운**(legal_text). footer: "권리표기 저장"(legal_text_save). (sync 없음.)
- **col-4** (카드 2개):
  1. **옵션상품 짧은설명**: textarea(short_description). "짧은설명 저장"(short_description_save).
  2. **지역제한 안내문구**: textarea(region_msg). "지역제한 안내문구"(region_msg_save). (버튼 라벨 "저장" 없음 — legacy 그대로.)
- sub-nav: 운영은 "상세설명 설정 V2" 항목 없음 → 단일 **"상세설명 설정"** 이 v2 URL 연결. `OptionSubNav`에서 `description_v2` 항목 제거, `description`(상세설명 설정) → `/goods/goods_option_description_register_v2`. 활성 키 `description`.
- 데드코드: 스냅샷의 Steam read-only 카드(게임정보/상세설명), 패키지 구성추가 모달·구성상세 JS는 운영 미표시 → 제외.
- 인터랙션: 각 저장 alert-only(**미리로드**), sync(steam 후 `location.reload`).

## 데이터 (legacy)
- 로드: `tbl_goods_item` + `tbl_goods_item_description`(description_v2/requirements/legal_text/short_description/region_msg/about_the_game).
- 저장: `setGoodsItemDescription(product_code, <col>, <value>)` — 각 case별 컬럼. description_save2는 FILTER_SANITIZE_FULL_SPECIAL_CHARS.
- sync: `get_steam_game_info.php`(steam_sync_desc=상세설명 / steam_sync_system=시스템요구사항) 후 reload.

## API 계약 (백엔드 전달)
- **`GET /admin/goods/options/:productCode/description-v2`** — 응답 `{ product_code, product_name, platform_name, game_type, display_type, goods_sku, steam_appid, description_v2, requirements, legal_text, short_description, region_msg }`. description_v2 없으면 백엔드 parsedown(about_the_game) fallback. 없으면 404.
- **`PUT /admin/goods/options/:productCode/description-v2`** — body `{ value }`(SE2 HTML) → description_save2. `{ success }`. (alert-only, 미리로드.)
- **`PUT /admin/goods/options/:productCode/description-field`** — body `{ field, value }`(field=requirements|legal_text|short_description|region_msg) → 해당 컬럼 저장. `{ success }`. (미리로드.)
- **`POST /admin/goods/options/:productCode/description-v2/sync`** — steam_sync_desc. `{ success }`. reload.
- **`POST /admin/goods/options/:productCode/description/sync`** — body `{ target: "requirements" }` → steam_sync_system. `{ success }`. reload.
  - 백엔드 책임: Parsedown/htmlspecialchars_decode fallback, steam API 동기화.

## 타겟 매핑
- 라우트: `routes/goods/goods_option_description_register_v2.tsx`(search product_code) → `screens/goods-option-description-v2`.
- 위젯: `widgets/option-sub-nav`(v1/v2 병합 — description 단일, active="description", gameType=data.game_type).
- entities/goods-option 확장: `OptionDescriptionV2`/`OptionDescriptionFields`/`OptionDescriptionFieldKey` + 요청 타입 + `fetchOptionDescriptionV2`/`saveOptionDescriptionV2`/`saveOptionDescriptionField`/`syncOptionDescriptionV2`/`syncOptionDescription` + 훅(저장 미리로드=invalidate 없음, sync=invalidate).
- 에디터: `shared/ui/SmartEditor`(SE2, #29 도입) + `shared/ui/MarkdownEditor`(EasyMDE) 재사용.
- mock: `descriptionV2Store`(SE2) + `descriptionFieldsStore`(4필드) + GET/PUT(v2)/PUT(field)/sync×2.
- 시각: 카드/뱃지/클래스/버튼 라벨 운영 그대로. Steam read-only·구성 모달 제외.

## Parity 체크리스트
- [ ] sub-nav 단일 "상세설명 설정" → v2 병합 라우트("V2" 항목 제거), active=description
- [ ] page-title 뱃지 3개(platform/game_type/display_type) + sku, breadcrumb "상세설명 설정"
- [ ] col-8 3카드(상세설명 ver2 SE2 / 시스템요구사항 MD / 권리표기 MD), 독점설명 없음
- [ ] col-4 2카드(짧은설명 textarea / 지역제한 textarea)
- [ ] 필드별 독립 저장(미리로드) + sync(상세설명 steam_sync_desc / 요구사항 steam_sync_system, reload)
- [ ] product_viewer 버튼 숨김, Steam read-only·구성 모달 제외
