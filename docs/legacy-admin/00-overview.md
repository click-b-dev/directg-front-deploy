# 어드민 — 공통 인프라 · 구조 개요

> 대상: 레거시 PHP 어드민 `pc/_Admin_/` (directg.net 내부 운영 백오피스).
> 이 문서는 마이그레이션(Vite SPA `apps/directg-admin`) 기반 문서 묶음의 **0번 = 공통 계층**이다.
> 섹션별 페이지 정의는 같은 디렉토리의 `10~70` 문서를, 도메인 계약(상태전이·정산·이행 규칙)은
> `../legacy-project/docs/`의 도메인 문서를 단일 진실 원천으로 삼는다.

---

## 1. 정체와 범위

- **무엇**: 임직원이 상품 등록·주문 처리·회원 관리·프로모션 설정·통계 조회를 수행하는 데스크톱 전용 백오피스.
- **규모**: `pc/_Admin_/` 하위 PHP 약 530개 파일. 상위 메뉴 13개.
- **뷰포트**: 데스크톱 고정(`<meta name="viewport" content="width=1630">`). 모바일 대응 없음.
- **UI 스택**: jQuery + Bootstrap 5 기반 관리자 테마(`assets/css/app.min.css`). 차트는 apexcharts/jvectormap, 위지윅은 `smarteditor2`.
- **이관 대상 앱**: `apps/directg-admin` (Vite + TanStack Router, SPA). SSR/SEO 불필요.
- **별개 시스템**: 배급사용 **퍼블리셔 포털**은 `_Admin2_/publisher/`로 계정·DB가 분리된 별도 시스템이다(`80-publisher-portal.md` 참조).

---

## 2. 부트스트랩 (모든 페이지의 공통 진입)

모든 어드민 페이지는 최상단에서 `lib/lib.php`를 include한다. `pc/_Admin_/lib/lib.php`가 순서대로 수행:

1. `session_start()`
2. `../_engine/dbconn.php` + `dbconn_dgkr.php` → **DB 자격증명 2세트** 로드 (저장소 밖)
3. `../src/lib/autoload.php` → 도메인 클래스 오토로더(`spl_autoload_register`) 등록. `new AdminOrder($conn)`처럼 require 없이 사용
4. `../lib/lib_func.php`(스토어 공통) + `_Admin_/lib/lib_func.php`(어드민 전용 헬퍼) 로드
5. `$ip = get_client_ip_env()`
6. DSN 구성: `$dsn`(메인/directgames), `$dsn_dgkr`(보조/dgkr)
7. **세션 가드**: `$_SESSION['admin']["admin_id"]==""`이면 "잘못된 접근입니다" 출력 후 `/_Admin_/`로 리다이렉트 → **유일한 공통 인가 검사**
8. `$topmenu` 배열 초기화(상단 메뉴 활성표시용)

각 페이지는 이어서 `$conn = new PDO($dsn, DB_USER, DB_PASSWORD)`, `$conn_dgkr = new PDO($dsn_dgkr, DGKR_USER, DGKR_PASSWORD)`로 연결하고 도메인 클래스(`Admin*`)를 인스턴스화한다.

> **마이그레이션 함의**: PHP의 "페이지마다 include + PDO 연결 + 클래스 인스턴스화" 패턴은 SPA에서 **백엔드 API 계층**으로 옮겨야 한다. 현재는 프론트/백엔드 분리가 없다(PHP가 SQL을 직접 실행하고 HTML을 렌더). 이관 시 각 화면의 데이터 접근을 API 엔드포인트로 재정의해야 한다.

### DB 두 개

| DSN | 상수 | DB | 담는 것 |
|-----|------|-----|--------|
| `$conn` | `DB_*` | directgames(메인) | 회원 `tbl_member`, 주문 `tbl_order*`, 상품, 퍼블리셔 `tbl_admin_publisher` 등 대부분 |
| `$conn_dgkr` | `DGKR_*` | dgkr(보조) | 관리자 계정 `tbl_admin`, 일부 보조 데이터 |

---

## 3. 인증 · 권한 (요약 — 상세는 `ADMIN-AUTHORIZATION.md`)

