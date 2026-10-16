# 게임 패키지(구성정보) 상세 (game_package_view) — 비공개/리다이렉트

## 원본
- 파일: `pc/game/game_package_view.html` (635줄).
- **IP 접근 제한(비공개 WIP)**: 최상단에서 `$_SERVER['REMOTE_ADDR'] != "112.216.231.146"`(사무실 IP)이면 `header("HTTP/1.1 301 Moved Permanently"); Location: https://directg.net/index.php; exit`. `ini_set('display_errors','1')`(디버그 on)까지 켜짐 → **일반 공개되지 않은 내부 작업용 화면**.

## 이관 방침 (개발자 승인: 2026-09-10)
- **공개 관측 동작 = 홈 리다이렉트**를 재현한다. 전체 상세 UI는 구현하지 않는다(legacy에서 아무도 못 보던 화면을 새로 노출하면 오히려 parity 이탈).
- 라우트 `app/(pc)/game/game_package_view.html/page.tsx` — 무조건 `/`로 `permanentRedirect`(legacy 301 → Next 308). 사무실 IP 분기는 인프라 특화라 재현하지 않음(모든 방문자 = 공개 동작).
- entity/screen/mock 없음.

## 참고 (전체 UI — 미구현, 향후 공개 시)
- getGoodsItemDetailSku + getTitleDetail + getGoodsDescription + getGoodsOptionDescription(bonus_description) + getGoodsOptionPackageInfo + getRecommandTitle. 번들 카드 + 구성정보 안내 2종 + 구성정보 상세 + 특전안내(is_bonus) + 우측 title/age/정보dl/추천(RecommandCard). cart/wishlist 게이트 없음. og:type=website, author="다이렉트 게임즈". breadcrumb(다이렉트 게임즈 > 게임 > title_name).

## Parity 체크리스트
- [ ] `/game/game_package_view.html` 접근 시 `/`로 영구 리다이렉트
