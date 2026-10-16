# 옵션상품 스크린샷 설정 (#46)

> 영역: 상품 > 옵션상품 관리 > 옵션상품 스크린샷 설정. 옵션 sub-nav "옵션상품 스크린샷 설정"(screenshot active, **game_type in {dlc, accessories} 조건부 노출**). 대표상품 스크린샷(#26)과 동일 패턴 — product_code 기반. page_title "DLC 스크린샷 설정".

## 원본
- 파일: `goods_option_screenshot_register.php`(417줄). 처리: `goods_option_ps.php`(screenshot_upload/screenshot_sort_up/screenshot_sort_down) + `../steam/steam_screenshot_download.php`(steam 다운로드/삭제). 포함: `inc/sub_sidebar_option.php`(screenshot active).
- 도메인: `AdminGoods::getProductScreenshotList`, steam JSON(`apps_{appid}.json`/`_coming.json`), `Admin::remoteFileExist`(디스크엔 확인).
- 참조: [title-screenshot](title-screenshot.md)(#26 대표상품판, 동일 골격).

## 화면·플로우
- 진입: `?product_code=` → `/goods/goods_option_screenshot_register?product_code=`. 레이아웃 col-2 sub-nav + **col-7** + **col-3**.
- page-title: `product_name <small>(en)</small>` + 뱃지 2개(game_type / platform_name). breadcrumb "DLC 스크린샷 설정".
- **col-7 카드1 "옵션상품 스크린샷"**: 메인 미리보기 img(screenshots[0].url) + 썸네일 목록(클릭→메인 전환, "스크린샷 N 삭제") + card-footer 스팀 후보(최대 10, 완료 or "스크린샷 N 다운로드").
- **col-7 카드2 "옵션상품 스크린샷 직접업로드"**: 크기 안내(856x480 / 112x63) + file input + "스크린샷 업로드"(screenshot_upload).
- **col-3 카드 "디스크엔 업로드 상태"**: **remoteFileExist==200 항목만** list-group — sort + 썸네일(image.directg.net) + 정렬 위/아래 버튼. (#26 title과 달리 경로 안내문·"스크린샷 num" span 없음 — 옵션판은 단순.)
- 인터랙션:
  - 썸네일 클릭 → 메인 전환(클라이언트).
  - 삭제(btn_screenshot_delete) → steam_screenshot_download.php(image_type=screenshot_delete). **⚠️ 주1: location.reload 주석처리 = 삭제 후 미갱신(legacy 미완성). 그대로 재현(invalidate 안 함).**
  - 스팀 다운로드 → steam_screenshot_download.php → reload.
  - 업로드(btn_upload_screenshot) → goods_option_ps.php screenshot_upload → reload.
  - 정렬 위/아래 → goods_option_ps.php screenshot_sort_up/down → reload.

## 데이터 (legacy)
- 로드: tbl_goods_item(product_name/en/game_type/steam_appid/product_platform) + getProductScreenshotList(등록 스크린샷) + steam JSON(다운로드 후보) + remoteFileExist(디스크엔).
- **screenshot_sort_up/down**(goods_option_ps): UPDATE sort ∓1 WHERE idx.
- **screenshot_upload**: 파일 저장 + INSERT(파일시스템).
- **삭제/다운로드**(steam_screenshot_download.php): 파일/행 삭제, steam CDN 다운로드.

## API 계약 (백엔드 전달)
- **`GET /admin/goods/options/:productCode/screenshots`** — `{ product{product_name,product_name_en,game_type,platform_name,steam_appid}, screenshots: [{idx,screenshot_num,url,thumbnail,sort,disk_exists}](sort 오름차순), steam_candidates: [{id,path_full,path_thumbnail,downloaded}] }`. 없으면 404.
- **`DELETE /admin/goods/options/:productCode/screenshots/:screenshotNum`** — `{ success }`. (legacy 미갱신 — invalidate 안 함, 주1.)
- **`POST /admin/goods/options/:productCode/screenshots/sort`** — body `{ idx, dir: "up"|"down" }`. sort ∓1. reload.
- **`POST /admin/goods/options/:productCode/screenshots/download`** — body `{ id, path_full, path_thumbnail, num }`. steam 다운로드. reload.
- **`POST /admin/goods/options/:productCode/screenshots/upload`** — body `{ file_name }`(mock 단순화). reload.

## 타겟 매핑
- 라우트: `routes/goods/goods_option_screenshot_register.tsx`(search product_code) → `screens/goods-option-screenshot`.
- 위젯: `widgets/option-sub-nav`(active="screenshot", gameType=data.product.game_type).
- entities/goods-option 확장: `OptionScreenshotItem`/`OptionSteamScreenshotCandidate`/`OptionScreenshotData` + 요청 타입 + `fetchOptionScreenshots`/`deleteOptionScreenshot`/`sortOptionScreenshot`/`downloadOptionScreenshot`/`uploadOptionScreenshot` + 훅(삭제=invalidate 안 함, 나머지=invalidate).
- mock: `screenshotStore`(Map<code, items>) + steam candidates 샘플. GET/DELETE/sort/download/upload.
- 시각: 카드/리스트/버튼 legacy 클래스 그대로. 썸네일 클릭 전환. **삭제 no-reload 재현**. steam JSON/이미지·파일 업로드는 백엔드/파일시스템 책임(mock store 조작).

## Parity 체크리스트
- [ ] page-title(뱃지 game_type/platform) + breadcrumb "DLC 스크린샷 설정"
- [ ] col-7 미리보기+썸네일(클릭전환)+삭제(no-reload) + 스팀후보(완료/다운로드) + 직접업로드
- [ ] col-3 디스크엔(disk_exists 항목만) + 정렬 위/아래(sort ∓1) reload
- [ ] product_viewer 버튼 숨김
- [ ] 삭제 no-reload(주1) — 게이트 판단