- **로그인**: `index.html`(폼) → `login_ps.php` → `AdminMember::adminLogin()`. `tbl_admin`(dgkr)에서 `admin_pwd=password(:pwd)`(MySQL 레거시 `PASSWORD()` — MySQL 8 제거 대상) 조회.
  - 미승인(`status <> 'y'`) → `NO_AUTH_CONFIRM`, 없는 계정 → `NOT_FOUND`.
  - 성공 시 세션 `$_SESSION['admin'] = {admin_id, admin_name, admin_level}` + 로그인 시각·IP 기록(`adminUpdate`).
- **로그인 분기**(`login_ps.php:27`): `admin_level=="1"` → `goods/title_list.php`, 그 외 → `main.php`.
- **로그아웃**: `logout.php` → `$_SESSION=array()` + `session_destroy()` → `/_Admin_/`.
- **세션 가드**: 2장 7번(`lib/lib.php`) — 로그인 상태만 검사.

### 권한 등급(`admin_level`)

| 값 | 구분 | 접근 범위 | 구현 방식 |
|----|------|-----------|-----------|
| `"1"` | 상품 뷰어 | 상품(goods) 메뉴만 노출, 로그인 시 상품 화면 이동 | `$product_viewer` 플래그로 **UI 스코핑**(메뉴 숨김) — `topbar.php:27`, `sidebar_goods.php:2`, `title_ps.php:88`, `goods_option_ps.php:79` |
| 기본 | 일반 운영자 | 전체 메뉴 | — |
| `"99"` | 슈퍼(최고 관리자) | 전체 + 퍼블리셔 코드 관리 | **서버측 차단** — `code/publisher_ps.php:27`, `code/publisher_list.php` |

> ⚠️ **핵심 리스크**: 권한 제한은 대부분 **메뉴 숨김**이라, URL 직접 입력 시 서버에서 차단되지 않는 화면이 다수다. 서버측 차단이 실재하는 곳은 `code/publisher*`(99 전용) 정도. `policy/system/auth_list.php`("운영자 권한 관리")는 **동작하지 않는 정적 목업**이다. 이관 시 "메뉴별 접근 가능 등급"을 서버(API)에서 강제하는 RBAC를 신규 설계해야 한다.

---

## 4. 레이아웃 · 공통 partial (`inc/`)

페이지 조립 순서: `admin_head.php`(head) → `topbar.php`(상단 최상위 메뉴) → `sidebar_<영역>.php`(좌측 서브 메뉴) → 본문 → `footer.php`.

| 파일 | 역할 |
|------|------|
| `inc/admin_head.php` | `<head>` + 공통 JS 헬퍼(5장) + 인라인 스타일. CSS는 `?<?=time()?>`로 캐시 버스팅 |
| `inc/topbar.php` | 상단 가로 최상위 메뉴 13종 + `admin_level` 분기 + 알림/로그아웃 드롭다운 |
| `inc/sidebar_<영역>.php` | 영역별 좌측 서브 메뉴(각 영역 문서의 "메뉴 트리"가 이 파일 기준) |
| `inc/sub_sidebar_title.php`, `inc/sub_sidebar_option.php` | 상품 상세/옵션 화면의 2차 서브 사이드바 |
| `inc/sidebar.php`, `inc/sidebar_design.php` | 로고만 담은 껍데기(메뉴 없음) |
| `inc/footer.php`, `inc/topbar.php`, `inc/header_common.html` | 공통 하단/헤더 조각 |

### 상단 최상위 메뉴 (`topbar.php`)

| 라벨 | `$topmenu` 키 | 진입 링크 | 담당 문서 |
|------|--------------|-----------|-----------|
| 대시보드 | dashboard | `main.php` | (본 문서 6장) |
| 사이트 | site | `site/banner_list.php` | `10-site-policy-tag-api.md` |
| 상품 | goods | `goods/dashboard_goods.php` | `20-goods-catalog.md` |
| 재고 | stock | `goods/stock/dashboard_stock.php` | `21-goods-stock-integration.md` |
| 회원 | member | `member/dashboard_crm.php` | `30-member-board.md` |
| 주문 | order | `order/dashboard_order.php` | `40-order.md` |
| 프로모션 | promotion | `promotion/dashboard_promotion.php` | `50-promotion-event.md` |
| 이벤트 | event | `event/event_board_list.php` | `50-promotion-event.md` |
| 게시판 | board | `board/dashboard_board.php` | `30-member-board.md` |
| 제휴 | jehu | `#` (빈 링크 — 미구현) | — |
| 통계 | statistics | `statistics/order/order_day_count.php` | `60-statistics.md` |
| 중국 | china | `china/invoice_list.php` | `70-partner-code-china.md` |
| 파트너 | partner | `partner/partner_list.php` | `70-partner-code-china.md` |

