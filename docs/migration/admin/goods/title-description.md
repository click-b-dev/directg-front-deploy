# 대표상품 상세설명 설정 (#28)

> 영역: 상품 > 대표상품 관리 > (단일) 상세설명 설정. sub_sidebar_title "상세설명 설정".

## 원본
- 파일: `pc/_Admin_/goods/title_description_register.php` (405줄). 처리: `title_ps.php`(description_save2/description_save3/requirements_save/legal_text_save) + `goods_ps.php`(short_description_save/region_msg_save) + `../steam/get_steam_game_info.php`(동기화). 포함: sub_sidebar_title(description active).
- 에디터: **SimpleMDE**(마크다운) — about_the_game/requirements/legal_text/dgkr_description 4개 필드.
- 참조: [title-image](title-image.md), [title-view](title-view.md).

## 화면·플로우
- 진입: `/_Admin_/goods/title_description_register.php?title_id=` → 타겟 `/goods/title_description_register?title_id=`. 레이아웃 col-2 sub-nav + col-10 → row(col-8 + col-4).
- 로드: tbl_goods + getGoodsDescription(설명 필드들).
- breadcrumb: 홈/상품/대표상품 관리/상세설명 설정. 타이틀 `{title_name} <small>({en})</small>`.
- **col-8** (각 카드 = textarea + 저장버튼, 일부 sync):
  1. **독점설명** (dgkr_description, SimpleMDE): 값=dgkr_description. "독점 설명 저장"(description_save3).
  2. **상세설명** (SimpleMDE): ⚠️ textarea id=about_the_game이나 **로드값은 `description` 컬럼**. footer 좌측 sync(description_sync) + 우측 "상세설명 저장"(description_save2 → about_the_game=값, description=값 동시 저장).
  3. **시스템요구사항** (requirements, SimpleMDE): footer sync(steam_sync_system) + "시스템요구사항 저장"(requirements_save).
  4. **권리표기** (legal_text, SimpleMDE): "권리표기 저장"(legal_text_save).
- **col-4**:
  1. **짧은설명** (short_description, 일반 textarea rows=7): 값=`str_replace("<br>","\r\n",short_description)`. "짧은설명 저장"(short_description_save).
  2. **지역제한 안내문구** (region_msg, 일반 textarea rows=8): "지역제한 안내문구"(region_msg_save).
  3. (특전 카드 — 주석처리, 미포함.)
- 인터랙션: 각 필드 독립 저장(alert만, 대부분 **reload 없음**). sync 2종(description/requirements) → steam API 조회 후 reload.

## 데이터 (legacy)
- 로드: getGoodsDescription(tbl_goods_description: dgkr_description/about_the_game/description/requirements/legal_text/short_description/region_msg).
- 저장(각 mode, `insert tbl_goods_description set X=:X ON DUPLICATE KEY UPDATE X=:X`):
  - description_save3: dgkr_description. description_save2: about_the_game=값, description=값. requirements_save: requirements. legal_text_save: legal_text. short_description_save: short_description. region_msg_save: region_msg.
- sync: get_steam_game_info.php(description_sync / steam_sync_system) — steam API로 필드 채움.

## API 계약 (백엔드 전달)
- **`GET /admin/goods/titles/:titleId/description`** — 응답 `{ title_id, title_name, title_name_en, steam_appid, description: { dgkr_description, detail, requirements, legal_text, short_description, region_msg } }`. detail=`description` 컬럼(상세설명 textarea 로드값). short_description은 `<br>`→개행 변환. 없으면 404.
- **`PUT /admin/goods/titles/:titleId/description`** — body `{ field, value }`. field ∈ dgkr_description|detail|requirements|legal_text|short_description|region_msg. 서버: field→컬럼 매핑 UPSERT(detail은 about_the_game+description 동시). 응답 `{ success }`.
- **`POST /admin/goods/titles/:titleId/description/sync`** — body `{ target: "description"|"requirements" }`. steam API로 해당 필드 채움. 응답 `{ success }`. reload.

## 타겟 매핑
- 라우트: `routes/goods/title_description_register.tsx`(search title_id) → `screens/title-description`.
- 위젯: `widgets/title-sub-nav`(active="description").
- entities/goods-title 확장: `TitleDescription`/요청 타입, `fetchDescription`+`useDescription`, `saveDescriptionField`/`syncDescription` + 훅.
- mock: 모듈 descriptionStore(Map<title, 필드값>). GET/PUT(field)/sync 핸들러.

## 에디터(SimpleMDE) 처리 — 결정: 의존성 추가(B)
- 개발자 결정으로 **마크다운 에디터 의존성 추가**. SimpleMDE 유지보수 포크 **EasyMDE** 채택.
- 공급망 점검: easymde/react-simplemde-editor에 알려진 악성 advisory 없음(Snyk). 다만 easymde 2.21.0 및 `-NNN.0` 카나리들이 2026-05 공격 창에 게시 → **공격 창 이전(2025-03) 안정 버전 `easymde@2.20.0` 정확히 고정**(integrity 확인). 유지보수 중단된 래퍼(react-simplemde-editor, 2022)는 미사용.
- `shared/ui/MarkdownEditor` — easymde만 얇게 감싼 React 래퍼(마운트 1회 init, onChange 상위 전달, unmount cleanup). spellChecker=false(영문 사전 CDN·한국어 오탐 방지). 4개 SimpleMDE 필드에 적용. sync 후 form key remount로 값 갱신.

## Parity 체크리스트 (셀프 검증 완료 — 개발자 승인 대기)
- [x] 레이아웃(col-2 sub-nav + col-8 + col-4) + 6개 필드 카드
- [x] 각 필드 로드값/독립 저장(field별, 저장은 alert만이라 미갱신 재현)
- [x] 상세설명 로드=description 컬럼, 저장=detail(백엔드가 about_the_game+description 매핑)
- [x] sync 버튼(description/requirements) → 동기화 후 refetch/remount
- [x] 짧은설명 일반 textarea, 4개 필드 EasyMDE 마크다운 에디터
- 보류: product_viewer 버튼 숨김 미반영(기존 단위 동일). 저장은 legacy처럼 alert만(자동 반영 없음) — mock은 store 갱신하나 화면 미리로드. steam 동기화(get_steam_game_info)는 백엔드 책임(mock 샘플). 짧은설명 `<br>`→개행 변환은 백엔드 응답 책임.
- 기계 검증: tsc 0 / lint 0 / build 성공. 의존성: easymde@2.20.0(exact).
