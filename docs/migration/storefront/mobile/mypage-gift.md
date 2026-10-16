# 모바일 마이페이지 - 사은품 내역 (mypage_gift)

## 원본 (legacy mobile)
- 파일: `mobile/mypage/mypage_gift.html` (라이브 — `mypage_main.html:189`에서 링크) + `mypage_gift_proc.php` + `licence_activate.php`(getGiftView)
- PC 대응: `docs/migration/storefront/mypage/gift.md` (`screens/mypage-gift` + `entities/mypage-gift`). **entity/shared 재사용, 증분 없음**
- 데이터: `Mypage::getGiftList(page, b.m_id=세션, b.idx DESC)` — 키예약(Asset)·캐시(Licence)·메일은 백엔드

## 화면·플로우 (legacy mobile 기준)
- 진입 URL: `/mypage/mypage_gift.html`(GET), title "사은품 내역". **세션 필수(login_check)**
- 헤더: `inc/sub_header.html` → `MobileSubHeader("사은품 내역")`
- 본문 `#appCapsuleSub` > `section pt-2` > 카드 반복(`card mb-1`):
  - `card-header` {title}
  - `card-body`: `h6.card-subtitle` {status_array[status]} + (address_enddt≠"" → `p.d-flex.justify-content-between`[span (is_delivery=Y?"입력기한":"수령기한") + span "~{address_enddt}"]) + `p.card-text` {gift_nm} + **조건부 버튼(btn-block)**
- **버튼 분기**(카드 하나에 최대 1개):
  - is_delivery=Y & status=0 → `btn btn-info btn-block btn_event_gift_choice` "배송주소입력"(giftModal, data-idx/data-delivery)
  - is_delivery=Y & status=2 & tracking_no → `btn btn-success btn-block btn_delivery_search` "배송조회"(외부 택배 폼)
  - is_delivery=Y & status 1·3 → 버튼 없음
  - is_delivery=N & status=0 → `btn btn-primary btn-block btn_event_gift_confirm` "키수령"(data-idx/parent)
  - is_delivery=N & status≠0 → `btn btn-primary btn-block btn_event_gift_licence` "키확인"(licenceModal, data-reserveid/ordno/suppcd=1)
- status_array: 0 당첨완료 / 1 발송요청 / 2 배송중 / 3 수령완료
- **페이지네이션 UI 없음**: 하단에 `#btn_more` 엘리먼트가 렌더되지 않음. 더보기 JS는 `#coupon_table_body`·`ajax_coupon.php`를 참조하는 **copy-paste dead code**(바인딩 대상 없음) → 미이식
- 모달 2개(`modal fade dialogbox`, `border-primary` 좌측 보더):
  - **giftModal** "사은품 배송지 입력": name/zipcode(+우편번호 찾기 Daum)/address/address_detail/tel + 취소/등록. show.bs.modal에서 relatedTarget data-idx/data-delivery → hidden 주입
  - **licenceModal** "주문번호 <span id=ordno>의 제품키"(ordno span은 **legacy JS 미설정 → 빈값**) + licence_result + 닫기

## 인터랙션 (legacy JS)
- 배송주소입력 → giftModal 열기(idx/is_delivery 주입) → **등록 submit**: name/zipcode/address/address_detail/tel 순서로 빈값 검증(각 alert) → `POST mypage_gift_proc.php`(serializeArray, json) → success alert(error_msg)+reload / error console.log+alert(data)
- 우편번호 찾기 → `DaumPostcode()`(kakaocdn postcode.v2.js) → zipcode/address 채움, address_detail 포커스
- 키수령(btn_event_gift_confirm) → `POST mypage_gift_proc.php {mode:setGiftChoice, idx}`(json) → alert(error_msg)+reload / error alert(data)
- 키확인(btn_event_gift_licence) → `POST licence_activate.php {mode:getGiftView, ordno, reserve_id}` → **success: licence_result.html(data) 그대로 주입**(error_code 파싱 안 함, PC와 다름) / error alert(data)
- 배송조회(btn_delivery_search) → 동적 form POST target=_blank: delivery_code=="002" → 우체국(`service.epost.go.kr/trace.RetrieveDomRigiTraceList.comm`, sid1) / else CJ대한통운(`trace.cjlogistics.com/web/detail.jsp`, slipno)
- 세션/권한: 로그인 필수