> 상품 뷰어(`admin_level=="1"`)에게는 상단 메뉴 중 **상품만** 노출된다(`topbar.php`의 `if($product_viewer)` 분기).

---

## 5. 공통 JS 헬퍼 (`admin_head.php`에 정의)

모든 페이지가 상속하는 클라이언트 헬퍼. 이관 시 공통 유틸/컴포넌트로 대체 대상.

| 함수 | 용도 |
|------|------|
| `LoadingOverlay('show'\|'hide')` | 전체 화면 로딩 스피너 토글 |
| `escHtml(str)` | XSS 방지용 HTML 이스케이프 |
| `renderPaging(options)` | 클라이언트 페이징 렌더(`baseUrl`, `page`, `totalPages`, `params`, `targetPaging`, `targetTotal`, `perBlock`). AJAX 목록 화면 다수가 사용 |

목록 화면 관례: 서버가 초기 HTML 렌더 후, 검색/페이징은 `*_json.php`를 AJAX 호출하고 `renderPaging`으로 표시하는 패턴이 흔하다.

### 어드민 전용 링크 헬퍼 (`_Admin_/lib/lib_func.php`)

화면 간 이동 링크를 생성하는 헬퍼. 이관 시 라우팅 매핑 참고자료.

| 함수 | 이동 대상 |
|------|-----------|
| `goods_link($product_code)` | 옵션상품 상세 `goods/goods_option_view.php` |
| `member_link($m_no)` | 회원 상세 `member/member_view.php` |
| `asset_link($item_id)` / `asset_stock_link($asset_id)` | Asset 재고현황 |
| `stock_check_link($order_system,$item_id)` | 공급사별 재고체크(1 Asset/8 Vaultn/9 Genba/10 PointNexus, Ztorm 없음) |
| `soldout_badge($soldout)`, `pct($n,$d)` | 표시 헬퍼 |

---

## 6. 대시보드 (`main.php`)

- 일반 운영자 로그인 시 랜딩 화면(`$topmenu['dashboard']='active'`).
- **정적 템플릿 성격**: 도메인 클래스 호출 없이 HTML/차트 마크업 위주(약 720줄, `lib.php`·`footer.php`만 include). 실질 데이터 위젯보다 테마 대시보드 골격에 가깝다.
- 각 상위 영역은 자체 대시보드를 별도 보유: `goods/dashboard_goods.php`, `goods/stock/dashboard_stock.php`, `member/dashboard_crm.php`, `order/dashboard_order.php`, `promotion/dashboard_promotion.php`, `board/dashboard_board.php`. (각 영역 문서 참조)

---

## 7. 파일·페이지 유형 관례

섹션 문서 전반에서 쓰는 분류.

| 접미/패턴 | 유형 | 설명 |
|-----------|------|------|
| `*_list.php` | 목록 | 검색·페이징 목록 화면 |
| `*_view.php` | 상세 | 단건 상세 조회 |
| `*_form.php` / `*_write.php` / `*_regist.php` | 폼 | 등록·수정 입력 화면 |
| `*_ps.php` | 처리 | POST 처리 핸들러(화면 없음). 폼 submit·AJAX·버튼 액션의 대상 |
| `*_json.php` | AJAX | JSON 응답(목록 페이징·차트 데이터·검색) |
| `*_sync.php` | 동기화 | 외부 공급사 API 동기화 |
| `*_excel*.php` / `*_download*.php` | 내보내기 | 엑셀/CSV(대체로 PHPExcel) |
| `dashboard_*.php` | 대시보드 | 영역별 요약 화면 |

### 변형/실험 파일 주의

