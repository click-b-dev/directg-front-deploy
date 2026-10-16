# 대표상품 이미지 설정 (#27)

> 영역: 상품 > 대표상품 관리 > (단일) 이미지 설정. sub_sidebar_title "이미지 설정".

## 원본
- 파일: `pc/_Admin_/goods/title_image_register.php` (594줄). 처리: `title_ps.php`(header_upload/library_upload/hero_capsule_upload) + `../steam/steam_image_download.php`(스팀 다운로드). 포함: sub_sidebar_title(image active).
- 도메인: `Admin::remoteFileExist`(HTTP 존재확인), steam JSON(`apps_{appid}.json`), CDN(cloudflare steamstatic), image.directg.net.
- 참조: [title-screenshot](title-screenshot.md), [title-view](title-view.md).

## 화면·플로우
- 진입: `/_Admin_/goods/title_image_register.php?title_id=` → 타겟 `/goods/title_image_register?title_id=`. 레이아웃 col-2 sub-nav + col-10 → row(col-6 [웹서버] + col-6 [디스크엔]).
- 로드: tbl_goods + steam JSON(header_image/capsule_image 등) + remoteFileExist로 로컬/디스크엔 이미지 존재 확인.
- breadcrumb: 홈/상품/대표상품 관리/이미지 설정. 타이틀 `{title_name} <small>({en})</small>`.
- **col-6 [웹서버]**: 4개 이미지 슬롯 카드(각 border 카드):
  1. **Header (460x215)**: 로컬 img or "업로드해주세요". 스팀 url(header_image) + "header 이미지 업로드"(스팀 다운로드, header_460x215) + file input + "header 이미지 저장"(header_upload).
  2. **Small capsule (231x87)**: "현재 사용되는 곳 없음". 스팀 존재 시 "capsule(231x87) 이미지 업로드"(다운로드), 아니면 file input + 저장.
  3. **Library capsule (600x900)**: file input + "library 이미지 저장"(library_upload). (스팀 다운로드 버튼 없음.)
  4. **Vertical capsule (374x448)**: file input + "hero_capsule 이미지 저장"(hero_capsule_upload). 스팀 존재 시 "Vertical capsule 업로드"(다운로드, hero_374x448).
  - (주석처리된 Main capsule 616x353 — 미포함.)
- **col-6 [디스크엔]**: 4개 상태 카드(header/capsule231/library/hero) — image.directg.net 이미지 or "업로드해주세요"(http code) + 파일경로 footer. read-only.
- 인터랙션(steam_image_download.php / title_ps.php, 대부분 location.reload):
  - 스팀 다운로드(btn_upload_*) → steam_image_download.php(image_type/image_url/appid). reload.
  - 직접 업로드(btn_*_img_upload) → title_ps.php {type}_upload, multipart. **⚠️ header_upload는 location.reload 주석처리(미갱신), library/hero는 reload.**

## 데이터 (legacy)
- 로드: steam JSON header_image/capsule_image + remoteFileExist(로컬 파일/디스크엔 CDN 200·302 확인).
- 스팀 다운로드: steam CDN → 서버 디스크 저장(steam_image_download.php).
- 직접 업로드: title_ps.php {header|library|hero_capsule}_upload — 파일 저장(파일시스템).

## API 계약 (백엔드 전달)
- **`GET /admin/goods/titles/:titleId/images`** — 응답 `{ title_id, title_name, title_name_en, steam_appid, slots: { header, capsule231, library, hero } }`. 각 slot=`ImageSlotState { web_uploaded, disk_exists, steam_url }`. web_uploaded=로컬 파일 존재, disk_exists=디스크엔 존재(remoteFileExist), steam_url=스팀 소스(없으면 ""). 없으면 404.
- **`POST /admin/goods/titles/:titleId/images/download`** — 스팀 다운로드. body `{ key }`(header|capsule231|library|hero). 서버: steam CDN→디스크. 응답 `{ success }`. reload.
- **`POST /admin/goods/titles/:titleId/images/upload`** — 직접 업로드. body `{ key, file_name }`(mock 단순화). 응답 `{ success }`. (header는 legacy 미갱신 재현.)

## 타겟 매핑
- 라우트: `routes/goods/title_image_register.tsx`(search title_id) → `screens/title-image`.
- 위젯: `widgets/title-sub-nav`(active="image").
- entities/goods-title 확장: `ImageSlotKey`/`ImageSlotState`/`TitleImages` + 요청 타입, `fetchImages`+`useImages`, `downloadImage`/`uploadImage` + 훅(download·library/hero upload invalidate, header upload 미갱신).
- mock: 모듈 imageStore(Map<title, per-slot {web_uploaded,disk_exists}>). steam_url은 steam_appid로 조립. GET/download/upload 핸들러.
- 시각: 카드/버튼/경로 legacy 클래스·라벨 그대로. 슬롯 4종 정적 config(라벨/치수/업로드모드/경로)는 화면 보유, 동적 상태는 API. **header 업로드 미갱신은 legacy 그대로 재현.** remoteFileExist/steam JSON/파일 저장은 백엔드 책임. 이미지는 미업로드 시 placeholder("업로드해주세요").

## Parity 체크리스트 (셀프 검증 완료 — 개발자 승인 대기)
- [x] 레이아웃(col-2 sub-nav + col-6 웹서버 + col-6 디스크엔)
- [x] 4개 슬롯(header/capsule231/library/hero) 카드 + 라벨/치수
- [x] 스팀 다운로드 버튼(조건부 노출: header 항상, capsule231/hero steam 존재 시, library 없음) + 직접 업로드 file input/버튼
- [x] 디스크엔 상태 카드(이미지/placeholder + 파일경로)
- 보류: product_viewer 버튼 숨김 미반영(기존 단위 동일). remoteFileExist HTTP 체크·steam JSON·파일 저장은 백엔드/파일시스템 책임 — mock은 슬롯 상태(web_uploaded/disk_exists) 조작으로 흐름만 재현(업로드는 파일명만). **header 직접업로드는 legacy 미갱신 그대로 재현(invalidate 안 함).** 이미지 URL은 legacy 경로(미업로드 시 placeholder). 주석처리된 Main capsule(616x353) 미포함(legacy 동일).
- 기계 검증: tsc 0 / lint 0 / build 성공.
