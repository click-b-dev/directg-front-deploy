# 배너 목록 (M2-8)

## 원본
- 파일: `pc/_Admin_/site/banner_list.php` (라이브 단일 버전). AJAX 처리: `site/banner_proc.php`.
- 도메인: `src/classes/AdminSite.php::getMainbannerList`, 페이징 `src/classes/Pagination.php`(BenGriffiths).
- 참조: `docs/legacy-admin/10-site-policy-tag-api.md`, `docs/design-system/admin.md`.

## 화면·플로우
- 진입 URL: `/_Admin_/site/banner_list.php?page=&search_banner_title=&search_flag=` → 타겟 `/site/banner_list`.
- 레이아웃: **sidebar**(sidebar_site) + topbar. `$topmenu['site']=active`. `$page_title="메인배너 관리"`.
- 화면 요소:
  1. breadcrumb(홈 / 사이트 / 배너 관리 / 메인배너 관리) + `h4.page-title` "메인배너 관리".
  2. **검색필터 카드**(`card > h5.card-header.bg-secondary.text-white "검색필터"`): `form method=get`.
     - 배너 제목: `input[name=search_banner_title]` (placeholder "배너 제목 검색").
     - 노출 여부: radio `search_flag` = Y(예)/N(아니오), 선택 시 `checked`.
     - 제출: `button.btn-primary "메인배너 검색"`.
  3. 카운트/등록 줄: 좌 `number_format(total_results) 개`, 우 `a.btn-danger "메인배너 등록"` → `banner_register.php`(#9).
  4. **목록 테이블**(`table table-centered w-100 nowrap table-sm table-bordered border-light`, colgroup 8, `thead.table-light.font-13`, `tbody.bg-white.font-12`). 8열:
     1. 순서: `banner_sort` 값 + ↑(`btn_sort_up`)·↓(`btn_sort_down`) 버튼(`mdi-chevron-up/down-box`).
     2. 배너 이미지: `a[href=banner_link target=_blank] > img[src=banner_pc alt="{banner_title} 배너 이미지"].img-fluid`.
     3. 배너 제목: `{banner_title}({product_code})` + `pc 배너 url: {banner_pc}` + `모바일 배너 url: {banner_mobile}` (각 `<br/>`).
     4. 배너 퍼블리셔: `banner_publisher`.
     5. 기간: `bannerPeriodOutputFl=="N"` → `badge.bg-secondary "상시노출"`; 아니면 `badge.bg-secondary "기간노출"` + `date('Y-m-d H:i:s',banner_start) ~ date(...,banner_end)`.
     6. 상태:
        - `bannerPeriodOutputFl=="N"`: `flag=="Y"` → `badge.bg-success "게시중"` / 아니면 `badge.bg-secondary "게시종료"`.
        - `bannerPeriodOutputFl=="Y"`: `banner_start-now>0` → 텍스트 "게시예정"(뱃지 없음) / `banner_start<now<banner_end` → `badge.bg-success "게시중"` / `banner_end<now` → `badge.bg-secondary "게시종료"`.
     7. 노출여부: `flag` 원문(Y/N 텍스트).
     8. 관리: `a.btn-info "수정"` → `banner_modify.php?idx=`(#10) + `button.btn-danger.btn_delete "삭제"`.
  5. 페이지네이션: `Pagination.php`(links_html), `results_per_page=20`.
- 폼 검증: 없음(GET 검색). 분기: 검색어 있으면 where 추가.

### 행 액션 (banner_proc.php, AJAX POST → location.reload)
- `btn_sort_up`: `{mode:banner_sort_up, idx}` → `update tbl_main_banner set banner_sort=banner_sort-1 where idx`.
- `btn_sort_down`: `{mode:banner_sort_down, idx}` → `banner_sort=banner_sort+1 where idx`.
- `btn_delete`: `confirm("해당 배너를 삭제하시겠습니까?")` 후 `{mode:banner_delete, idx}` → `update ... set is_del='Y' where idx`(소프트 삭제).
- ⚠️ **legacy 동작 이식**: sort는 인접 배너와 교환(swap)하지 않고 해당 행 `banner_sort`만 ±1 → 중복/음수 sort 발생 가능. 그대로 이식(개선 금지). data-sort 속성은 proc에 전달 안 됨(vestigial) — idx만 사용.

### 세션/권한
- lib.php 세션 가드(M1-2 route-guard가 처리). banner_proc.php는 추가 권한 체크 없음(세션만) — 서버측 권한 강제는 **백엔드 책임**으로 계약에 명시.

## 데이터 (legacy)
- 클래스: `AdminSite::getMainbannerList($page,$add_where,$orderby,$param)`.
- SQL: `select * from tbl_main_banner where 1=1 {add_where} order by banner_sort asc` + `LIMIT (page-1)*20, 20`. `add_where`: `and is_del='N'` (+ `and banner_title like '%{q}%'`, `and flag='{Y|N}'`).
- 페이징: `Pagination.php` — `results_per_page=20`, First/Prev/Next/Last(`&laquo; First|Prev`, `Next|Last &raquo;`), Prev −10p / Next +10p 점프, ellipses(`max_links_between_ellipses=7`, `max_links_outside_ellipses=2` → 총 11페이지 초과 시 `...`), dead link=`d-none`, current=`active`, `ul.pagination.pagination-lg.text-nowrap.justify-content-center`.
- `tbl_main_banner` 컬럼: `idx`(PK), `banner_title`, `banner_pc`, `banner_mobile`, `product_code`, `banner_publisher`, `banner_link`, `banner_target`, `banner_start`(int unixts), `banner_end`(int unixts), `banner_sort`(int), `flag`(Y/N), `bannerPeriodOutputFl`(Y/N), `show_prod_info`, `show_sale_info`, `reg_date`, `is_del`(Y/N).

## API 계약 (백엔드 전달)
> 응답 타입: `entities/main-banner/model/types.ts`. 날짜(`banner_start/end`)는 legacy처럼 **unix epoch 초(int)** 유지(프론트가 표시 포맷 담당).

- **`GET /admin/site/main-banners`** — 목록.
  - query: `page`(기본 1), `search_banner_title`(부분일치), `search_flag`(`Y`|`N`).
  - 서버: `is_del='N'` 강제 + 필터, `order by banner_sort asc`, page당 20.
  - 응답: `{ items: MainBannerListItem[], pagination: { current_page, results_per_page: 20, total_results, total_pages } }`.
  - `MainBannerListItem`: `{ idx, banner_sort, banner_pc, banner_mobile, banner_link, banner_target, banner_title, product_code, banner_publisher, banner_start, banner_end, flag, bannerPeriodOutputFl }`.
- **`POST /admin/site/main-banners/{idx}/sort`** — 정렬 이동. body `{ direction: "up" | "down" }`. up=`banner_sort-1`, down=`banner_sort+1`(legacy 그대로, swap 아님). 응답 `{ success: true }`.
- **`DELETE /admin/site/main-banners/{idx}`** — 소프트 삭제(`is_del='Y'`). 응답 `{ success: true }`.
- 에러: legacy는 PDOException 시 `Error!: ...` 출력 후 die. 계약은 5xx + `{ success:false, error_msg }`. **백엔드 책임**: 서버측 관리자 권한 강제(legacy 프론트는 미강제).

## 타겟 매핑
- 라우트: `routes/site/banner_list.tsx` → `screens/banner-list`.
- entities: `entities/main-banner` (types, fetcher: list/sort/delete, 데이터 훅).
- 페이지네이션: **신규 공유 컴포넌트** `shared/ui/server-pagination` — `Pagination.php` 알고리즘(ellipses/First·Prev·Next·Last/±10 점프) 재현. #5 `Pagination`(renderPaging/AJAX용)과 **별개**(legacy에 두 페이징 시스템 공존). admin 다수 목록이 공유 → rule of two 선반영(첫 등장이나 공용 인프라).
- mock: `shared/mocks/db/tables/main-banner.ts`(fixture) + `handlers/main-banner.ts`(list/sort/delete). fixture는 tbl_main_banner 실제 형태(unixts, Y/N) 재현, 20건 초과로 페이징 확인 가능.
- 배지/뱃지: legacy 클래스(`badge bg-secondary/bg-success`) 그대로.

## 결정 사항 (개발자 승인)
1. **데이터 페칭 = TanStack Query 도입** (개발자 선택). `@tanstack/react-query@5.101.2` exact pin 설치.
   - 공급망 보안 점검 완료: Mini Shai-Hulud(2026-05-11) 침해 대상은 `@tanstack/react-router`/`router-core`/`router-plugin`/`start-*`. **`@tanstack/query*`는 confirmed-clean**(Snyk/StepSecurity). 5.101.2는 2026-06-27 배포(침해 윈도우 밖). lockfile·node_modules 5.101.2 확인.
   - `QueryClientProvider`를 `app/providers.tsx`에 배선(신규 인프라, 이후 목록 공용).
2. **단위 경계 = #8에 sort↑↓·delete 포함**(banner_list.php 자체 스크립트). #10(수정/삭제)은 banner_modify.php(수정) 담당.
3. **검색/페이지네이션 = 네이티브 GET 전체 이동**(legacy `form method=get`/`<a href>` 동일). **정렬/삭제 = mutation + invalidate**(= legacy location.reload와 동일 가시 결과, idiomatic).

## Parity 체크리스트 (개발자 승인 완료 — ✅ 검증완료)
- [x] breadcrumb/page-title/검색필터 카드(필드·라디오·checked) 일치
- [x] 카운트(number_format→toLocaleString)·등록 버튼 링크 일치
- [x] 테이블 8열·클래스·기간/상태 뱃지 분기 일치
- [x] 페이지네이션(ellipses/First·Prev·Next·Last/±10/active/d-none) 일치
- [x] sort↑↓·delete(confirm) 동작·소프트삭제 일치, sort ±1 버그 이식
- [x] 검색(title LIKE / flag) 필터·is_del='N' 일치
- 기계 검증: tsc 0 / lint 0 / build 성공(482 modules).
