# 대표상품 상세설명 설정 v2 (#29)

> 영역: 상품 > 대표상품 관리 > (단일) 상세설명 설정 v2. sub_sidebar_title "상세설명 설정 v2".

## 원본
- 파일: `pc/_Admin_/goods/title_description_register_v2.php` (420줄). 처리: `title_ps.php`(description_save_v2) + `../steam/get_steam_game_info.php`(description_sync_v2). 포함: sub_sidebar_title(description_v2 active).
- 에디터: **Naver SmartEditor2**(HuskyEZCreator, iframe WYSIWYG HTML) — description_v2 필드. (주석처리된 dgkr/requirements/legal에 남은 SimpleMDE init은 요소 없음 = leftover.)
- 참조: [title-description](title-description.md).

## 화면·플로우
- 진입: `/_Admin_/goods/title_description_register_v2.php?title_id=` → 타겟 `/goods/title_description_register_v2?title_id=`. 레이아웃 col-2 sub-nav + col-10 → row(col-8 + **col-4는 전부 주석처리 = 비어있음**).
- 로드: tbl_goods + getGoodsDescription.
- breadcrumb: 홈/상품/대표상품 관리/상세설명 설정. 타이틀 `{title_name} <small>({en})</small>`.
- **col-8** (활성 카드 3개):
  1. **상세설명 (ver2)**: textarea id=description_v2(width:790px) → **SmartEditor2 WYSIWYG**. 초기값: description_v2 있으면 raw HTML, 없으면 `parsedown(htmlspecialchars_decode(description2))`. footer: sync(description_sync_v2) + "상세설명 (ver2) 저장"(description_save_v2, SE2 HTML 전송).
  2. **Steam 게임 정보** (read-only): `parsedown(about_the_game)` 렌더.
  3. **Steam 상세 설명** (read-only): `<div class="description_html">parsedown(description)</div>`.
- col-4: 전부 주석처리(짧은설명/지역제한/특전) → 미포함.
- 인터랙션: 저장(alert만, 미리로드), sync(description_sync_v2 → steam 후 reload).

## 데이터 (legacy)
- 로드: getGoodsDescription(description_v2/description2/about_the_game/description).
- **description_save_v2**(title_ps 988): `insert tbl_goods_description set description_v2=:description_v2, version='2' ON DUPLICATE KEY UPDATE description_v2, version='2'`.
- sync: get_steam_game_info.php(description_sync_v2) — steam API로 채움.

## API 계약 (백엔드 전달)
- **`GET /admin/goods/titles/:titleId/description-v2`** — 응답 `{ title_id, title_name, title_name_en, steam_appid, description_v2(HTML raw, 초기값), about_the_game_html(렌더), description_html(렌더) }`. description_v2 없으면 백엔드가 description2 렌더 fallback. 없으면 404.
- **`PUT /admin/goods/titles/:titleId/description-v2`** — body `{ value }`(HTML). version='2' 저장. 응답 `{ success }`.
- **`POST /admin/goods/titles/:titleId/description-v2/sync`** — description_sync_v2. steam API로 채움. 응답 `{ success }`. reload.

## 타겟 매핑
- 라우트: `routes/goods/title_description_register_v2.tsx`(search title_id) → `screens/title-description-v2`.
- 위젯: `widgets/title-sub-nav`(active="description_v2").
- entities/goods-title 확장: `TitleDescriptionV2` + 요청 타입, `fetchDescriptionV2`+`useDescriptionV2`, `saveDescriptionV2`/`syncDescriptionV2` + 훅.
- mock: 모듈 저장(descriptionV2Store). GET/PUT/sync. read-only 2종은 백엔드 렌더 HTML(dangerouslySetInnerHTML).

## 에디터(SmartEditor2) 처리 — 결정: 실제 SmartEditor2 도입
- 개발자 결정으로 **실제 Naver SmartEditor2 도입**. legacy `pc/_Admin_/smarteditor2/`(2.1MB, jindo 자체 번들 — jQuery 불필요)를 `apps/directg-admin/public/smarteditor2/`로 **복사**(legacy 원본은 읽기 전용, 복사만).
- `shared/ui/SmartEditor` — HuskyEZCreator.js 동적 로드 → `createInIFrame`(sSkinURI=/smarteditor2/SmartEditor2Skin.html, I18N_LOCALE=ko_KR, 툴바/리사이저/모드체인저). 저장 시 legacy처럼 `exec("UPDATE_CONTENTS_FIELD")` + `getIR()`로 HTML 추출(명령형 getContent, ref). sync 후 form key remount로 재초기화.
- eslint: `public/**`(정적 벤더 자산) lint 제외(admin eslint.config.js). SE2 대량 벤더 JS로 인한 formatter 크래시 방지.
- npm 의존성 추가 아님(정적 자산 복사).

## 운영 대조 반영 — v1/v2 메뉴 통합(병합 페이지)
- 운영환경엔 "상세설명 설정 v2" 별도 sub-nav 항목이 없고, **단일 "상세설명 설정" → v2 URL(병합 페이지)**. 제 legacy 스냅샷 v2 파일은 마크다운 필드가 주석처리돼 실제 운영과 달랐음.
- 조치: #28(v1)·#29(v2)를 **하나로 병합**. sub-nav의 `description_v2` 항목 제거, `description`(상세설명 설정) → `/goods/title_description_register_v2`.
- 병합 페이지 필드: col-8 [독점설명(EasyMDE) / 상세설명 ver2(SmartEditor2, sync+저장) / 시스템요구사항(EasyMDE, sync) / 권리표기(EasyMDE)] + col-4 [짧은설명 / 지역제한(textarea)]. Steam read-only 카드는 운영 미표시라 제거.
- 기존 v1 라우트(`/goods/title_description_register`, #28)는 미연결로 유지(무해).

## Parity 체크리스트 (셀프 검증 완료 — 개발자 승인 대기)
- [x] sub-nav 단일 "상세설명 설정" → v2 병합 페이지("v2" 항목 제거)
- [x] 병합 필드(독점/상세ver2 SE2/시스템요구사항/권리표기 + 짧은/지역), 필드별 독립 저장
- [x] 상세설명(ver2) SmartEditor2 + sync + 저장, 시스템요구사항 sync
- [x] SmartEditor2 실제 도입(public 복사 + React 래퍼)
- 보류: product_viewer 버튼 숨김 미반영(기존 단위 동일). 저장은 legacy처럼 alert-only(미리로드). steam 동기화·Parsedown 렌더는 백엔드 책임(mock 샘플). **SE2는 iframe/전역 라이브러리라 런타임 동작(초기화·저장·리마운트)은 개발자 브라우저 확인 권장.**
- 기계 검증: tsc 0 / lint 0 / build 성공.