## 모바일 head / 앱셸
- viewport device-width scale 1 고정 viewport-fit cover, theme #000, apple-web-app capable/black-translucent, title "사은품 내역", description/keywords 빈값
- 앱셸: `MobileSubHeader("사은품 내역")` + `/m/layout` bottom-nav/sidebar(표시) + bootstrap.min.js. screen은 목록/모달/폼 → **client**(카드 목록 컴포넌트)
- 페이지별 mobile-assets CSS: 없음(style/dg_style/styleguide) — bootstrap.css head 미링크(legacy 누락, 앱 번들로 커버)

## 데이터 / API 계약
- **재사용(증분 없음)**: `getMypageGift(1)`(server-only, `GET /api/mypage/gift`, `{list: GiftItem[]}`) · `postGiftClaim`(client, `POST /api/mypage/gift/claim`, `{msg}`) · `postGiftLicence`(client, `POST /api/mypage/gift/licence`, `{error_code, error_msg}`) · `openDaumPostcode`(`shared/lib/daum-postcode`) · `requireMemberSession`
- 백엔드 책임(PC 계약 동일): gift_proc is_delivery/status 분기(주소저장/키예약·캐시), 수령기한 검증, getGiftView 키 HTML
- mock 기존 재사용(gift/claim/licence handler + fixture)

## 타겟 매핑
- middleware MOBILE_ROUTES +1: `/mypage/mypage_gift.html`
- 라우트: `app/m/mypage/mypage_gift.html/page.tsx`(server, requireMemberSession + getMypageGift(1) deep import)
- screen: `screens/mobile-mypage-gift`
  - `ui/mobile-mypage-gift-screen.tsx`(server) — MobileSubHeader + appCapsuleSub + `<MobileGiftList items>`
  - `ui/mobile-gift-list.tsx`(**client**) — 카드 목록 + 4버튼 분기 + giftModal/licenceModal(React 제어 `modal fade dialogbox show d-block`+backdrop) + Daum + 배송조회 외부폼
- 재사용 entities/shared: `entities/mypage-gift`·`shared/lib/daum-postcode`·`member-auth`. mock 기존

## 보존할 legacy quirk
- 카드형 마크업(PC 표와 다름), 버튼 색상 mobile 기준(info/success/primary, btn-block)
- 페이지네이션 UI 없음 + 더보기 JS dead(copy-paste, 미이식)
- licenceModal ordno span 빈값(legacy JS 미설정)
- **키확인 응답을 raw로 주입**(mobile은 error_code 파싱 안 함 — PC는 파싱). 계약 재사용 위해 `error_msg`(키 HTML)를 licence_result에 주입, error_code 분기는 mobile 동작대로 생략
- 배송조회 외부 폼 POST(우체국 002 / CJ) target=_blank
- 주소저장/키수령 성공 시 reload

## Parity 체크리스트 (모바일 UA)
- [ ] 세션 가드·MobileSubHeader("사은품 내역")·카드형(title/status/기한/gift_nm)
- [ ] 버튼 분기(배송주소입력/배송조회/키수령/키확인, status·is_delivery 조합) 정확
- [ ] giftModal 주소입력(Daum 우편번호) + 5필드 검증 + 등록→claim→alert+reload
- [ ] 키수령 → claim(is_delivery=N) → alert+reload
- [ ] 키확인 → licenceModal 제품키 HTML(raw 주입)
- [ ] 배송조회 → 우체국/CJ 외부 폼 새 탭
- [ ] 페이지네이션 없음 · 모바일 head/theme #000/title · 하단 네비 표시
- [ ] middleware rewrite + 데스크톱 폴백(PC mypage_gift)
