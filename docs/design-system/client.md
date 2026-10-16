# 스토어프론트(client) 디자인시스템 — 개요

> 대상: `apps/directg-client` (Next.js). 원본: legacy `pc/` (데스크톱 docroot). mobile/은 후속 단계.
> **상태: 개요 설계** — 정밀 토큰 추출·컴포넌트 인벤토리는 client 이관 착수 시 수행한다.
> 전략·계층 구조는 [README.md](README.md)와 동일 (자산층 그대로 도입 + legacy 클래스명 래퍼).

## 1. legacy 시각 스택 (pc/index.php 기준 확인 사실)

admin(Hyper 테마)과 **완전히 다른 체계**다.

> **전역 다크 테마 (필수 확인 사실)**: legacy 루트 태그는 `<html lang="ko" data-bs-theme="dark">`. 스토어프론트 전체가 Bootstrap 다크 테마를 전제로 색·배경이 결정된다. `app/layout.tsx`의 `<html>`에 `data-bs-theme="dark"`를 반드시 재현한다(누락 시 `text-body-secondary` 등 테마 종속 색이 배경과 대비 소실 — 공통 레이아웃 단위에서 확인됨).

로드 순서:

| 순서 | 자산 | 출처 |
|------|------|------|
| 1 | Noto Sans KR (100~900) | Google Fonts CDN |
| 2 | Font Awesome 6.7.2 | cdnjs (integrity 포함) |
| 3 | Splide 캐러셀 CSS | 로컬 `/assets/css/vendor/splide.min.css` **및** jsdelivr CDN(@4.1.4) — 이중 로드가 legacy 사실 |
| 4 | **Bootstrap 5.3.5** | jsdelivr CDN (integrity 포함) |
| 5 | `/templete/assets/dist/css/custom.css` | 로컬 — 퍼블리싱 템플릿 커스텀 |
| 6 | `/assets/css/page/main.css` | 로컬 — **페이지별 CSS** (`page/*.css` 패턴) |
| 7 | `/assets/css/directg.css?t=YYYYMMDD` | 로컬 — **핵심 브랜드 커스텀**. 날짜 쿼리스트링 캐시버스팅 |

주의: `pc/assets/css/`의 Hyper 계열 파일(`app-*.css`)은 스토어프론트 페이지에서 로드되지 않는 잔재로 보인다 — 이관 대상 아님 (착수 시 페이지별 재확인).

## 2. 도입 설계 (client 착수 시 실행)

- CDN 자산(Bootstrap 5.3.5, FA 6.7.2, Splide, 구글폰트)은 **동일 URL·동일 버전·integrity 그대로** `app/layout.tsx`에 재현한다. 버전 업그레이드 금지 (5.3.5 → 최신 = 회귀 위험).
- 로컬 CSS(`directg.css`, `templete/.../custom.css`, `page/*.css`)는 무수정 복사해 `public/` 경로 유지. `page/*.css`는 해당 페이지 이관 단위에서 함께 도입.
- 페이지별 head가 다를 수 있다(`index.php` 외 `game/*`, `order/*` 등) — **각 화면 이관 단위의 분석 단계에서 그 화면의 실제 로드 목록을 확인**해 문서화한다.

## 3. 후속 작업 (client 첫 단위 착수 전)

1. `directg.css` 정밀 분석 — 브랜드 색·버튼·카드 등 실질 토큰 추출해 이 문서에 §토큰으로 추가
2. `inc/header*.html` / `footer*.html` 변형 중 라이브 버전 판별 (여러 세대 공존: `footer.html`/`footer2.html`/`footer_new.html` 등)
3. 공통 레이아웃 래퍼(Header/Footer/Aside) 인벤토리 작성 — legacy `web/src/components/Footer.tsx` 선행 포팅본 참고
4. Splide 캐러셀의 React 재현 방식 결정 (등장 시 사용자 게이트)
