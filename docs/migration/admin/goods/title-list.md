# 디지털상품 목록 (#16)

> 영역: 상품 > 대표상품 관리 > 디지털상품 목록. **최대 복잡도 단위** — 9필터 + 상품별 대형 카드(5패널) + 6테이블 enrichment.

## 원본
- 파일: `pc/_Admin_/goods/title_list.php` (757줄). 도메인: `Admin::getGoodsList`(Pagination.php, **results_per_page=10**).
- 참조: `docs/legacy-admin/20-goods-catalog.md`.

## 화면·플로우
- 진입: `/_Admin_/goods/title_list.php?page=&search_*` → 타겟 `/goods/title_list`(스텁 존재, 교체). sidebar_goods, `$topmenu['goods']=active`.
- breadcrumb: 홈/상품/대표상품 관리/디지털상품 목록.
- **검색필터 카드**("대표상품 검색필터"): 9종.
  - `search_key` select(대표상품명/코드/sku/퍼블리셔/개발사) + `search_value` text.
  - `search_age_limit` radio(10 전체이용가/12/15/19 청불) — 뱃지 라벨.
  - `search_is_view` radio(all 전체/Y 진열함/N 진열안함, 기본 all).
  - `search_sales_status` radio(C 판매예정/S 판매중/E 판매종료).
  - `search_interface_korean`/`search_subtitle_korean`/`search_spoken_korean`/`search_exclusive_korean` — 각 checkbox(Y 지원/N 미지원).
  - "대표상품 검색" 버튼.
- 카운트 `{total} 개` + "대표상품 등록"(→ title_register.php).
- **상품별 카드**(테이블 아님): 각 tbl_goods 행 1카드.
  - card-header: 드롭다운(dripicons-dots-3) 8액션 링크(자세히보기/기본정보·심의정보·태그정보·동영상·스크린샷·이미지·상세설명·관련상품 설정 → 각 title_*.php?title_id) + `h5.card-title`: `{title_name} ({title_name_en}) [{sku}]`.
  - card-body: `.title-container` 5패널:
    - **title-a**: header 이미지(`/upload/title/{title_id}/header/{title_id}.jpg`) + 기본정보 table(대표상품번호/퍼블리셔/개발사/출시일/한국어지원 뱃지[인터페이스/자막/음성/독점]) + 진열정보 table(진열상태=is_view, 판매상태 C→[판매예정]/S→[판매중]/E→[판매종료]).
    - **title-b**: 관련상품정보 table — 옵션구분×판매예정(9)/판매중(0)/판매종료(3), 6행: 기본게임/에디션/DLC/홀로모델/홀로모델 에디션/홀로모델 DLC (각 카운트).
    - **title-c**: 심의정보 table(등급분류기관/심의업체명/등급분류일자/결정등급/내용정보표시 — grac_list by rateno).
    - **title-d**: 부가정보 table(Steam Appid + [미동기화 시 "스팀 동기화" 버튼], 프랜차이즈명[franchise_idx>0], 제3자 DRM, 타사 계정, 조회수 hit).
    - **title-tag**: 태그정보(대표장르 badges[genre codes→tag_name], 카테고리 badges[category codes→tag_name]).
- 페이지네이션(ServerPagination).
- (JS: btn_steam_sync AJAX — 스팀 동기화. 이 단위 범위: 버튼 렌더 + 동기화 계약만, 실동작은 후속/백엔드.)

## 데이터 (legacy)
- 목록: `select * from tbl_goods where 1=1 and title_code='33' {필터} order by title_id desc` LIMIT 10.
  - 필터: title_name/en LIKE, title_id=, sku=, publisher LIKE, developer LIKE, sales_status=, is_view=, interface/spoken/exclusive/subtitle_korean=, age_limit=.
- enrichment(페이지 결과 title_id들 대상 일괄):
  - **counts**: `tbl_title_option a JOIN tbl_goods_item b` group by title_id → 18개 SUM(status 9/0/3 × game/edition/dlc/holo/holo_edition/holo_dlc).
  - **grac**: `grac_list where rateno in(...)` → orgname/entname/givenrate/rateddate/descriptors.
  - **steam**: `steam_game where title_id in(...) and app_type='game'` → steam_appid 존재 여부(동기화 버튼 표시 판단).
  - **franchise**: `tbl_franchise where idx in(...)` → franchise_name.
  - **tags**: `tbl_tags where tag_code in(...)` → tag_name(genre+category 코드).
