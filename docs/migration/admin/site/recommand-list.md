# 추천 및 특집 목록 (+정렬·삭제)

> 영역: 사이트 > 추천 및 특집 관리. 단위 분해: **목록(본 문서)** / 등록 / 수정.

## 원본
- 파일: `pc/_Admin_/site/main_recommand.php` + `main_recommand_ps.php`(sort/delete).
- 도메인: `AdminSite::getMainRecommandList`(Pagination.php, results_per_page=20), `AdminGoods::getGoodsOptionSearch`(상품 enrich).
- 참조: [banner-list](banner-list.md)(동일 구조), `docs/legacy-admin/10-site-policy-tag-api.md`.

## 화면·플로우
- 진입: `/_Admin_/site/main_recommand.php?page=&search_recommand_name=` → 타겟 `/site/main_recommand`. sidebar_site, `$topmenu['site']=active`, `$page_title="추천 및 특집 관리"`.
- breadcrumb: 홈 / 사이트 / **배너 관리** / 추천 및 특집 관리. ⚠️ 3번째 "배너 관리"는 복붙 잔재 — **그대로 이식**.
- 검색필터 카드: "추천 및 특집 제목" input + "추천 및 특집 검색" 버튼.
- 카운트/등록: `number_format(total) 개` + `추천 및 특집 등록`(→ main_recommand_register.php).
- 테이블 8열(`table table-centered w-100 nowrap table-sm table-bordered border-light`, colgroup 5/15/*/30/16/6/6/8%):
  1. 순서: `recommand_sort` + ↑↓(`btn_sort_up`/`btn_sort_down`).
  2. 추천 및 특집 배너: `a[href=recommand_banner_link target=_blank] > img[src=recommand_banner alt="{recommand_title} 배너 이미지"]`.
  3. 추천 및 특집 제목: `recommand_name`.
  4. 추천 및 특집 상품: `ul.list-group.list-group-numbered` — **항상 4 li**, 각 `{product_code} / {product_name} / {game_type}` (recommand_goods_1~4를 `getGoodsOptionSearch`로 조회, 빈 슬롯은 ` /  / ` 공백).
  5. 기간: `date('Y-m-d H:i:s',recommand_start) ~ date(...,recommand_end)`.
  6. 상태(is_view=="Y"일 때만 표시, 독립 if): `recommand_start-now>0` → "게시예정"(텍스트) / `start<now<end` → `badge.bg-success "게시중"` / `end<now` → `badge.bg-secondary "게시종료"`. is_view≠Y → 아무것도 안 보임(배너와 달리 상시노출 없음).
  7. 노출여부: `is_view` 원문(Y/N).
  8. 관리: 수정(→main_recommand_modify.php?idx) + 삭제 버튼.
- 페이지네이션: Pagination.php(=배너와 동일, ServerPagination 재사용).

### legacy 버그 처리
- **검색 무효(수정됨)**: legacy는 폼 `name="search_recommand_name"` vs PHP `filter_input('search_banner_title')` 불일치로 검색이 완전 무효였다. **개발자 지시로 수정** — `search_recommand_name`으로 `recommand_name` LIKE 필터가 실제 동작한다(라우트/입력 id/handler 파라미터 정렬).
- sort ↑↓: 인접 swap 아닌 `recommand_sort ±1`(배너 동일 버그) — 그대로.
- **img alt 빈 제목**: 배너 이미지 `alt="{recommand_title} 배너 이미지"`인데 `recommand_title`은 tbl_main_recommand에 **없는 컬럼** → 항상 빈값 → `alt=" 배너 이미지"`. (제목 컬럼은 `recommand_name`을 씀.) 그대로 이식 — mock 이미지가 깨질 때 alt가 노출돼 확인 가능.

### 행 액션 (main_recommand_ps.php, AJAX POST → reload)
- `recommand_sort_up`: `recommand_sort=recommand_sort-1 where idx`.
- `recommand_sort_down`: `recommand_sort=recommand_sort+1 where idx`.
- `delete`: `confirm("해당 추천 및 특집을 삭제하시겠습니까?")` → `is_del='Y' where idx`(소프트).

## 데이터 (legacy)
- SQL: `select * from tbl_main_recommand where 1=1 and is_del='N' [and recommand_name like '%q%'] order by recommand_sort asc` + LIMIT 20. (단, q는 위 버그로 항상 미적용.)
- `getGoodsOptionSearch(code)`: `select product_code,product_name,game_type,product_platform from tbl_goods_item where product_code=:code` — 단건.
- `tbl_main_recommand` 컬럼: idx, recommand_name, recommand_start(epoch), recommand_end(epoch), recommand_banner, recommand_banner_link, recommand_banner_target, recommand_goods_1~4(product_code), recommand_sort(int), is_view(Y/N), reg_date, is_del(Y/N).

## API 계약 (백엔드 전달)
- **`GET /admin/site/main-recommands`** — 목록. query: `page`, `search_banner_title`(⚠️ 폼은 search_recommand_name 전송 → 서버는 search_banner_title로 필터 = legacy 버그 유지). is_del='N', order recommand_sort asc, 20/page.
  - 응답: `{ items: MainRecommandListItem[], pagination: {current_page, results_per_page:20, total_results, total_pages} }`.
  - `MainRecommandListItem`: `{ idx, recommand_sort, recommand_banner, recommand_banner_link, recommand_name, recommand_start, recommand_end, is_view, goods: RecommandGoods[4] }`.
  - `RecommandGoods`: `{ product_code, product_name, game_type }` — 서버가 recommand_goods_1~4를 tbl_goods_item으로 enrich(빈 슬롯도 4개 유지, 빈값 "").
- **`POST /admin/site/main-recommands/{idx}/sort`** — body `{direction: up|down}` → recommand_sort ±1(swap 아님).
- **`DELETE /admin/site/main-recommands/{idx}`** — 소프트 삭제 is_del='Y'.
- 에러: 5xx + `{success:false}`. **백엔드 책임**: 서버측 권한 강제, 상품 enrich.

## 타겟 매핑
- 라우트: `routes/site/main_recommand.tsx`(search: page, search_banner_title) → `screens/recommand-list`.
- entities: `entities/main-recommand`(types, fetcher list/sort/delete, TanStack Query 훅).
- 재사용: `ServerPagination`, `formatDateTime`, MSW 패턴.
- mock: `db/tables/main-recommand`(fixture, goods 슬롯 포함) + goods 조회용 소형 product 맵(handler 내) + `handlers/main-recommand`.

## Parity 체크리스트 (개발자 승인 완료 — ✅ 검증완료)
- [x] breadcrumb("배너 관리" 포함)/제목/검색필터 카드
- [x] 검색 동작(개발자 지시로 버그 수정 — recommand_name LIKE)
- [x] 테이블 8열·배너 이미지(alt 빈 제목)·제목·상품 4슬롯 numbered list·기간·상태(is_view 조건)·노출여부
- [x] 카운트·등록 버튼·페이지네이션
- [x] sort↑↓(±1 버그)·delete(confirm) 소프트삭제
- mock: 상태(게시중/예정/종료/비노출) 실제 시각(Date.now) 기준 상대 오프셋 — 언제 테스트해도 올바르게 매핑, 대부분 노출로 상태 컬럼 채움.
- 기계 검증: tsc 0 / lint 0 / build 성공.
