# 모바일 자료실 (board/dataroom) — PC 전용 안내

> legacy `mobile/board/dataroom.html` → `/m/board/dataroom.html`.
> **중요**: 모바일 자료실은 실제 자료실이 아니라 **"PC 전용" 정적 안내 화면**이다.
> 데이터 조회·목록·다운로드 **전부 없음**(PC `entities/board-dataroom` **미사용**).

## 원본 (legacy mobile)
- 파일: `mobile/board/dataroom.html` (129줄). `lib.php` include + `$page_title="자료실"`만. **DB/도메인 클래스 호출 없음.**
- PC 대응(`docs/migration/storefront/board/dataroom.md`, `entities/board-dataroom`, 다운로드 POST)는 모바일에서 **미사용**(모바일은 PC로 유도).

## 화면·플로우 (legacy mobile 기준)
- 진입: `/board/dataroom.html` (파라미터 없음).
- 셸: `sub_header`(pageTitle="자료실") + `appCapsuleSub`(inline `padding-top:56px`).
- 본문: `div.pc-only-container > div.pc-only-card`:
  - `div.icon-wrapper > svg`(48x48 모니터 아이콘, path fill #6c757d)
  - (주석 `h5.pc-only-title "PC 버전 전용 메뉴입니다"` — 미출력)
  - `p.pc-only-desc "자료실은 PC 환경에서만 지원됩니다."`
  - `a[/].btn.btn-primary.btn-home "메인으로 이동"`
- 페이지 전용 `<style>`: `#appCapsuleSub{padding-top:56px}` + `.pc-only-container/.pc-only-card/.icon-wrapper/.pc-only-title/.pc-only-desc`(카드 스타일). `.btn-home` 규칙은 legacy 주석 → 미포함.

### 세션/인터랙션
- 없음. 정적 안내 + 메인 링크뿐.

## 모바일 head / 앱셸
- viewport: device-width, scale 1 고정, viewport-fit=cover, theme #000. apple-web-app.
- metadata: title="자료실", description/keywords 빈값.
- 자산: 인라인 SVG(모니터 아이콘). 신규 이미지 없음.

## 데이터 (재사용/증분)
- **재사용/증분 없음**. 데이터 조회 자체가 없다(정적 화면).
- PC `board-dataroom`(getBoardDataroom/postDataroomDownload)는 **미사용** — 모바일은 다운로드를 PC로 유도.

## API 계약 (증분)
- **없음**. mock 불필요.

## 타겟 매핑
- **middleware MOBILE_ROUTES**: `"/board/dataroom.html"` **추가**.
- **라우트**: `app/m/board/dataroom.html/page.tsx`(server) — viewport/metadata + 페이지 style + `MobileDataroomScreen`.
- **screen**: `screens/mobile-dataroom`(server 정적) — `MobileSubHeader("자료실")` + appCapsuleSub + pc-only-card(인라인 SVG + 안내문 + 메인 링크).
- **재사용 entities**: 없음.
- **mock**: 없음.

## Parity 체크리스트 (모바일 UA)
- [ ] pc-only-card: 모니터 아이콘 SVG + "자료실은 PC 환경에서만 지원됩니다." + "메인으로 이동"(→ `/`)
- [ ] (주석 title "PC 버전 전용 메뉴입니다" 미출력)
- [ ] head: title "자료실"/theme #000/appCapsuleSub padding-top 56px + pc-only 스타일
- [ ] middleware `/board/dataroom.html` rewrite(모바일 UA→/m) / 데스크톱 PC(실제 자료실) 유지
- [ ] 데이터 조회·다운로드 없음(정적)

## 보류/후속
- 없음(모바일 자료실은 의도적으로 PC 전용 안내 — legacy 그대로).