- tbl_goods 주요 컬럼: title_id, title_code, title_name, title_name_en, sku, publisher, developer, release_date, interface_korean, subtitle_korean, spoken_korean, exclusive_korean, is_view, sales_status(C/S/E), rateno, steam_appid, franchise_idx, drm_notice, ext_user_account_notice, hit, genre(csv), category(csv), age_limit.

## API 계약 (백엔드 전달)
- **`GET /admin/goods/titles`** — query: page, search_key, search_value, search_is_view, search_sales_status, search_age_limit, search_interface_korean, search_subtitle_korean, search_spoken_korean, search_exclusive_korean. `title_code='33'` 강제, order title_id desc, 10/page.
  - 응답: `{ items: GoodsTitleListItem[], pagination }`. **서버가 enrichment 완결**(counts/grac/steam_synced/franchise_name/genres[]/categories[]).
  - `GoodsTitleListItem`: `{ title_id, title_name, title_name_en, sku, publisher, developer, release_date, interface_korean, subtitle_korean, spoken_korean, exclusive_korean, is_view, sales_status, steam_appid, steam_synced, franchise_idx, franchise_name, drm_notice, ext_user_account_notice, hit, rateno, age_limit, counts: {game_9,game_0,game_3, edition_*, dlc_*, holo_*, holo_edition_*, holo_dlc_*}, grac: {orgname,entname,rateddate,givenrate,descriptors}|null, genres: {code,name}[], categories: {code,name}[] }`.
- **`POST /admin/goods/titles/{title_id}/steam-sync`** — body `{ steam_appid }` → 스팀 동기화(백엔드). 응답 `{success}`. **백엔드 책임**: steam API 연동.
- 백엔드 책임: 6테이블 조인 enrichment, 서버측 권한.

## 타겟 매핑
- 라우트: `routes/goods/title_list.tsx`(스텁 교체, search 다필터) → `screens/title-list`.
- entities: `entities/goods-title`(types, fetcher/훅: list + steam-sync).
- mock: `db/tables/goods-title`(enriched shape 직접 보관 — 실제 6조인은 백엔드; mock 단순화) + handler(필터/페이징).
- 재사용: ServerPagination. 드롭다운은 Hyper `.dropdown`(topbar에서 검증된 방식) — CSS-only면 React 제어. 액션 링크 대상(title_*.php)은 미이관 → 링크만.

## 참고/보류
- **`.title-container`/`.title-a`~`.title-tag`는 legacy CSS 미정의** → 스타일 없이 세로 스택 렌더(legacy 동일). 추가 CSS 불필요.
- **드롭다운 8액션 링크·steam 동기화**: Bootstrap `.dropdown`을 React 상태로 재현. 액션 대상(title_view/modify/grac 등)은 미이관 라우트 → 링크만(후속 단위).
- **⚠️ 사이드바 영역 전환 미구현**: 현재 Sidebar 위젯은 site 트리 하드코딩(#4에서 보류)이라 goods 페이지에서도 site 사이드바가 표시됨. **sidebar_goods(대형 메뉴 트리) 이관은 별도 단위 필요.** title_list 콘텐츠·topbar active는 정상.
- steam_sync mock은 steam_synced=true 처리만(실제 steam API 백엔드).

## Parity 체크리스트 (개발자 승인 완료 — ✅ 검증완료)
- [x] breadcrumb/제목/검색필터 9종(select/text/radio/checkbox·checked 상태)
- [x] 카운트·등록 버튼·페이지네이션(10/page)
- [x] 상품 카드: 드롭다운 8액션 + title/en/sku
- [x] title-a(이미지+기본정보 한국어 뱃지+진열/판매상태)
- [x] title-b 관련상품 카운트 6행×3
- [x] title-c 심의정보(grac) / title-d 부가정보(steam+동기화버튼·프랜차이즈·DRM·조회수) / title-tag(장르·카테고리 뱃지)
- [x] 필터 동작(title_code='33', 각 조건)
- 기계 검증: tsc 0 / lint 0 / build 성공(468 modules).
