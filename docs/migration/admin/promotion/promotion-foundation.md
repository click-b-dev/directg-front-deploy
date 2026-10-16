# 프로모션 영역 기반 (사이드바 전환 + 대시보드 정적)

> P1 프로모션 관리 영역의 첫 단위. legacy `sidebar_promotion.php` 사이드바 트리 이식 + `dashboard_promotion.php`(정적 껍데기) 화면. 선례: B1 #112(게시판 영역 기반 = 사이드바 전환 + 대시보드 스텁), S1 #153(사이드바 전환), M5 #15(정적 화면).

## 원본
- 파일: `pc/_Admin_/inc/sidebar_promotion.php` (라이브, `dashboard_promotion.php`의 `$sidebar_file`로 지정)
- 파일: `pc/_Admin_/promotion/dashboard_promotion.php` (라이브, 사이드바 최상단 link + topbar `promotion` 진입점)
- 참조 문서: `docs/legacy-admin/50-promotion-event.md` §프로모션(메뉴 트리·대시보드), `../legacy-project/docs/PROMOTION-EVENT-OPS.md`

## 화면·플로우

### 사이드바 (`sidebar_promotion.php`)
로고(H2_DG_BI) + `side-nav`. 인라인 `<style>`로 `.side-nav-link{padding-left:20px}`·`.side-nav-second-level li a{padding-left:40px}` (레이아웃 쉘이 이미 처리 → 마크업만 이식, 인라인 스타일 생략).

노출 트리(순서 고정, **모든 그룹 `class="collapse show"` = 전체 펼침**):

| 순서 | 유형 | 라벨 | 링크(legacy) | 타겟 라우트 |
|------|------|------|--------------|-------------|
| 1 | link | 프로모션 대시보드 | `dashboard_promotion.php` | `/promotion/dashboard_promotion` |
| 2 | group `sidebarPromotion` | 할인 프로모션 관리 | — | — |
| 2-1 | | 승인대기 할인 프로모션 | `promotion_ready.php` | `/promotion/promotion_ready` |
| 2-2 | | 진행중인 할인 프로모션 | `promotion_ing.php` | `/promotion/promotion_ing` |
| 2-3 | | 진행예정 할인 프로모션 | `promotion_upcoming.php` | `/promotion/promotion_upcoming` |
| 2-4 | | 종료된 할인 프로모션 | `promotion_end.php` | `/promotion/promotion_end` |
| 3 | group `sidebarPromotionWeekend` | 주말특가 프로모션 관리 | — | — |
| 3-1 | | 주말특가 프로모션 목록 | `promotion_weekend.php` | `/promotion/promotion_weekend` |
| 3-2 | | 주말특가 프로모션 등록 | `promotion_weekend_register.php` | `/promotion/promotion_weekend_register` |
| 4 | group `sidebarPromotionSeason` | 대규모 프로모션 관리 | — | — |
| 4-1 | | 대규모 프로모션 목록 | `promotion_season.php` | `/promotion/promotion_season` |
| 4-2 | | 대규모 프로모션 등록 | `promotion_season_register.php` | `/promotion/promotion_season_register` |
| 5 | group `sidebarTimedeal` | 타임딜 관리 | — | — |
| 5-1 | | `[X]` 타임딜 현황 | `timedeal_list.php` | `/promotion/timedeal_list` (죽은 링크) |
| 5-2 | | `[X]` 타임딜 등록 | `timedeal_register.php` | `/promotion/timedeal_register` (죽은 링크, 0B) |
| 6 | group `sidebarCouponOffline` | 오프라인 쿠폰 관리 | — | — |
| 6-1 | | 오프라인 쿠폰 리스트 | `offline_coupon_list.php` | `/promotion/offline_coupon_list` |
| 6-2 | | 오프라인 쿠폰 등록 | `offline_coupon_register.php` | `/promotion/offline_coupon_register` |

아이콘: 대시보드 link만 `uil uil-dashboard font-22`, 모든 그룹은 `uil-shop`(기본 크기). goods/stock 선례와 동일 규칙.

**미노출(이식 제외)**:
- `할인 프로모션 등록`(`promotion_register.php`) — HTML 주석 `<!-- -->`.
- `프로모션 동기화`(`promotion_list.php`) — HTML 주석.
- `쿠폰 관리` 그룹 전체(`coupon_config/list/register`) — HTML 주석 + 파일 부재.
- `오프라인 쿠폰 상세`(`offline_coupon_view.php`) — `<li class="d-none">`(숨김). 목록에서 링크 진입하는 대상, 후속 단위에서 라우트 생성.

