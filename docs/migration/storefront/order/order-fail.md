# 주문실패 (order_fail.html)

order 영역 소형 단위. 결제 실패 시 표시되는 정적 에러 화면. **로그인 게이트 없음(public)**.

## 원본
- 파일: `pc/order/order_fail.html`(76줄, 라이브)
- 참조: `docs/design-system/client.md`

## 화면·플로우
- 진입 URL: `/order/order_fail.html?aspOrderNum=&msg=&message=`. PG 결제 실패 redirect 목적지.
- **login_check 없음** — lib.php만 include(line 2). 공개 페이지.
- 데이터: `$order = new Order($conn)` 생성하나 **미사용**(getOrder 호출 없음). `aspOrderNum` 읽으나 미사용. → 실질 데이터 없음, 정적 화면 + `msg`/`message` 쿼리 표시만.
- 화면 요소:
  - 중앙 정렬 에러 카드(col-lg-6): `h1.text-error > i.mdi-alert-circle-outline` + `h4.text-uppercase.text-danger` "고객님께 불편을 드려서 대단히 죄송합니다."
  - `ul.list-group.list-group-flush`: li "* 주문과 결제가 실패하였습니다." / li "* 다시 주문/결제 과정을 진행하여 주십시오." / (`msg` 있으면) li `{msg}{message}`
  - `a.btn.btn-info` "홈으로 이동" → **`/index.html`** (order_end의 /index.php와 다름, verbatim)
  - **footer_banner·step nav 없음**(cart/order/order_end와 다름)
- 분기: `if($msg)`일 때만 msg li 렌더(msg만 판정, message는 함께 출력).

### 세션/권한 의존
- 없음(public). requireMemberSession 미적용.

## SSR·SEO
- head: `<title>주문실패</title>`, description/author 빈값, viewport width=device-width,initial-scale=1. canonical/OG 없음. 페이지 전용 CSS 없음. 완전 SSR(인터랙션 없음).

## 데이터 (legacy)
- 없음(API 호출 없음). msg/message는 쿼리 파라미터.

## API 계약
- 없음(정적 화면).

## 타겟 매핑
- 라우트: `app/(pc)/order/order_fail.html/page.tsx`(server, searchParams msg/message, **가드 없음**, metadata "주문실패")
- screen: `screens/order-fail` — `order-fail-screen.tsx`(server 정적, msg 조건부 li)
- entities/mock: 없음. widgets: 없음(footer_banner 미사용).

### 구현 노트(idiomatic)
- `$order` 생성·`aspOrderNum` = legacy cruft(미사용) → 이관 생략.
- msg/message는 searchParams에서 읽어 텍스트 렌더(React 자동 이스케이프 — legacy raw echo 대비 XSS만 방지, 정상 메시지 표시 동일).

## Parity 체크리스트
- [ ] 에러 아이콘·죄송 메세지·정적 li 2개
- [ ] msg 조건부 li({msg}{message})
- [ ] 홈으로 이동 → /index.html
- [ ] footer_banner·step nav 없음
- [ ] SEO title "주문실패"·빈 desc·viewport
- [ ] 로그인 게이트 없음(public)

## 보류/후속
- settle.html + PG: 하드 게이트(order_fail 실제 진입 = PG 실패 redirect).
