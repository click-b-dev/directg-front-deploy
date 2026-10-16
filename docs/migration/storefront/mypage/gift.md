# 사은품 내역 (mypage/gift)

## 원본
- 파일: `pc/mypage/mypage_gift.html` (+ `mypage_gift_proc.php`, `licence_activate.php` getGiftView)
- 도메인 클래스: `Mypage::getGiftList`/`getGiftMember`/`updateGiftMemberAddress`/`updateGiftMemberAsset` (dgkr DB), `Asset`(키예약), `Licence`(캐시)
- 참조: `docs/design-system/client.md`, `PROMOTION-EVENT-OPS.md`, `MEMBER-LIFECYCLE.md`
- 선례: `entities/mypage-qna`(세션 목록), `shared/lib/daum-postcode`(주소 모달 재사용), 로그인/쿠폰(client fetch)

## 화면·플로우
- 진입 URL: `/mypage/mypage_gift.html`. **login_check(세션 필수)**.
- 레이아웃: `container my-3 pb-5` > `main.d-grid.gap-3`(240px auto) > aside_mypage + `section#content.content.rounded-0.font-14`
- 상단 안내 카드(3 li): 당첨내역·수령기한·배송주소입력 안내
- 표 6열: 이벤트명(title)/사은품(gift_nm)/배송/키확인/상태/비고
  - **배송**: is_delivery=Y & status=0 → `배송주소입력` 버튼(giftModal 열기, data-idx/data-delivery)
  - **키확인**: is_delivery=N → status=0이면 `키수령`(btn_event_gift_confirm, data-idx/parent) / status≠0이면 `키확인`(licenceModal 열기, data-reserveid/ordno)
  - **상태**: status=2 & tracking_no → `배송조회`(외부 택배사) / else → status_array[status]
  - **비고**: address_enddt 있으면 (is_delivery=Y?"입력기한":"수령기한") + address_enddt
- status_array: 0 당첨완료 / 1 발송요청 / 2 배송중 / 3 수령완료
- **페이지네이션 UI 없음**(legacy `$order_list` 미정의 버그 → 미렌더)
- 모달 2개:
  - **giftModal**(배송지 입력): name/zipcode(+우편번호찾기 Daum)/address/address_detail/tel + 선택완료. 열릴 때 idx·is_delivery 주입.
  - **licenceModal**(제품키): ordno span(legacy JS 미설정=빈값) + licence_result(getGiftView HTML)
- 인터랙션(legacy jQuery):
  - 배송주소입력 → giftModal, 선택완료 → 필드 검증(name/zipcode/address/address_detail/tel) → POST gift_proc(serializeArray) → alert(data) + reload
  - 키수령 → POST gift_proc {mode:setGiftChoice, idx}(json) → alert(msg) + reload
  - 키확인 → LoadingOverlay + POST licence_activate {mode:getGiftView, ordno, reserve_id}(json) → error_code=0이면 licence_result=error_msg, 아니면 alert("관리자에게 문의해주세요")
  - 배송조회 → 폼 생성 POST target=_blank: delivery_code=002 → 우체국(`service.epost.go.kr/trace.RetrieveDomRigiTraceList.comm`, sid1) / else CJ대한통운(`trace.cjlogistics.com/web/detail.jsp`, slipno)
- 세션/권한: **로그인 필수**

## 데이터 (legacy)
- `getGiftList`: `SELECT a.title,a.gift_nm,a.is_delivery,b.parent_idx,b.reserve_id,b.m_id,b.tracking_no,b.status,b.ordno,b.delivery_code,a.address_enddt,b.idx FROM tbl_event_gift a INNER JOIN tbl_event_gift_member b ON a.idx=b.parent_idx WHERE b.m_id='{세션}' ORDER BY b.idx DESC` (20/page, UI 미페이징)
- gift_proc(mode 무시, is_delivery/status 분기): status=0 & is_delivery=Y → `updateGiftMemberAddress`("사은품 발송신청이 완료되었습니다.") / status=0 & 키 → 수령기한 체크 후 `Asset::runReserveGift`+`updateGiftMemberAsset`+캐시면 `Licence::setEmoney`("사은품 지급이 완료되었습니다.") / status≠0 → "이미 사은품신청이 완료된 주문건입니다." — **키예약·캐시·메일은 전부 백엔드 책임**
- getGiftView(licence_activate): `{error_code, error_msg}` — error_code="0"이면 error_msg가 제품키 HTML

