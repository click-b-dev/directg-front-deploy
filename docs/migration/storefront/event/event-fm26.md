# 이벤트 상세 — 풋볼 매니저 26 예약구매 이벤트 (event/event-fm26)

## 원본
- 파일: `pc/event/event_fm26.html` (개별 이벤트 상세 겸 응모 페이지. 이벤트 목록 `event.html`의 `event_link_url`로 연결되는 유형. **legacy에 범용 이벤트 상세 라우트 없음** — 개별 이벤트마다 전용 하드코딩 페이지)
- 응모 처리: `pc/event/event_fm26_ps.php` (AJAX POST, `login_check` 세션 필수)
- **DB**: 리뉴얼 DB(`$dsn`) + `PurchaseEvent` 클래스
- 세션: `$_SESSION['member']['m_no']` — **공개 페이지**(미로그인 열람 가능, 응모만 로그인 필요). optional 세션.
- 참조: `docs/design-system/client.md`, `../legacy-project/docs/PROMOTION-EVENT-OPS.md`, `MEMBER-LIFECYCLE.md`
- 선례: `screens/event-list`(breadcrumb·container), `entities/member-auth`(`getMemberSession` optional), `entities/mypage-gift`(client mutation)

## ⚠️ 개발자 승인 사항 (verbatim parity)
- 🔴 **하드코딩 m_no 화이트리스트 5개**(121876·823942·895084·1023882·1173998): 초기 상태조회·응모 처리에서 `event_result1="1"`(대상자 강제) 처리. **백엔드 verbatim**(retail-order-view 하드코딩 선례와 동일 방침).
- 🔴 **종료 이벤트**(2025-11-05 마감): 하드코딩 콘텐츠(날짜·안내문·이미지 URL)를 legacy 그대로 이식. 종료 여부와 무관하게 마크업 verbatim.
- 게임 배너 링크 `/game/game_view.html?product_id=af3cca1a-...`(게임 상세 미이관)·구글폼 URL은 legacy 그대로.

