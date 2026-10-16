# 운영서비스 현황 (#15)

> 영역: 사이트 > 운영서비스 현황. 사이드바 `dg_operation_service`.

## 원본
- 파일: `pc/_Admin_/site/dg_operation_service.php` (72줄, 정적 — 동적 로직/SQL/AJAX 없음).
- 참조: [dashboard](../dashboard/dashboard.md)(main.php의 "운영서비스 관리현황"과 동일 7열, 단 여기는 빈 테이블).

## 화면·플로우
- 진입: `/_Admin_/site/dg_operation_service.php` → 타겟 `/site/dg_operation_service`. sidebar_site, `$topmenu['site']=active`, `$page_title="운영서비스 현황"`.
- breadcrumb: 홈 / **사이트설정** / 운영서비스 현황 (2번째가 "사이트설정" — 타 사이트 페이지의 "사이트"와 다름, 그대로 이식).
- 콘텐츠: `col-12 > card > card-body.p-0 > table-responsive > table`.
  - table: `table table-centered nowrap table-sm table-bordered`, thead `table-light`.
  - **thead 7열만, tbody 없음(빈 테이블)**: 시스템 분류(10%) / 서비스 분류(10%) / 서비스 용도(10%) / 서비스 내용(20%) / 서비스 기간(15%) / 서비스 제공업체(10%) / 운영관리업무(20%). 각 th `text-center`, `style width`.
- 폼/AJAX/데이터: 없음. **정적 빈 테이블**(legacy도 데이터 미구현 상태 — 그대로 재현).

## 데이터 (legacy)
- 없음. 도메인/SQL 미사용.

## API 계약 (백엔드 전달)
- **신규 엔드포인트 없음.**

## 타겟 매핑
- 라우트: `routes/site/dg_operation_service.tsx` → `screens/operation-service`.
- 스크린: 정적 테이블(헤더만). entities/mock 없음. `document.title="운영서비스 현황"`.

## Parity 체크리스트 (개발자 승인 완료 — ✅ 검증완료)
- [x] breadcrumb(홈/사이트설정/운영서비스 현황)/page-title
- [x] card > 빈 테이블(thead 7열, tbody 없음) 클래스·width 일치
- 기계 검증: tsc 0 / lint 0 / build 성공.
