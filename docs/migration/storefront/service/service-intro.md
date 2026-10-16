# 서비스소개 (service / 다이렉트 게임즈 소개)

## 원본
- 파일: `pc/service/service.html` (라이브 — 헤더 "서비스소개" 링크 `/service/service.html`, `pc/inc/header.html:82` 등 모든 헤더 변형에서 참조)
- **죽은 파일**: `pc/service/service2.html`은 어디서도 참조 안 됨(미이관). aside 없음.
- 자산: `pc/assets/images/service/`(마스트헤드 bg·로고·progressbar·혜택카드 02-xx·`v4/<name>_partners_contents_{0,1}.png`) → `public/assets/images/service/` 무수정 복사
- 페이지 CSS: head `<style>` 블록(~380줄) → `public/assets/css/page/service-inline.css` (home의 `main-inline.css` 선례)
- 폰트: Google "Do Hyeon" (`<link>`)
- 참조: `docs/design-system/client.md`

## 화면·플로우
- 진입 URL: `/service/service.html` (파라미터 없음, GET). 세션/권한 의존 없음.
- 레이아웃(legacy): `<div class="wrap">`(layout) > `<div class="my-3 pb-5">` > `<main>` (※ `container` 최상위 아님 — 마스트헤드/본문이 각자 내부 `.container` 보유)
  - **마스트헤드 히어로** `div.wrap.t3-masthead` > `ja-masthead`(bg 이미지 `#ja-masthead-bg` + `.container.pt-5` > `ja-masthead-detail`): 태그 4개(`#상시할인/#정기프로모션/#실시간코드확인/#정식라이센스`) + h3 타이틀 + h2int 로고+설명
  - **본문** `#t3-mainbody.wrap.t3-mainbody`(min-height:620px) > `.container` > `.row` > `#t3-content.t3-content.col-md-12`(padding-top:0px)
    - 섹션1 "보다 믿을 수 있는 서비스 제공을 약속합니다": label1 3개(NO! …) + progressbar(publisher/dg active/member 이미지 3개) + font18 문구 3줄
    - 섹션2 "다이렉트 게임즈 회원만의 혜택이 기다립니다": `section_item` 카드 6종(정식라이센스/프로모션·이벤트/편리한로그인/원활한소통/실시간코드/다양한결제). 앞 3개는 `section_tail` btn_link(모든게임/프로모션/회원가입, `target="_blank"`), 뒤 3개는 링크 없음
    - (주석처리된 "플랫폼별 이용방법" 섹션 — HTML 주석, 미렌더)
    - 섹션3 "세계 유수의 파트너들이 함께합니다": PHP `$publisher_array` 루프 → `section_item3` 퍼블리셔 로고 그리드
- 인터랙션: 퍼블리셔 로고 **jQuery hover 스왑**(mouseover: src `_0`→`_1` + 부모 배경 #fff / mouseout: 전체 복원 `_0` + #131B26). **개발자 게이트 결정(2026-09-03): React 클라이언트 컴포넌트로 재현**(Next 앱에 jQuery 미로드).

## 퍼블리셔 데이터 (legacy `$publisher_array`)
- 75개 리터럴 쌍. **키 "53" 중복**("Aspyr" 후 "Atari") → PHP 연관배열 last-wins로 **53=Atari, Aspyr 제외 → 74개**. TS는 `code→name` Map dedup(last wins)로 동일 재현.
- `array_multisort($names, SORT_ASC, ...)` → 이름 ASC 정렬. 이름 전부 ASCII(문자/숫자/하이픈) → JS 기본 코드유닛 정렬(`< / >` 비교)이 PHP SORT_REGULAR strcmp와 동일. `localeCompare` 미사용.
- 렌더: `section_item3 > img src="/assets/images/service/v4/<name>_partners_contents_0.png?4" alt="<name>"`. legacy가 계산하는 `$publisher_link`는 이 섹션에서 **미사용 죽은 코드** → img만 렌더.

## SSR·SEO (legacy)
- title `다이렉트 게임즈 소개`, viewport `width=device-width, initial-scale=1.0`
- `description=""`, **`author=""`(빈값)**, canonical/OG/구조화데이터 없음
- 페이지 CSS `<style>` → `service-inline.css` 링크. Do Hyeon 폰트 링크. (전역 `footer{}` 오버라이드 포함 — 이 페이지 한정 풀페이지 네비이므로 parity 유지)
- SSR/CSR: 마스트헤드·섹션·퍼블리셔 그리드는 SSR. 퍼블리셔 hover만 CSR(`'use client'`).

## 데이터 (legacy)
- DB/SQL/AJAX: 없음. `$publisher_array`는 하드코딩 정적 배열.

## 결제(PG)
- 해당 없음

## API 계약 (백엔드 전달)
- **없음** — 완전 정적(퍼블리셔 배열도 하드코딩). entity/fetcher/MSW 불필요.

## 타겟 매핑
- 라우트: `app/service/service.html/page.tsx` → `/service/service.html`
- screen: `screens/service-intro` (서버 컴포넌트) — 마스트헤드/섹션/CSS·폰트 링크
- 컴포넌트: `screens/service-intro/ui/publisher-partners.tsx` (`'use client'`) — 퍼블리셔 그리드 + hover 스왑
- 자산: `public/assets/images/service/**` (복사), `public/assets/css/page/service-inline.css` (신규)

## 단위 경계 결정 / legacy quirk
1. `service2.html` 죽은 파일 → 미이관.
2. 퍼블리셔 키 53 중복(Aspyr/Atari) → last-wins(Atari) 재현.
3. `$publisher_link` 죽은 코드 → 미사용.
4. 주석처리 "플랫폼별 이용방법" 섹션 → 미렌더.
5. hover 스왑 → React 클라이언트 컴포넌트(개발자 게이트 승인).
6. 최상위 `container` 아님 — `my-3 pb-5` > main, 내부 마스트헤드/본문에 `.container`.
7. 인라인 style 속성(`ja-masthead-bg` bg-image, `t3-content` padding-top:0px, section_item p font-size 등) 원문 유지.

## Parity 체크리스트
- [ ] 마스트헤드(태그4·타이틀·로고·설명·bg) 일치
- [ ] 섹션1 label1 3개 + progressbar 이미지3 + 문구3 일치
- [ ] 섹션2 혜택 카드 6종(이미지·문구·btn_link 3개 target=_blank) 일치
- [ ] 섹션3 퍼블리셔 74개(53=Atari, Aspyr 제외) 이름 ASC 정렬·img src `?4` 일치
- [ ] 퍼블리셔 hover 스왑(_0↔_1 + 배경 #fff) 동작
- [ ] SEO(title/viewport/description/author 빈값) 일치, canonical/OG 없음
- [ ] service-inline.css + Do Hyeon 폰트 로드
