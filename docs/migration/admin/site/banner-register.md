# 배너 등록 폼 (M2-9)

## 원본
- 파일: `pc/_Admin_/site/banner_register.php` (라이브 단일). 처리: `site/banner_proc.php`(mode=register, banner_link_search).
- 참조: [banner-list](banner-list.md)(같은 도메인·목록), `docs/design-system/admin.md`.

## 화면·플로우
- 진입 URL: `/_Admin_/site/banner_register.php` → 타겟 `/site/banner_register`. sidebar 레이아웃, `$page_title="메인배너 등록"`.
- breadcrumb: 홈 / 사이트 / **사이트 관리** / 메인배너 등록 (list와 3번째 항목 다름).
- 폼: `col-9 > card > card-body > form#bannerFrm method=post action=banner_proc.php`, hidden `mode=register`. 필드(라벨 `*`=필수 표기):
  1. `banner_title` text **required** — "* 메인배너 제목".
  2. `banner_pc` text **required** — "* 메인배너 PC URL", ph "디스크엔 이미지 URL".
  3. `banner_mobile` text **required** — "* 메인배너 모바일 URL".
  4. `product_code` text maxlength=8 (required 아님) — "옵션상품코드" + 버튼 `#btn_banner_link_auto` "링크 URL 자동생성".
  5. `banner_link` text **required** — "* 메인배너 링크 URL" + `banner_target` select **required**(""=":::타겟선택:::" / `_self` 현재창 / `_blank` 새창).
  6. `banner_publisher` text **required** — "* 메인배너 퍼블리셔".
  7. `flag` radio Y(예)/N(아니오), **기본 N checked** — "* 메인배너 노출여부".
  8. `bannerPeriodOutputFl` radio N(상시노출)/Y(기간노출), **기본 Y checked** — "* 메인배너 기간". + `#bannerPeriodDate`(banner_start ~ banner_end, text, input-mask `0000-00-00 00:00:00`).
  9. `banner_sort` text **required** — "* 메인배너 순서".
  10. `show_prod_info` radio Y/N (기본 없음, required 아님) — "* 상품정보 노출여부 (라벨, 상품명)".
  11. `show_sale_info` radio Y/N (기본 없음, required 아님) — "* 판매정보 노출여부 (퍼블리셔, 가격, 출시일)".
  12. submit `button.btn-primary` "메인배너 저장".
- JS 동작:
  - `#btn_banner_link_auto` click: `preventDefault`. product_code 비면 `alert("옵션상품코드를 입력해 주세요")` return. 아니면 AJAX(banner_link_search) → 응답을 `#banner_link`에 채움.
  - `bannerPeriodOutputFl` change: `N`(상시노출) → `#bannerPeriodDate` 숨김 + start/end `required=false`. `Y`(기간노출) → 표시 + `required=true`. **초기 Y라 날짜 표시·필수**.
  - 검증: HTML5 `required` 속성(브라우저 네이티브). show_prod_info/show_sale_info는 required·기본값 **없음**(라벨 `*`는 표기만).
- 제출: native POST → INSERT → `go("banner_list.php")`(목록 리다이렉트).

## 데이터 (legacy)
- INSERT `tbl_main_banner` SET (banner_proc.php register): banner_title, banner_pc, banner_mobile, product_code, banner_publisher, banner_link, banner_target, `banner_start=strtotime($banner_start)`, `banner_end=strtotime($banner_end)`, banner_sort, flag, bannerPeriodOutputFl, show_prod_info, show_sale_info, `reg_date=now()`. (`is_del` 미지정 → 기본 'N' 가정.)
  - ⚠️ 상시노출(bannerPeriodOutputFl='N')이면 start/end 빈 문자열 → `strtotime('')=false` → 0/빈값 저장.
