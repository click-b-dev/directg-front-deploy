# 메인 2-4: 퍼블리셔 안내 / 플랫폼 이용안내 / footer_banner

메인 `pc/index.php` 섹션 그룹 2-4(마지막 본문 섹션). 전부 **정적 하드코딩**(데이터/entity 없음).

## 원본
- 파일: `pc/index.php`
  - footer_banner: `inc/footer_banner.html`(index.php 394 include) — `#event_banner`, 날짜조건 `2026-06-12 ~ 2026-07-12 23:00`(만료 → 미노출)
  - 퍼블리셔: `#goods_publisher`(523–578) — 12개 정적 카드
  - 플랫폼: `#platform`(613–644) — 4개 정적 카드
- DOM 순서: 공지 → **footer_banner** → divider → recommand … preorder → **publisher** → korean → **platform** → (main 끝)

## 화면·플로우
### footer_banner (`#event_banner`)
- 날짜조건일 때만(현재 만료). 정적 이미지(`image.directg.net/n89JgzGXIY`) → `/board/notice_view.html?idx=374`

### 퍼블리셔 안내 (`#goods_publisher`)
- h2 "퍼블리셔 안내", `d-grid#publisher_area`, 12개 카드
- 각 카드: `card rounded-0 card-shadow border-0` > card-header(이름) + card-body(a.stretched-link + img w-100)
- 12개: 2K, SEGA, CAPCOM, Paradox Interactive, PlayStation PC LLC, NEOWIZ, Arc System Works, THQ Nordic, 505 Games, Focus Entertainment, Hooded Horse, Clouded Leopard Entertainment (각 `/game/publisher_*_thumb.html`, 외부 이미지 URL)

### 플랫폼 이용안내 (`#platform`)
- h2 "플랫폼 이용안내", `d-grid`, 4개 카드
- 각 카드: `div.""` > card > card-header(`bg-card text-secondary`, 이름) + card-body(a + img)
- 4개: 다이렉트 게임즈(`/service/guide.html`), 스팀(`guide_steam`), 에픽 게임즈(`guide_epic`), 락스타 게임즈(`guide_rockstar`) — 로컬 이미지 `/assets/images/common/platform_{dg_v2,steam,epic,rockstar}.png`

### 세션/권한 의존
- 없음 (전부 정적)

## SSR·SEO
- 세 섹션 SSR 정적. 자산: 플랫폼 로컬 이미지 4개(`public/assets/images/common/`) 복사. 퍼블리셔 이미지는 외부 URL. 페이지 전용 CSS 추가 없음(directg.css `#publisher_area .card` 기존 도입)

## 데이터 / API 계약
- 없음(정적 하드코딩). 백엔드 계약 불필요.

## 타겟 매핑
- widgets: `widgets/footer-banner-section`, `widgets/publisher-section`, `widgets/platform-section` (전부 정적 서버 컴포넌트)
- screen: home-screen에 DOM 순서대로 삽입 — footer_banner(공지↔divider), publisher(preorder↔korean), platform(korean 뒤)

## Parity 체크리스트
- [ ] footer_banner 날짜조건(만료→미노출)
- [ ] 퍼블리셔 12개 카드(이름/링크/이미지)
- [ ] 플랫폼 4개 카드(card-header bg-card text-secondary, 로컬 이미지)
- [ ] DOM 순서 정확(footer_banner 위치, publisher가 preorder↔korean)

## 보류/후속
- `cart.html`(장바구니 모달) → order 영역
- 메인 metadata/GTM/Clarity(2-M) → 메인 페이지 이관 마무리 단위
