# 모바일 프로모션 그룹 (promotion/promotion_group) — 리다이렉트 전용 dead 페이지

## 원본 (legacy mobile)
- 파일: `mobile/promotion/promotion_group.html` (링크: `mobile/inc/sidebar.html`)
- **최상단 무조건 리다이렉트**: `header('Location: https://m.directg.net/')` — PHP 기본 302(임시). try/catch·HTML 본문 이전에 실행되어 **본문은 절대 렌더되지 않는다**(브라우저가 302 따라 홈으로 이동)
- 본문(dead, 미렌더): `tbl_group`(type=1, use_flag=Y, idx IN 11~19) 배너 그리드 + `.banner_link` 클릭 시 기간 판정 → `group_list.html?idx=` 이동. **전부 미실행**
- `meta robots noindex` (리다이렉트라 무의미)

## 화면·플로우 (legacy mobile 기준)
- 진입 URL: `/promotion/promotion_group.html`(GET) → **즉시 302 리다이렉트 → 모바일 홈**(`https://m.directg.net/`)
- 관측 동작: 어떤 방문자든 홈으로 이동. 배너/기간 판정/그룹 링크는 도달 불가(dead)

## 타겟 매핑
- middleware MOBILE_ROUTES +1: `/promotion/promotion_group.html`
- 라우트: `app/m/promotion/promotion_group.html/page.tsx` — `redirect("/")`(next/navigation, 307 임시. legacy 302 대응. PC game_package_view의 permanentRedirect=308과 달리 **임시**)
- screen/entity/mock **없음**(본문 미렌더 = 이관 불필요)
- **PC 폴백 없음**(모바일 전용 URL)

## 보존할 legacy quirk / 결정
- 무조건 홈 리다이렉트만 재현(PC `game_package_view` 선례 = 홈 리다이렉트만 재현, 개발자 승인 패턴)
- 리다이렉트 종류: legacy `header('Location:')` 기본 302(임시) → Next `redirect()`(307 임시). permanentRedirect(308) 아님
- 배너 그리드/tbl_group 조회/기간 판정/group_list 이동은 dead → 미이관(도달 불가)
- 홈 타겟: legacy `m.directg.net/` → 본 앱 `/`(모바일 UA는 middleware가 /m으로 rewrite)

## Parity 체크리스트 (모바일 UA) — 개발자 승인 완료 2026-09-15 ✅
- [x] `/promotion/promotion_group.html` 접근 → 홈(`/`) 임시 리다이렉트
- [x] 본문 미렌더(배너/그룹 링크 dead) 재현
- [x] middleware rewrite + (PC 폴백 없음 — 문서화 갭)