- banner_link_search(banner_proc.php): `select goods_sku,game_type,product_platform from tbl_goods_item where product_code=:pc` → game_type 분기로 링크 URL 조립. game/accessories는 `AdminGoods::getTitleInfo`로 product_id(sku) 추가.
  - game → `/game/game_view.html?product_id={sku}&sku={goods_sku}&platform={platform}`
  - dlc/music → `/game/dlc_view.html?sku={goods_sku}&platform={platform}`
  - bundle → `/game/bundle_view.html?sku={goods_sku}&platform={platform}`
  - accessories → `/game/goods_item_view.html?product_id={sku}&sku={goods_sku}&platform={platform}`
  - 미존재 product_code → 빈 문자열.

## API 계약 (백엔드 전달)
- **`POST /admin/site/main-banners`** — 등록. body(문자열 그대로, 날짜는 "YYYY-MM-DD HH:MM:SS"):
  `{ banner_title, banner_pc, banner_mobile, product_code, banner_publisher, banner_link, banner_target, banner_start, banner_end, banner_sort, flag, bannerPeriodOutputFl, show_prod_info, show_sale_info }`.
  - 서버: `banner_start/end`는 strtotime 변환(빈값→0), `reg_date=now()`, `is_del='N'`. 응답 `{ success: true }`.
- **`GET /admin/site/banner-link?product_code=`** — 링크 자동생성. 응답 `{ banner_link: string }`(미존재/빈값→`""`).
  - **백엔드 책임**: tbl_goods_item + game_type 분기 로직(위). 서버측 관리자 권한 강제.

## 타겟 매핑
- 라우트: `routes/site/banner_register.tsx` → `screens/banner-register`.
- entities/main-banner 확장: `CreateMainBannerRequest` 타입, `createMainBanner` fetcher + `useCreateMainBanner`(성공 시 목록 invalidate), `searchBannerLink(product_code)` fetcher.
- 폼 상태: `bannerPeriodOutputFl`만 React state(날짜 표시/required 토글). 나머지는 uncontrolled + HTML5 required. 제출 시 `onSubmit`에서 FormData 수집 → create → `/site/banner_list` 이동.
- mock: create handler(insert, 새 idx=max+1), banner-link handler(샘플 product_code 맵 — 실제 goods_item 분기는 백엔드).
- 날짜 input-mask: legacy Hyper `$(obj).mask("0000-00-00 00:00:00")`(jQuery Mask Plugin)를 `shared/lib/input-mask`(`applyMask(value, format)`)로 재현 — CSS-only라도 **기능적 동작**이므로 React로 이식(입력 시 자동 `-`/`:` 삽입). banner_start/end는 controlled.

## Parity 체크리스트 (개발자 승인 완료 — ✅ 검증완료)
- [x] breadcrumb/page-title/폼 필드·라벨·placeholder·required 일치
- [x] flag 기본 N / bannerPeriodOutputFl 기본 Y / target select 옵션 일치
- [x] 기간노출 토글: N→날짜 숨김·required 해제, Y→표시·required (required는 라디오 change 후 — legacy 버그 이식)
- [x] 링크 자동생성: 빈 코드 alert / 응답을 banner_link에 반영
- [x] 저장 → INSERT 계약(날짜 strtotime) → 목록 이동
- 기계 검증: tsc 0 / lint 0 / build 성공(485 modules).

## 보류 (다음 단위)
- mock `MainBannerRow`는 `show_prod_info`/`show_sale_info` 컬럼 미모델 → register 시 계약엔 포함되나 mock 저장은 생략(리스트 미표시). **#10(수정)에서 폼 로드가 필요하면 테이블 확장.**
- `banner-link` mock은 샘플 product_code(DG20001/3/5)만 illustrative. 실제 game_type 분기는 백엔드(tbl_goods_item).
- (해결됨) 날짜 input-mask는 `shared/lib/input-mask`로 재현 완료 — 개발자 지적 반영. admin 타 폼(다른 mask-format)에서 `applyMask` 재사용.
