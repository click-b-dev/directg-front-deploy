# 대표상품 스크린샷 설정 (#26)

> 영역: 상품 > 대표상품 관리 > (단일) 스크린샷 설정. sub_sidebar_title "스크린샷 설정".

## 원본
- 파일: `pc/_Admin_/goods/title_screenshot_register.php` (413줄). 처리: `title_ps.php`(screenshot_upload/sort_up/sort_down) + `../steam/steam_image_download.php`(steam 다운로드/삭제). 포함: sub_sidebar_title(screenshot active).
- 도메인: `Admin::getTitleScreenshotList`, 서버 파일시스템 JSON(`apps_{steam_appid}.json`), 이미지 다운로드.
- 참조: [title-media](title-media.md), [title-view](title-view.md).

## 화면·플로우
- 진입: `/_Admin_/goods/title_screenshot_register.php?title_id=` → 타겟 `/goods/title_screenshot_register?title_id=`. 레이아웃 col-2 sub-nav + **col-7**(메인) + **col-3**(디스크엔 상태).
- 로드: tbl_goods + getTitleScreenshotList(등록 스크린샷). steam JSON에서 다운로드 후보 목록.
- **col-7 카드1 "대표상품 스크린샷"**:
  - 메인 미리보기 img(screenshots[0].url).
  - 썸네일 목록: 각 썸네일(data-url) **클릭 → 메인 img 전환**. 삭제 버튼(product_viewer 숨김, "스크린샷 {n} 삭제").
  - card-footer: **스팀 스크린샷** — steam JSON 후보(최대 10). 이미 다운로드됨 → "스크린샷 N 완료", 아니면 "스크린샷 N 다운로드" 버튼(steam_image_download).
- **col-7 카드2 "대표상품 스크린샷 직접업로드"**: 크기 안내(856x480 / 112x63) + file input + "스크린샷 업로드"(screenshot_upload, multipart).
- **col-3 카드 "디스크엔 업로드 상태"**: 경로 안내 + list-group(각 스크린샷: sort + 썸네일 + "스크린샷 {num}" + 정렬 위/아래 버튼).
- 인터랙션:
  - 썸네일 클릭 → 메인 전환(클라이언트).
  - 삭제(btn_screenshot_delete) → steam_image_download.php(image_type=screenshot_delete, screenshot_num). **⚠️ location.reload 주석처리 = 삭제 후 화면 갱신 안 됨(legacy 미완성/버그).**
  - 스팀 다운로드 → steam_image_download.php(이미지 다운로드). 성공 시 버튼 제거 + "완료" 표시(리스트 미갱신).
  - 업로드(btn_upload_screenshot) → title_ps.php screenshot_upload → reload.
  - 정렬 위/아래(btn_sort_up/down) → title_ps.php screenshot_sort_up/down → reload.

## 데이터 (legacy)
- 로드: getTitleScreenshotList(tbl_goods_screenshot) + steam JSON 파일.
- **screenshot_sort_up**(title_ps 1676): `UPDATE tbl_goods_screenshot SET sort=sort-1 WHERE idx`. (이웃과 swap 아님, 단순 ±1.)
- **screenshot_sort_down**(1686): `SET sort=sort+1 WHERE idx`.
- **screenshot_upload**(1612): 파일 저장 + INSERT tbl_goods_screenshot(파일시스템). 1MB 초과 거부.
- **삭제/다운로드**(steam_image_download.php): 파일/행 삭제, steam 이미지 다운로드(파일시스템 + steam CDN).

## API 계약 (백엔드 전달)
- **`GET /admin/goods/titles/:titleId/screenshots`** — 응답 `{ title_id, title_name, title_name_en, steam_appid, screenshots: Screenshot[](sort 오름차순), steam_candidates: SteamScreenshotCandidate[] }`. Screenshot=`{ idx, screenshot_num, url, thumbnail, sort }`. Candidate=`{ id, path_full, path_thumbnail, downloaded }`. 없으면 404.
- **`DELETE /admin/goods/titles/:titleId/screenshots/:screenshotNum`** — 삭제. 응답 `{ success }`. (legacy는 삭제 후 미갱신 — 재현 시 invalidate 안 함.)
- **`POST /admin/goods/titles/:titleId/screenshots/sort`** — body `{ idx, dir: "up"|"down" }`. sort ∓1. 응답 `{ success }`. reload.
- **`POST /admin/goods/titles/:titleId/screenshots/download`** — steam 다운로드. body `{ id, path_full, path_thumbnail, num }`. 응답 `{ success }`.
- **`POST /admin/goods/titles/:titleId/screenshots/upload`** — 직접 업로드. body `{ file_name }`(mock 단순화, 실제는 multipart 파일). 응답 `{ success }`. reload.

## 타겟 매핑
- 라우트: `routes/goods/title_screenshot_register.tsx`(search title_id) → `screens/title-screenshot`.
- 위젯: `widgets/title-sub-nav`(active="screenshot").
- entities/goods-title 확장: `Screenshot`/`SteamScreenshotCandidate`/`TitleScreenshots` + 요청 타입, `fetchScreenshots`+`useScreenshots`, `deleteScreenshot`/`sortScreenshot`/`downloadScreenshot`/`uploadScreenshot` + 훅.
- mock: 모듈 screenshotStore(Map) + steam candidates 샘플. GET/DELETE/sort/download/upload 핸들러.
- 시각: 카드/리스트/버튼 legacy 클래스 그대로. 썸네일 클릭 전환. **삭제 no-reload는 legacy 그대로 재현**(게이트에서 갱신 여부 판단). 파일 업로드는 파일명만 mock 반영. steam JSON/이미지 다운로드는 백엔드 책임.

## Parity 체크리스트 (셀프 검증 완료 — 개발자 승인 대기)
- [x] 레이아웃(col-2 sub-nav + col-7 + col-3) + 카드 구성
- [x] 미리보기 + 썸네일 클릭 전환 + 삭제(**no-reload 재현** — 게이트 판단)
- [x] 스팀 후보(완료/다운로드), 직접업로드 폼
- [x] 디스크엔 상태 리스트 + 정렬 위/아래(sort ∓1) reload(invalidate)
- ⚠️ 삭제 동작: legacy는 삭제 후 location.reload가 주석처리되어 화면이 갱신되지 않음(삭제된 썸네일이 새로고침 전까지 남음). 그대로 재현(invalidate 안 함). **자동 갱신으로 바꿀지 개발자 판단 필요.**
- 보류: product_viewer 버튼 숨김 미반영(기존 단위 동일). steam JSON/이미지 다운로드·파일 업로드는 백엔드/파일시스템 책임 — mock은 store 조작으로 흐름만 재현(업로드는 파일명만). 이미지 URL은 legacy 경로(디스크엔 미업로드 시 깨짐 = legacy 동일).
- 기계 검증: tsc 0 / lint 0 / build 성공.
