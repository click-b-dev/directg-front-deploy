# 대표상품 상세 (#21)

> 영역: 상품 > 대표상품 관리 > (단일 대표상품) 상세보기. sub_sidebar_title "상세보기" / title_list 카드명 클릭 대상. **read-only 화면**.

## 원본
- 파일: `pc/_Admin_/goods/title_view.php` (739줄). 데이터 조립만(POST 처리 없음). 포함: `inc/sub_sidebar_title.php`(view active).
- 도메인: `Admin::getGoodsMediaList/getGoodsDescription/getTitleScreenshotList/getGameGrac/getSteamAppInfo/getSteamReviewInfo/getSteamPackage/getSteamDLCList/getTagName`, `Parsedown`(markdown→HTML).
- 참조: [title-modify](title-modify.md), [title-list](title-list.md).

## 화면·플로우
- 진입: `/_Admin_/goods/title_view.php?title_id=` → 타겟 `/goods/title_view?title_id=`. `$page_title="대표상품 상세보기"`. sidebar_goods + sub_sidebar_title(view active).
- breadcrumb: 홈/상품/대표상품 관리/대표상품 상세보기. 타이틀 `{title_name} <small>({en})</small>`.
- 레이아웃: col-2 sub-nav + col-10 → col-10 내부 row: **col-8(좌)** + **col-4(우)**.
- **좌 col-8**:
  1. **기본정보 card**(table): 대표상품코드, 대표상품SKU, 국문, 영문, 퍼블리셔, 개발사, **[title_code==33만] 한국어지원**(interface_korean=Y→badge secondary "인터페이스/자막", spoken_korean=Y→secondary "음성", exclusive_korean=Y→info "독점 한국어"), 게임 상세페이지 노출(is_view **원시 Y/N**), 옵션상품 판매상태(sales_status **원시 C/S/E**), 출시여부(coming_soon **원시**), 출시일(release_date), 출시예정일(coming_soon_date), 제 3자 DRM(drm_notice), 타사계정(ext_user_account_notice). footer: "기본정보 설정"→title_modify.
  2. **동영상정보 card**: iframe(src=media[0].media_url) + media 각 항목 썸네일(youtube img, youtube_media_id). **썸네일 클릭 → iframe src 전환**(핵심 인터랙션). 영상삭제 버튼(product_viewer면 숨김). footer: "동영상 설정"→title_media_register.
  3. **스크린샷정보 card**: **본문 비어있음**(screenshot 조회하나 미출력 = leftover). footer: "스크린샷 설정".
  4. **상세설명 card**(table): 게임정보(dgkr_description + about_the_game, Parsedown), 시스템 요구사항(requirements), 권리표기(legal_text). footer: "상세설명 설정".
- **우 col-4**:
  1. **이미지정보 card**: header 이미지(`/upload/title/{id}/header/{id}.jpg`), footer=short_description.
  2. **심의정보 card**: `if($title_data['title_id']=="33")` — ⚠️ **legacy 버그: title_code가 아닌 title_id를 "33"과 비교** → title_id는 숫자(1001…)라 **사실상 항상 미표시**. 그대로 재현(항상 숨김). 내용: 등급분류번호(rateno), 기관(grac.orgname), 신청업체명(grac.entname), 등급분류일자(grac.rateddate), 결정등급(grac.givenrate), 내용정보표시(grac.descriptors). footer: "심의정보 설정".
  3. **태그정보 card**: 장르(genre → badge bg-primary), 카테고리(category → bg-info), 태그(tags → 접두문자 색상: G=primary, M=success, T=info, V=warning, A=secondary, F=dark, 기본=secondary). 각 getTagName. footer: "태그 설정"→title_tag_register.
  4. **Steam 부가정보 card**: `if title_code==33` — Appid, name, 제3자 DRM, 타사 계정, 추천수(number_format), 리뷰 평가(review_score (desc)), 긍정 리뷰수(total_positive (%)), Package 현황(list), DLC 현황(list). footer: "Steam 정보 자세히보기"→steam_app_meta.
  5. **특전 및 구성안내 card**: `if strpos(description,'게임 정보')` — description을 '게임 정보'로 split 후 [0] Parsedown.
