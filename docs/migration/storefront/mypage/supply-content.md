# 제공콘텐츠 (mypage/supply_content_v2)

## 원본
- 파일: `pc/mypage/mypage_supply_content_v2.html` (aside가 링크하는 **라이브 버전**; `mypage_supply_content.html`은 구버전) + `mypage_supply_content_log.php`(다운로드 로그)
- 도메인: `sp_supply_goods_chk4`(dgkr), `sp_supply_content_chk`(dg) 저장 프로시저 2개 + `Mypage::patchEncDataMember`(패치 인증 인코딩)
- 참조: `docs/design-system/client.md`, `MEMBER-LIFECYCLE.md`
- 선례: `entities/mypage-qna`(세션 목록), 자료실(다운로드+로그), gtag(layout 전역)

## 화면·플로우
- 진입 URL: `/mypage/mypage_supply_content_v2.html`. **login_check(세션 필수)**.
- 레이아웃: `container my-3 pb-5` > `main.d-grid.gap-3`(240px auto) > aside_mypage + `section#content.content.rounded-0`
- 표 4열(`table table-bordered table-dark`, thead font-14):
  - 제공콘텐츠 유형: supply_content_type P→"한글패치" / C→"콘텐츠"
  - 제공콘텐츠명: supply_content
  - 한글패치 인증정보: is_encode=Y면 `아이디: {m_id}` + `비밀번호: {patchEncDataMember}`(enc_data span)
  - 다운로드: `button.btn-danger.btn_download`(data-url/patchname/ordno)
- 인터랙션(jQuery): btn_download → `window.open(file_url,"_blank")` + `gtag('event','download_click',{event_category:'제공콘텐츠', event_label:patch_name})` + fire-and-forget `POST mypage_supply_content_log.php {file_url,ordno,patch_name}`
- 세션/권한: **로그인 필수**

## 데이터 (legacy)
- `sp_supply_goods_chk4(m_no)`(dgkr) + `sp_supply_content_chk(m_id)`(dg) 호출 → array_merge → supply_content 기준 SORT_DESC 정렬 → `array_unique(supply_content)`로 dedup → array_intersect_key → values
- 행 필드: supply_content_type, supply_content, is_encode, idx, supply_content_url, ordno, encode_type
- `patchEncDataMember(m_id, prefix_text, encode_type)`: patch_auth 맵(idx별 prefix_text/encode_type: base64는 substr(base64(prefix+m_id),11), md5는 md5 소문자) → 패치 인증 비번
- **저장 프로시저·merge/dedup·patchEncDataMember 인코딩은 전부 백엔드 책임**

## API 계약 (백엔드 전달)
- `GET /api/mypage/supply-content` (세션) → `{ list: SupplyContentItem[] }`
  - `SupplyContentItem { supply_content_type, supply_content, is_encode, auth_password, supply_content_url, ordno }`
  - 백엔드: 프로시저 2개 호출·merge/dedup(supply_content 기준)·정렬, is_encode=Y 행은 `patchEncDataMember` 결과를 `auth_password`로 반환
- `POST /api/mypage/supply-content/log` (세션) `{ file_url, ordno, patch_name }` → fire-and-forget(다운로드 로그)
- 아이디 표시값은 세션 m_id(프론트가 requireMemberSession에서 취득)
- 응답 타입: `entities/mypage-supply-content/model/types.ts`

## 타겟 매핑
- 라우트: `app/mypage/mypage_supply_content_v2.html/page.tsx` → `/mypage/mypage_supply_content_v2.html` (`requireMemberSession()`→session.m_id, getSupplyContent deep import)
- screen: `screens/mypage-supply-content` (server) — aside + 표(유형/명/인증정보 m_id·auth_password) + `<SupplyDownloadButton>`(client)
- 컴포넌트: `screens/mypage-supply-content/ui/supply-download-button.tsx` (`'use client'`) — window.open + gtag + 로그 fetch
- entities: `entities/mypage-supply-content` (`getSupplyContent` server, `postSupplyContentLog` client)
- widget: `widgets/mypage-aside`(기존) active=supply_content
- mock: `shared/mocks/fixtures/mypage-supply-content.ts` + handler `GET /api/mypage/supply-content`, `POST /api/mypage/supply-content/log`

## 단위 경계 결정 / quirk
1. 프로시저·merge/dedup·patchEncDataMember 인코딩은 백엔드가 해석해 SupplyContentItem으로 반환(auth_password 포함).
2. 아이디는 세션 m_id 표시.
3. 다운로드: window.open + gtag('event','download_click') + fire-and-forget 로그 재현. gtag는 layout 전역.
4. SEO 잔재: viewport `shrink-to-fit=no`(드롭, address와 동일), description/keywords 빈값, **author 메타 없음**, pragma/cache-control.
5. enc_data span의 `<?=$loop?>`(미정의) suffix는 빈값 → 클래스 `enc_data` 유지.
6. 페이지네이션 없음(프로시저 결과 전량 표시).

## Parity 체크리스트
- [ ] aside(제공콘텐츠 active) + 표 4열
- [ ] 유형 라벨(한글패치/콘텐츠), 인증정보(is_encode=Y시 아이디/비밀번호)
- [ ] 다운로드 → window.open + gtag 이벤트 + 로그 POST
- [ ] SEO(title 제공콘텐츠/viewport/description·keywords 빈값/author 없음)