`yjs_*`, `kdy_*`(개발자 이니셜), 날짜 접미(`_20260204` 등), `promotion/tmp/`, `*_test*` 파일은 **같은 화면의 대체/실험 버전**이다. 어느 것이 라이브인지 불명확한 경우가 있어, 이관 전 반드시 실제 서빙 버전을 확인해야 한다. 각 섹션 문서의 "변형/테스트 파일" 절에 나열돼 있다.

---

## 8. 외부 공급사 이행 매핑 (전역 상수 — 여러 영역에서 참조)

주문 이행·재고가 `order_system` 코드로 공급사를 분기한다. `21-goods-stock-integration.md`·`40-order.md`의 공통 축.

| 코드 | 공급사 | 재고/카탈로그 어드민 | 재고체크 링크(`stock_check_link`) |
|------|--------|---------------------|-----------------------------------|
| 1 | Asset | `goods/asset/`, `goods/stock/` | `asset_stock.php` |
| 2 | Ztorm | `goods/ztorm/` | (없음) |
| 8 | Vaultn | `goods/vaultn/` | `vaultn_catalogue.php` |
| 9 | Genba | `goods/genba/` | `genba_product_sync.php` |
| 10 | PointNexus | `goods/pointnexus/` | `pointnexus_catalogue.php` |

---

## 9. 마이그레이션 관점 공통 유의점

1. **프론트/백엔드 분리 신설**: PHP가 SQL 직접 실행+HTML 렌더 → SPA는 API 계층이 필요. 각 화면 문서의 "데이터 소스(클래스·테이블)"가 API 스펙 도출의 출발점.
2. **RBAC 재설계**: 현행은 메뉴 숨김 위주. 서버측 권한 강제를 신규 설계(특히 상품뷰어 스코핑, 슈퍼 전용 영역).
3. **인증 현대화**: `PASSWORD()` 해시 → 표준 해시로 전환 필요(`ADMIN-AUTHORIZATION.md` 6장).
4. **short open tag**: legacy는 `<? ?>`/`<?= ?>` 전면 사용. 참조 시 인지.
5. **DB 이원화**: `tbl_admin`(dgkr)만 별도 DB. 이관 시 계정 저장소 통합 여부 결정.
6. **동작 동일성 우선**: 프로젝트 성공 기준은 legacy 동작 1:1 재현. UI/UX·성능·구조 "개선"은 범위 밖(눈에 띄는 개선 여지도 그대로 이관). 목업(`auth_list.php`)·비활성 메뉴는 이관 제외 후보로 표기.

---

## 10. 문서 묶음 인덱스

| 문서 | 영역 |
|------|------|
| `00-overview.md` (본 문서) | 공통 인프라·인증·레이아웃·대시보드 |
| `10-site-policy-tag-api.md` | 사이트 설정·정책·태그·템플릿·공통 API |
| `20-goods-catalog.md` | 상품(타이틀·옵션·그룹) |
| `21-goods-stock-integration.md` | 재고·외부 공급사 연동(Asset/Ztorm/Vaultn/Genba/PointNexus/GRAC/Epic/Steam) |
| `30-member-board.md` | 회원(CRM)·게시판 |
| `40-order.md` | 주문(결제·이행·취소/환불·배송·정산) |
| `50-promotion-event.md` | 프로모션·이벤트·구매이벤트·추첨 |
| `60-statistics.md` | 통계(주문·매출·상품·프로모션·이벤트) |
| `70-partner-code-china.md` | 파트너·퍼블리셔/코드·중국 |
| `80-publisher-portal.md` | 퍼블리셔(배급사) 포털 `_Admin2_` — 계정·DB 분리된 별개 시스템 |

**참조 도메인 계약 문서**(`../legacy-project/docs/`, 단일 진실 원천):
`ADMIN-AUTHORIZATION` · `ORDER-WORKFLOW-AUDIT` · `PAYMENT-APPROVAL` · `MEMBER-LIFECYCLE` · `PARTNER-SETTLEMENT` · `PROMOTION-EVENT-OPS` · `STOCK-MANAGEMENT` · `STATISTICS-REPORTING` · `BOARD-CONTENT` · `SEO-CHANNEL` · `NOTIFICATION-EMAIL` · `OPERATION-POLICY-MAP` · `BUSINESS-RULES` · `PROJECT-OVERVIEW`.