- JS: `.youtube_thumbnail` 클릭→#media_player src 변경(재현). 그 외 script 핸들러(option/dlc/youtube 등록·삭제, short/description/requirements/legal 저장)는 **이 페이지에 없는 요소 대상 = leftover**(youtube delete 제외). 영상삭제(btn_youtube_delete)는 실제 존재(product_viewer 숨김).

## 데이터 (legacy)
- `SELECT * FROM tbl_goods WHERE title_id`(기본정보 + genre/category/tags 콤마열 + rateno/steam_appid/drm_notice/ext_user_account_notice).
- media: tbl_goods_media(video). description: tbl_goods_description(dgkr_description/about_the_game/requirements/legal_text/short_description/description). grac: tbl_grac(rateno 기준). steam: tbl_steam_app/review/package/dlc(steam_appid 기준). tag/genre/category 이름: getTagName.

## API 계약 (백엔드 전달)
- **`GET /admin/goods/titles/:titleId/view`** — 상세 read-only 데이터. 응답 `GoodsTitleView`:
  - 기본: title_id, sku, title_name, title_name_en, publisher, developer, title_code, interface_korean, spoken_korean, exclusive_korean, is_view, sales_status, coming_soon, release_date, coming_soon_date, drm_notice, ext_user_account_notice, rateno, steam_appid, short_description.
  - media: `{ youtube_media_id, media_thumb, media_url }[]`.
  - description(**HTML 렌더 완료** — 백엔드 Parsedown 책임): `{ game_html, requirements_html, legal_text_html }`. perks_html: string|null(description에 '게임 정보' 포함 시 split[0] 렌더, 아니면 null).
  - grac: `{ orgname, entname, rateddate, givenrate, descriptors } | null`.
  - tags: 장르 `genres:{code,name}[]`, 카테고리 `categories:{code,name}[]`, 태그 `tags:{code,name}[]`(code 접두문자로 색상).
  - steam(title_code==33): `{ steam_appid, name, drm_notice, ext_user_account_notice, recommendations, review_score, review_score_desc, total_positive, total_reviews, packages:{package_name,packageid}[], dlcs:{name,steam_appid}[] } | null`.
  - 없으면 404 `NOT_FOUND`.
  - ⚠️ markdown은 프론트 미렌더(의존성 회피) — 백엔드가 HTML 반환, 프론트는 `.description`에 dangerouslySetInnerHTML.
- **`DELETE /admin/goods/titles/:titleId/media/:youtubeMediaId`** — 영상 삭제(legacy goods_ps.php delete_youtube). 응답 `{ success }`. 성공 시 view invalidate(legacy location.reload).

## 타겟 매핑
- 라우트: `routes/goods/title_view.tsx`(search title_id) → `screens/title-view`. sub-nav active="view".
- entities/goods-title 확장: `GoodsTitleView` 타입, `fetchTitleView`+`useTitleView`, `deleteTitleMedia`+`useDeleteTitleMedia`.
- 위젯: `widgets/title-sub-nav`(재사용, active="view").
- mock: GoodsTitleRow 기반 + view 전용 샘플(media/description HTML/steam/tags). GET `/:titleId/view`, DELETE media.
- 시각: 카드/table/badge legacy 클래스 그대로. 심의정보는 title_id=="33" 게이트(버그 재현=항상 숨김). description HTML은 dangerouslySetInnerHTML.

## Parity 체크리스트 (셀프 검증 완료 — 개발자 승인 대기)
- [x] 레이아웃(col-2 sub-nav, col-8/col-4) + 카드 구성/순서
- [x] 기본정보 원시값 표기(is_view/sales_status/coming_soon raw), 한국어지원 badge(33한정)
- [x] 동영상 iframe + 썸네일 클릭 전환 + 영상삭제(useDeleteTitleMedia)
- [x] 상세설명/특전 HTML 렌더(dangerouslySetInnerHTML), 태그 badge 색상(접두문자 G/M/T/V/A/F)
- [x] 심의정보 title_id=="33" 게이트(버그 재현=항상 숨김), Steam 부가정보 title_code==33
- 보류: product_viewer 영상삭제 숨김 미반영(#19/#20 동일). 스크린샷 본문은 legacy 그대로 비움. markdown은 백엔드 HTML 계약(프론트 미렌더). 심의정보 배지 gate가 legacy 버그라 화면상 항상 숨김(콘솔/mock으로만 확인 가능).
- 기계 검증: tsc 0 / lint 0 / build 성공.
