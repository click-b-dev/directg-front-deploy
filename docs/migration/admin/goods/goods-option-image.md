# 옵션상품 이미지 설정 (#38)

> 영역: 상품 > 옵션상품 관리 > 이미지 설정. 옵션 sub-nav "이미지 설정". **header 슬롯 단일**(웹서버 업로드/스팀 다운로드 + 디스크엔 read-only 상태). 대표상품 이미지(#27, 4슬롯)의 축소판.

## 원본
- 파일: `pc/_Admin_/goods/goods_option_image_register.php`(337줄). 처리: `goods_option_ps.php`(case `header_upload`) + `../steam/steam_image_download2.php`(스팀 다운로드). 포함: `inc/sub_sidebar_option.php`(image active).
- 도메인: `Admin::remoteFileExist`(HTTP 존재확인), steam JSON(`apps_{appid}.json` / `apps_{appid}_coming.json`), steamstatic CDN, image.directg.net(디스크엔).
- 참조: [title-image](title-image.md)(대표상품 4슬롯 버전), [goods-option-tag](goods-option-tag.md).

## 화면·플로우
- 진입: `/_Admin_/goods/goods_option_image_register.php?product_code=` → 타겟 `/goods/goods_option_image_register?product_code=`. 레이아웃 col-2 sub-nav + col-10 → row(col-6 [웹서버] + col-6 [디스크엔]).
- page-title: `product_name(product_name_en)`, 뱃지 없음. breadcrumb 마지막 "이미지 설정".
- **col-6 [웹서버]** — form(action `goods_option_ps.php`, hidden `mode=image_upload`, multipart. 실제 submit 없음 — 버튼은 전부 AJAX) → card "옵션상품 이미지 설정" → inner card "웹서버 header 이미지 (460x215)":
  - card-body: 로컬 `/upload/product/{code}/header/header.jpg` 존재 시 `<img>`, 없으면 "header 이미지를 업로드해주세요"(text-danger).
  - card-footer:
    - `$header_url` 계산: `steam_appid>0` → steam JSON `header_image` 있으면 그 값, 없으면 steamstatic CDN(`.../store_item_assets/steam/apps/{appid}/header.jpg`); appid 0이면 "".
    - **조건 `display_type=='basic' || 'dlc'`**: `<span>{header_image}</span>`(json 값, 없으면 빈칸) + (`!product_viewer`) "header 이미지 업로드" 버튼(스팀 다운로드, data-type=`header_460x215`, data-url=`header_url`).
    - file input(`header_img`, required) + (`!product_viewer`) "header 이미지 저장" 버튼(직접 업로드).
- **col-6 [디스크엔]** — card "디스크엔 (https://www.diskn.com/)":
  - card-body: image.directg.net header.jpg `remoteFileExist==200`이면 `<img>`, 아니면 "디스크엔에 이미지를 업로드해주세요."(text-danger, text-center).
  - card-footer: `이미지 전체경로: \upload\product\{code}\header\header.jpg`.
- 인터랙션(둘 다 성공 시 `alert(data)` + `location.reload()`):
  - **스팀 다운로드**(btn_upload_header) → `steam/steam_image_download2.php`(product_code/image_type/image_url/packageid/appid). reload.
  - **직접 업로드**(btn_header_img_upload) → `goods_option_ps.php` mode=`header_upload`, multipart(product_code/appid/packageid/header_img). reload.
  - (JS의 btn_upload_package·btn_capsule_img_upload는 **데드코드** — 해당 HTML(capsule/package 슬롯) 미렌더. 옵션 이미지는 header 슬롯만.)

## 데이터 (legacy)
- 로드: `tbl_goods_item`(product_name/steam_appid/display_type/packageid) + steam JSON header_image + `remoteFileExist`(로컬 파일/디스크엔 CDN 200 확인).
- `header_upload`(goods_option_ps.php): 파일 크기 1MB 초과 시 `msg(...,-1)` 에러 exit. `/upload/product/{code}/header/header.jpg` 저장. `appid>0`이면 `setSteamImageChk(appid,'is_header','200')`. (리다이렉트 없음 — AJAX.)
- 스팀 다운로드(steam_image_download2.php): steam CDN → 서버 디스크 저장.

## API 계약 (백엔드 전달)
- **`GET /admin/goods/options/:productCode/images`** — 응답 `{ product_code, product_name, product_name_en, steam_appid, display_type, packageid, header_image, steam_url, web_uploaded, disk_exists }`.
  - `header_image` = steam JSON 값(span 표시, 없으면 ""). `steam_url` = 다운로드 버튼 data-url(header_image 또는 steamstatic CDN, appid 0이면 ""). `web_uploaded` = 로컬 header.jpg 존재. `disk_exists` = image.directg.net remoteFileExist 200. 없으면 404.
- **`POST /admin/goods/options/:productCode/images/download`** — 스팀 다운로드. body `{ image_type: "header_460x215", image_url, packageid, appid }` → `{ success }`. 서버: steam CDN→디스크 저장(=web_uploaded true). reload.
- **`POST /admin/goods/options/:productCode/images/upload`** — 직접 업로드. body `{ file_name }`(mock 단순화). 서버: 1MB 제한·파일 저장·setSteamImageChk. `{ success }`. reload.
  - 백엔드 책임: 1MB 초과 검증(`msg`), 파일시스템 저장, remoteFileExist HTTP 체크, steam JSON 파싱.

## 타겟 매핑
- 라우트: `routes/goods/goods_option_image_register.tsx`(search product_code) → `screens/goods-option-image`.
- 위젯: `widgets/option-sub-nav`(active="image", gameType는 스크린샷 노출 판정용 — 이미지 화면은 미사용이라 ""·실제 game_type 전달).
- entities/goods-option 확장: `OptionImages`/요청 타입 + `fetchOptionImages`/`downloadOptionImage`/`uploadOptionImage` + `useOptionImages`/`useDownloadOptionImage`/`useUploadOptionImage`(download·upload 모두 invalidate — legacy location.reload 재현).
- mock: `optionImageStore`(Map<code,{web_uploaded,disk_exists}>) + steam_url/header_image는 appid로 조립. GET/download/upload 핸들러.
- 시각: 카드/버튼/경로/문구 legacy 클래스·라벨 그대로. header 슬롯 단일. 스팀 다운로드 블록은 `display_type in {basic,dlc}`에서만 노출. `product_viewer` 시 두 버튼 숨김(input/span은 유지). 미업로드 시 placeholder.

## Parity 체크리스트
- [ ] page-title product_name(영문), breadcrumb "이미지 설정"
- [ ] col-6 웹서버(header 460x215 카드) + col-6 디스크엔 카드
- [ ] 웹서버: 로컬 img/placeholder, 스팀 다운로드 블록(display_type basic/dlc 조건), file input+저장 버튼
- [ ] 디스크엔: image.directg.net img/placeholder + 파일경로 footer
- [ ] 다운로드/업로드 → invalidate(reload 재현), product_viewer 버튼 숨김
