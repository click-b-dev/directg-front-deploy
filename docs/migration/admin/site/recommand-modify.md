# 추천/특집 수정 (#13)

## 원본
- 파일: `pc/_Admin_/site/main_recommand_modify.php` (idx로 프리필) + `main_recommand_ps.php`(mode=modify).
- 참조: [recommand-register](recommand-register.md)(동일 폼), [banner-modify](banner-modify.md).

## 화면·플로우
- 진입: `/_Admin_/site/main_recommand_modify.php?idx=` → 타겟 `/site/main_recommand_modify?idx=`. sidebar_site, `$page_title="추천 및 특집 수정"`.
- breadcrumb: 홈/사이트/추천 및 특집 관리/추천 및 특집 수정.
- **등록 폼(#12)과 동일 구조** + 차이:
  1. `select * from tbl_main_recommand where idx` → 전 필드 프리필.
  2. hidden mode=modify, idx.
  3. `recommand_start/end` = `date('Y-m-d H:i:s', epoch)`.
  4. `recommand_banner_target` `<option selected>`, `is_view` radio `checked` = 로드값.
  5. recommand_name/banner/banner_link/goods_1~4 전부 value 프리필.
  - **우측 미리보기 없음**(배너 수정과 차이 — col-9 폼만).
  - 자동생성·기간 토글 없음(등록과 동일). 기간 항상 required.
- 제출: native POST modify → UPDATE → `go("main_recommand.php")`.

## 데이터 (legacy)
- 조회: `select * from tbl_main_recommand where idx=:idx` — 단건.
- UPDATE(main_recommand_ps.php modify): recommand_name, `recommand_start/end=strtotime`, recommand_banner, recommand_banner_link, recommand_banner_target, recommand_goods_1~4, is_view WHERE idx. (recommand_sort·is_del·reg_date 미변경.)

## API 계약 (백엔드 전달)
- **`GET /admin/site/main-recommands/{idx}`** — 단건 프리필. 응답 `MainRecommandDetail`(폼 필드 raw): `{ idx, recommand_name, recommand_start(epoch), recommand_end(epoch), recommand_banner, recommand_banner_link, recommand_banner_target, recommand_goods_1~4, is_view }`. (목록의 goods enrich와 달리 **raw 코드** 반환.) 미존재 → 404.
- **`PUT /admin/site/main-recommands/{idx}`** — 수정. body = 등록과 동일(`UpdateMainRecommandRequest`). 서버가 날짜 strtotime, WHERE idx UPDATE. 응답 `{ success: true }`.

## 타겟 매핑
- 라우트: `routes/site/main_recommand_modify.tsx`(search idx) → `screens/recommand-modify`.
- entities/main-recommand 확장: `MainRecommandDetail`/`UpdateMainRecommandRequest` 타입, `fetchMainRecommand`+`useMainRecommand`(단건), `updateMainRecommand`+`useUpdateMainRecommand`.
- 폼: 등록 구조 복제 + 프리필(데이터 로드 후 렌더, uncontrolled defaultValue/초기 state). 미리보기 없음.
- 공유 재사용: `applyMask`, `formatDateTime`, entities.
- mock: `MainRecommandRow`는 기존 컬럼으로 충분(신규 컬럼 없음). detail GET + update PUT 핸들러.

## Parity 체크리스트 (개발자 승인 완료 — ✅ 검증완료)
- [x] breadcrumb/제목 = 수정
- [x] 전 필드 프리필(text/date/target selected/goods/ is_view checked)
- [x] 기간 required + input-mask, 자동생성·토글 없음
- [x] 우측 미리보기 없음(등록과 동일 레이아웃)
- [x] 저장 → UPDATE 계약(strtotime) → 목록 이동
- 기계 검증: tsc 0 / lint 0 / build 성공(438 modules).