## API 계약 (백엔드 전달)
- `GET /api/mypage/gift?page=N` (세션) → `{ list: GiftItem[] }`
  - `GiftItem { idx, title, gift_nm, is_delivery, parent_idx, reserve_id, tracking_no, status, ordno, delivery_code, address_enddt }`
- `POST /api/mypage/gift/claim` (세션) — `{ idx, is_delivery, name?, zipcode?, address?, address_detail?, tel? }` → `{ msg }`
  - 백엔드: getGiftMember status/is_delivery 분기(주소저장 발송신청 / 키예약·캐시지급), 수령기한 검증, 상기 로직 전부 백엔드
- `POST /api/mypage/gift/licence` (세션) — `{ ordno, reserve_id }` → `{ error_code, error_msg }` (error_code="0"이면 error_msg=키 HTML)
- 배송조회는 API 아님 — 외부 택배사 폼 POST(우체국/CJ) target=_blank 재현
- 응답 타입: `entities/mypage-gift/model/types.ts`

## 타겟 매핑
- 라우트: `app/mypage/mypage_gift.html/page.tsx` → `/mypage/mypage_gift.html` (`requireMemberSession()`, getMypageGift deep import)
- screen: `screens/mypage-gift` (server) — aside + 안내 + `<GiftList items>`(client)
- 컴포넌트: `screens/mypage-gift/ui/gift-list.tsx` (`'use client'`) — 표 + 조건부 버튼 + 모달2(React 제어, Bootstrap 스타일) + Daum(주소) + 키수령/키확인/배송조회
- shared: `shared/lib/daum-postcode`(기존) 재사용
- entities: `entities/mypage-gift` (`getMypageGift` server, `postGiftClaim`·`postGiftLicence` client)
- widget: `widgets/mypage-aside`(기존) active=gift
- mock: `shared/mocks/fixtures/mypage-gift.ts` + handler `GET /api/mypage/gift`, `POST /api/mypage/gift/claim`, `POST /api/mypage/gift/licence`

## 단위 경계 결정 / quirk
1. 백엔드 헤비 로직(Asset 키예약·캐시·메일)은 계약만 정의, 백엔드 책임. mock은 대표 msg 반환.
2. 모달 2개는 React 상태로 제어하되 Bootstrap `modal show d-block`+`modal-backdrop` 스타일 재현(전역 Bootstrap JS data-api 비의존).
3. Daum(주소 모달) = `shared/lib/daum-postcode` 재사용.
4. 배송조회 외부 폼 POST(우체국 002 / CJ 그외) target=_blank 재현.
5. 페이지네이션 UI 없음(버그) 재현.
6. licenceModal ordno span은 legacy JS 미설정 → 빈값 유지.
7. LoadingOverlay → 로딩 상태(버튼/모달 처리중)로 대체.
8. 키수령/주소저장 성공 시 `location.reload()` 재현.

## Parity 체크리스트
- [ ] aside_mypage(사은품 내역 active) + 안내 3 + 표 6열
- [ ] 조건부 버튼(배송주소입력/키수령/키확인/배송조회/상태 텍스트) 분기 정확
- [ ] giftModal 주소입력 + Daum 우편번호 + 선택완료 검증·저장
- [ ] 키수령 → alert(msg) + reload
- [ ] 키확인 → licenceModal에 제품키 HTML
- [ ] 배송조회 → 우체국/CJ 외부 폼 새 탭
- [ ] 페이지네이션 없음 / SEO(title 사은품 내역/viewport/description 빈값/author H2interactive)
