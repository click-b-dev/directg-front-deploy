# 대시보드 (M1-7)

## 원본
- 파일: `pc/_Admin_/main.php` (라이브 단일 버전 — 변형/테스트 파일 없음).
- 참조: `docs/legacy-admin/00-overview.md`, `docs/design-system/admin.md`, [layout-assembly](../layout/layout-assembly.md)/[topbar](../layout/topbar.md)/[footer](../layout/footer.md).

## 화면·플로우
- 진입 URL: `/_Admin_/main.php` → 타겟 `/main`. 로그인 후 `admin_level != "1"` 리다이렉트 대상(login_ps.php).
- 레이아웃: **topnav**(사이드바 없음). topbar(로고+메뉴 12/1종+nav-user 드롭다운)는 M1-3에서 이관 완료 → 이 단위는 **콘텐츠 본문만**.
- `<title>`: `관리자시스템::다이렉트 게임즈 관리자시스템 V2` (index.html 정적 제목과 다름 → per-route 설정, 옵션 A).
- 화면 요소 (content-page > content > container-fluid):
  1. `page-title-box` → `<h4 class="page-title">대시보드</h4>` (page-title-right 빈 div).
  2. `row > col-9 > card`: 헤더 `<h5 class="card-header bg-secondary text-white">운영서비스 관리현황</h5>` + body `card-body p-2` 안에 정적 테이블.
- 테이블: `table table-bordered table-sm table-centered`, 7열(colgroup 7 col), `thead.table-light.font-13`, `tbody.font-12`.
  - 컬럼: 시스템분류 / 서비스 분류 / 서비스 용도 / 서비스 내용 / 서비스 기간 / 서비스 제공업체 / 운영관리업무.
  - 1열은 시스템 그룹별 `rowspan`으로 병합. 그룹·행 수:
    - `DGKR 리뉴얼(directg.net)` rowspan=16
    - `DGKR(directgames.co.kr)` rowspan=7
    - `DGJP` rowspan=7
    - `H2 홈페이지 한국어버전` rowspan=8
    - `H2 홈페이지 일본어버전` rowspan=2
    - `H2몰` rowspan=2
    - `메일서비스` rowspan 없음(단일 행)
    - `제휴DG 현대이지웰` rowspan=3
    - 총 46 tbody 행.
  - 셀 다수가 `<br>` 다중행 텍스트. **하드코딩 정적 데이터**(서버 IP/도메인/제공업체/업무 내역).
- 폼/검증: 없음. 분기/리다이렉트: 없음. AJAX/버튼: 없음.

### 동적 로직 (유일)
- 서비스 기간 컬럼의 "N일 남음": legacy `intval((strtotime('YYYY-MM-DD') - strtotime(date('Y-m-d'))) / 86400)`.
  - 만료일(하드코딩) − 오늘(서버 KST) 의 **정수 일수**(truncate). KST는 DST 없어 86400 나눗셈이 정확한 정수.
  - 표기 형태 3종: `~ 2026-12-04 (N일 남음)`(대부분) / 날짜 없는 텍스트(`충전식 포인트 차감 (건당 0.5원)`) / 빈 셀(결제PG 등). `~` 뒤 공백 유무는 **legacy 원문 그대로** 보존(`~ 2026-12-04` vs `~2027-01-21`).
- ⚠️ **legacy 버그 이식**: main.php 639행 — 표시 텍스트 `~2026-08-31`인데 일수 계산은 `strtotime('2026-12-18')` 사용. **그대로 이식**(표시=~2026-08-31, N=2026-12-18까지 일수).

### 세션/권한 의존
- topbar nav-user에 `$_SESSION['admin']["admin_name"]`/`["admin_level"]` 표시 — **M1-3 topbar가 이미 처리**(auth 상태). 본문은 세션 비의존.
- 페이지 접근 가드: M1-2 route-guard가 처리.

## 데이터 (legacy)
- 도메인 클래스·메서드: **없음**(SQL/도메인 클래스 미사용).
- 테이블 데이터: PHP 하드코딩 정적 마크업. DB 조회 없음.
- 로드되나 **미사용 스크립트**: apexcharts.min.js, jquery-jvectormap, demo.dashboard.js — 콘텐츠에 차트/맵 DOM 없음(Hyper 데모 잔재). CSS-only 방침(design-system §1)대로 **미도입**.

## API 계약 (백엔드 전달)
- **신규 엔드포인트 없음.** 대시보드는 정적 콘텐츠 + 클라이언트 날짜 계산뿐.

## 타겟 매핑
- 라우트: `routes/main.tsx` → `screens/dashboard`.
- 스크린: `screens/dashboard/ui/dashboard-screen.tsx` — page-title + 카드 + 정적 테이블. `document.title` per-route 설정(useEffect).
- 날짜 헬퍼: 스크린 로컬 `daysLeft(target)` — `Math.trunc((Date.UTC(today) - ...)/86_400_000)` 재현(rule of two 전 로컬 유지). KST 브라우저 전제(운영 환경 한국) — 문서화.
- entities: 없음. mock: 없음.
- 미사용 스크립트/차트: 미도입(정적 콘텐츠 parity에 영향 없음).

## Parity 체크리스트 (개발자 승인 완료 — ✅ 검증완료)
- [x] 화면 요소 일치 (page-title / card 헤더 / 테이블 구조·클래스)
- [x] 정적 테이블 46행·rowspan 그룹·셀 텍스트(줄바꿈 포함) 일치
- [x] "N일 남음" 계산식·표기(공백 포함) 일치, 639행 버그 이식
- [x] topnav 레이아웃/제목(document.title) 일치
- [x] 엣지케이스: 빈 기간 셀 / 날짜 없는 텍스트 셀 일치

## 산출물
- `screens/dashboard/`, `routes/main.tsx` 교체.
- mock/entities: 없음.