**타임딜 그룹 이식 판단**: legacy는 `[X]` 라벨 + 실경로 link로 그룹을 노출한다. goods 사이드바 `[X] Randombox 목록`(실경로 `/goods/goods_randombox_list`, 죽은 링크) 선례를 계승해, `[X]` 라벨을 유지하고 href는 legacy 경로에서 `.php` 제거한 `/promotion/timedeal_list`·`/promotion/timedeal_register`로 둔다(라우트 미생성 → 죽은 링크). `timedeal_register.php`는 0B.

### 대시보드 (`dashboard_promotion.php`)
- 진입 URL: `/promotion/dashboard_promotion`
- `$page_title="프로모션 대시보드"`, `$topmenu['promotion']="active"`.
- 화면 요소:
  - `page-title-box`:
    - `page-title-right`: `<form class="d-flex">` → `input-group`(연도 datepicker `input#datepicker6` + `input-group-text bg-primary border-primary text-white`에 `<i class="mdi mdi-calendar-range font-13">`) + 새로고침 버튼 `<a href="javascript: void(0);" class="btn btn-primary ms-2"><i class="mdi mdi-autorenew"></i></a>`.
    - `<h4 class="page-title">프로모션 대시보드</h4>`
  - **breadcrumb 없음**(board-dashboard와 달리 `<ol class="breadcrumb">` 미존재).
  - 본문 `container-fluid`는 page-title 외 **빈 상태**(카드조차 없음).
- 데이터소스: **없음**. `new PDO(...)` 연결만 생성(`$admin` 주석), 쿼리·바인딩 없음.
- 죽은 스캐폴딩(미이식): `apexcharts.min.js`·`jquery-jvectormap-*`·`demo.dashboard.js` 로드 + `$('#datepicker6').datepicker({minViewMode:'years', format:'yyyy'})` 초기화. board-dashboard(#112)가 demo JS·apexcharts를 미이식한 선례, operation-service(#15)가 정적 껍데기를 JS 없이 이식한 선례와 동일.
- 세션/권한: `lib.php` 세션 가드(전 admin 공통, `features/route-guard`가 이미 처리).

## 데이터 (legacy)
- 도메인 클래스: 없음(대시보드는 PDO 연결만). 사이드바는 순수 정적 마크업.
- SQL: 없음.

## API 계약 (백엔드 전달)
- 없음. 정적 화면 + 정적 사이드바. mock 불필요.

## 타겟 매핑
- 라우트: `apps/directg-admin/src/routes/promotion/dashboard_promotion.tsx` → `PromotionDashboardScreen`
- 스크린: `apps/directg-admin/src/screens/promotion-dashboard/` (`index.ts` + `ui/promotion-dashboard-screen.tsx`)
- 위젯: `widgets/sidebar/model/nav.ts` — `PROMOTION_SIDE_NAV` 추가 + `resolveSideNav`에 `/promotion` 분기(`expandAll: true`). promotion 경로는 `/promotion/*` 전용이라 goods/stock와 충돌 없음. SITE 폴백 앞에 배치.
- entities: 없음. mock: 없음.

## 파리티 결정 사항 (게이트 확인 대상)
1. **연도 datepicker 팝업**: legacy는 클릭 시 연도 선택 드롭다운 노출(선택해도 form action·refresh 핸들러 없어 **무동작**). 공유 `BootstrapDatepicker`는 `yyyy-mm-dd`·days 뷰 전용으로 `minViewMode:'years'`/`format:'yyyy'` 미지원 → 죽은 컨트롤 하나를 위해 공유 컴포넌트를 확장하는 것은 rule of two·최적화 금지 정책에 반한다. **정적 input(팝업 없음)으로 마크업만 재현**하고 datepicker 초기화 JS는 미이식(demo.dashboard.js 미이식 선례와 동일). → 마크업·시각 동일, 클릭 팝업만 생략.
2. 본문이 빈 상태라 카드도 렌더하지 않는다(legacy 그대로).

## Parity 체크리스트
- [ ] 사이드바 노출 메뉴/순서/그룹 일치 (대시보드 link + 5그룹, 전체 펼침)
- [ ] 미노출(주석/d-none) 메뉴 제외 일치
- [ ] `[X]` 타임딜 라벨·죽은 링크 이식
- [ ] 대시보드 page-title(datepicker input-group + 새로고침 버튼 + h4) 마크업 일치, breadcrumb 없음
- [ ] `/promotion/*` 경로에서 프로모션 사이드바로 전환
