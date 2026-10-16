# 메인 2-M: head metadata + 그리드 CSS + 추적코드

메인 `pc/index.php` head 이관(메인 페이지 마무리). SEO 메타 + 인라인 그리드 style + 추적코드.

## 원본
- `pc/index.php` head(59–225): title/meta/link + 인라인 `<style>`(128–225) + GTM/gtag/Clarity

## 화면·플로우 / SSR·SEO
### SEO 메타 (메인 page)
- `<title>다이렉트 게임즈</title>`
- description, Keywords(다이렉트 게임즈,다렉,H2,…), author=H2interactive
- viewport = `width=device-width` (**initial-scale 없음** — Next 기본과 다름)
- canonical `https://directg.net`
- alternate `media="only screen and (max-width: 640px)" href="https://m.directg.net" hreflang="ko-kr"`
- shortcut icon `/favicon.ico?t=20250828`
- **OG/twitter 태그 없음**(legacy 미존재)

### 그리드 인라인 style (128–225) — 레이아웃 필수
- `#best_game .d-grid` repeat(6), `#publisher_area.d-grid` repeat(3), `#platform .d-grid` repeat(4), `#goods_korean .d-grid` repeat(2)
- `#splide` 배너(img 1296×500, pagination), `.text-shadow`, `.badge-lg`, `.font-notosans`, `#event_banner` justify-self:center
- **없으면 d-grid 섹션이 1열로 쌓임** → 2-2/2-3/2-4 그리드 정상화에 필수

### 추적코드 (전역, 항상 로드)
- GTM `GTM-KH8W35P3` (head inline + body noscript iframe)
- gtag `G-S69YNEJF27` (async + config; 세션 미정 → 비로그인 config, user_id 없음)
- Clarity `vn7kuje787`

## 세션/권한 의존
- gtag user_id는 로그인 시만 → 비로그인 고정(보류). 그 외 없음.

## 타겟 매핑
- `app/page.tsx`: `export const metadata`(title/description/keywords/authors/alternates/icons) + `export const viewport`
- `public/assets/css/page/main-inline.css`: 인라인 style 파일화(무수정) → `screens/home`에서 link
- `public/favicon.ico`: 복사
- `app/layout.tsx`: GTM/gtag/Clarity(head inline script) + GTM noscript(body) — 전역, 환경 분기 없음(개발자 지시)

## Parity 체크리스트
- [ ] title/description/keywords/author/canonical/alternate/icon
- [ ] viewport width=device-width(initial-scale 없음)
- [ ] 그리드 열 수(best_game 6/publisher 3/platform 4/korean 2), 배너 1296×500
- [ ] GTM/gtag/Clarity 로드(항상), GTM noscript
- [ ] OG 없음(추가 금지)

## 보류/차이
- alternate: Next `alternates.media`는 hreflang 미지원 → `hreflang="ko-kr"`는 미세 누락 가능(문서화). canonical/media는 재현.
- gtag user_id: 인증 단위에서 로그인 시 주입
- `cart.html`(장바구니 모달) → order 영역 (메인 잔여)