## 화면·플로우
- 진입 URL: `/event/event_fm26.html` (GET 파라미터 없음).
- 레이아웃: `div.wrap`(layout) > header > breadcrumb(`container mt-3`: 다이렉트 게임즈 > 이벤트(링크 `/event/event.html`) > 풋볼 매니저 26 예약구매 이벤트) > `container my-3 pb-5` > main > `section#content.content.rounded-0`.
- 구성(위→아래):
  1. 게임 배너: `<a href="/game/game_view.html?product_id=af3cca1a-...">` > `<img src="https://image.directg.net/k834JLUyrH" class="w-100">` (border wrap)
  2. 안내문: `※ 페이지 하단에 버튼을 통해 사은품 획득 또는 응모하실 수 있습니다...` (text-danger)
  3. 이벤트 안내 카드(정적 하드코딩): 제목·이벤트 내용(#01/#02)·기준·기간·당첨자 안내 + 유의사항 8줄(alert)
  4. **미로그인 배너**(`m_no==""`): "이벤트 참여를 위해서는 로그인이 필요합니다." (bg-danger)
  5. **이벤트#01 카드**(포인트 3,000원): 이미지 + 안내 + 버튼영역(`if m_no`)
  6. **이벤트#02 카드**(포인트 10,000원): 이미지 + 안내 + 버튼(`if m_no`)

### 세션 분기 (legacy 정확)
- **미로그인(m_no 없음)**: 상단 "로그인 필요" 배너 표시. #01/#02 카드의 버튼 영역 자체 미출력.
- **로그인(m_no 있음)**:
  - #01 버튼영역(`div.mt-auto.d-flex.flex-row`):
    - `event_result1=="0"` → **미달성** 뱃지(`badge text-bg-warning`)
    - else `chk_event_member1=="Y"` → **수령완료** 뱃지(`badge text-bg-danger`)
    - else → **포인트 수령** 버튼(`btn btn-primary btn-lg btn_event`, `data-no=38`)
  - #02 버튼: **구글폼 바로가기** 버튼(`btn_event`, `data-no=39`, 조건 없음 — 항상 표시)

### 응모 AJAX (event_fm26_ps.php)
- jQuery `.btn_event` click → `POST event_fm26_ps.php` `{event_no}` (dataType json)
- 응답 분기:
  - `result_code=="success"` → `alert(result_msg)` + `location.reload()`
  - `result_code=="request"` → `window.open(result_url, "_blank")` (reload 없음)
  - else(`fail`) → `alert(result_msg)` + `location.reload()`
- 서버 로직(event_no별):
  - **38**(#01 포인트 수령): `chkEventOrderGoods_v2(38)` 대상자 + `chkEventMemberLog(38)` 중복 확인
    - 중복(`chk=="Y"`) → fail "계정당 1회에 한해서만 이벤트 참여가 가능합니다."
    - 미달(`event_result1` false) → fail "이벤트를 충족하지 못하였습니다. 구매 및 키활성화 완료 후 다시 시도해 주세요."
    - 성공 → `setEventPointSend(3000)` + `setEventMemberLog` → success "포인트 지급이 완료되었습니다. [마이페이지 - 포인트] 메뉴에서 확인하실 수 있습니다"
  - **39**(#02 구글폼): 미참여면 `setEventMemberLog` → request, `result_url="https://forms.gle/LbkSuoDVhRyD7XFM7"`

## SSR·SEO (legacy)
- head: `<title>풋볼 매니저 26 예약구매 이벤트</title>`, `description=""`, `author=H2interactive`.
- **canonical**: `https://directg.net/event/event_fm26.html`
- **alternate(모바일)**: `media="only screen and (max-width: 640px)"` → `https://m.directg.net/event/event_fm26.html` (legacy엔 hreflang="ko-kr"도 있으나 notice-view 선례대로 media만 재현)
- viewport: `width=device-width, initial-scale=1.0`. `data-bs-theme="dark"`. page/*.css 없음(custom/directg/styleguide는 layout 전역).
- SSR 콘텐츠 + 응모 버튼만 client(AJAX).

## 데이터 (legacy) — PurchaseEvent
- `chkEventOrderGoods_v2(38, m_no)`: `tbl_order`(step=2) ⨝ `tbl_order_item`(status=2, is_actv=1) 에서 `product_code IN ('50004360','60000076')`(FM24·FM26) distinct count==2 → `"1"`, else `"0"`. (기간 2023-09-14~2025-11-05)
- `chkEventMemberLog(event_no, m_no)`: `tbl_event_log` 참여이력 count>0 → `"Y"`, else `"N"`
- `setEventPointSend(m_no, event_no, 3000, gift_info)`: `tbl_emoney_log` insert(포인트 지급, ordno=`event_{m_no}_{event_no}`)
- `setEventMemberLog(m_no, m_id, event_no, member_data)`: `tbl_event_log` insert(참여이력)
- 회원정보: `tbl_member`(m_no,m_id,name,birth_day,is_auth,hp) — 응모 시 조회

## API 계약 (백엔드 전달)
- `GET /api/events/fm26/status` (세션 필수) → `{ eventResult1: "0" | "1"; chkEventMember1: "Y" | "N" }`
  - 백엔드: `chkEventOrderGoods_v2(38)` + `chkEventMemberLog(38)`. **하드코딩 m_no 5개는 eventResult1="1" verbatim**. 미로그인이면 프론트가 호출 안 함(member null → 스킵).
- `POST /api/events/fm26/apply` (세션 필수) body `{ event_no: 38 | 39 }` → `{ result_code: "success" | "fail" | "request"; result_msg?: string; result_url?: string }`
  - 백엔드: event_no별 대상자/중복 확인, 포인트 지급/이력, **legacy 메시지·result_url verbatim**. 하드코딩 m_no verbatim.
- 응답 타입: `entities/event/model/fm26-types.ts`

## 타겟 매핑
- 라우트: `app/event/event_fm26.html/page.tsx` (server) — `getMemberSession()`(optional) + 로그인 시 `getFm26Status()` SSR. metadata(title/canonical/alternate).
- screen: `screens/event-fm26/ui/event-fm26-screen.tsx` (server) — breadcrumb + 하드코딩 콘텐츠 + 세션 분기(미로그인 배너/뱃지/버튼). props: `member`, `status`.
- client: `screens/event-fm26/ui/event-apply-button.tsx` (`'use client'`) — `postFm26Apply(eventNo)` + 응답 분기(success/request/else). data-no 재현.
- entities: `entities/event` 확장 — `getFm26Status`(server, 세션 쿠키) + `postFm26Apply`(client) + `fm26-types.ts`
- mock: `shared/mocks/fixtures/event-fm26.ts`(status) + handlers `GET */api/events/fm26/status`, `POST */api/events/fm26/apply`

## Parity 체크리스트
- [ ] breadcrumb 3단(이벤트 링크) + 게임 배너 링크(w-100) + 안내문
- [ ] 이벤트 안내 카드(제목/#01·#02 내용/기준/기간/당첨자/유의사항 8줄) 하드코딩 verbatim
- [ ] 미로그인: 로그인 배너 + 버튼영역 미출력 / 로그인: #01 뱃지·버튼 3분기 + #02 구글폼 버튼
- [ ] 응모 AJAX 응답 분기(success alert+reload / request window.open / fail alert+reload) + 메시지 verbatim
- [ ] 하드코딩 m_no(백엔드) / SEO(title/canonical/alternate media/viewport)
