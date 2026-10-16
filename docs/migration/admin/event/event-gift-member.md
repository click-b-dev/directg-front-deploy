# 사은품 이벤트 당첨자현황 (event_gift_member)

## 원본
- 파일: `pc/_Admin_/event/event_gift_member.php` (사이드바 display:none, #148 "당첨자현황" 버튼 링크 대상)
- 도메인: `AdminEvent::getEventMemberList`(tbl_event_gift_member ⋈ tbl_event_gift), `AdminV1::getMemberInfo`/`getMemberNo`(tbl_member)
- 참조 문서: `../legacy-project/docs/PROMOTION-EVENT-OPS.md`

## 화면·플로우
- 진입 URL/파라미터: `/event/event_gift_member.php?idx=N&page=N&searchTitle=회원아이디`
- page title: `사은품 이벤트 당첨자현황 ({title})` — 결과 첫 행의 이벤트 title(0건이면 빈 괄호 `()`)
- breadcrumb: 홈 / 이벤트 / 사은품 관리 / {page_title}
- 검색 폼(GET): `searchTitle`(회원아이디, placeholder "회원아이디", width 200) + `검색` 버튼 + hidden `idx`
- 상단: `{number_format(total_results)} 개`(float-start) + `<strong class="text-danger">{start_dt} ~ {end_dt}</strong>`(float-end)
- 표(`table-centered w-100 nowrap table-sm table-bordered border-light`, thead `table-light font-13`, tbody `bg-white font-12`):
  - **`is_delivery == "Y"` (배송 O) — 11컬럼**:
    1. 번호(내림차순) 2. 사은품명(`gift_nm`) 3. 회원아이디(`m_id`) 4. 회원명(`memberInfo.name`) 5. 생년월일(`memberInfo.birth_day`) 6. 휴대폰번호(**`tegm.tel`**) 7. 수신인(`receiver`) 8. 주소(`(zipcode) address address_detail`) 9. 배송지입력일자(`reg_date`) 10. 상태(`event_status_arr[status]`) 11. 송장번호(`tracking_no` 있으면 배송조회 버튼)
  - **`is_delivery != "Y"` (배송 X) — 9컬럼**:
    1. 번호(내림차순) 2. Asset ID(`asset_id`) 3. 사은품명(`gift_nm`) 4. 회원아이디(`m_id`) 5. 회원명(`memberInfo.name`) 6. 생년월일(`memberInfo.birth_day`) 7. 휴대폰번호(**`memberInfo.hp`**) 8. 수령시간(`status==3 ? reg_date : ""`) 9. 상태(`event_status_arr[status]`)
- 하단: `links_html` 서버 페이지네이션(30/page)
- style: `.table-centered tr:hover { background-color: #FFF0F0; }`
- 세션/권한: `lib.php` 관리자 가드(공통).

### 상태 라벨 (event_status_arr)
`{0:"", 1:"배송지입력", 2:"발송완료", 3:"수령완료"}`

### 배송조회 버튼 (배송 O·`tracking_no` 있을 때만) — **실제 동작(#144와 달리 live)**
- 버튼: `data-trackingno=str_replace("-","",tracking_no)`, `data-deliverycode=delivery_code`.
- 클릭 시 form POST(target `_blank`):
  - `delivery_code == "002"` → `https://service.epost.go.kr/trace.RetrieveDomRigiTraceList.comm`, hidden `sid1=trackingNo`.
  - else → `https://trace.cjlogistics.com/web/detail.jsp`, hidden `slipno=trackingNo`.
- trackingNo는 하이픈 제거된 값.

### quirk (원문 유지)
- 휴대폰번호 소스가 레이아웃별 상이: 배송 O=`tegm.tel`, 배송 X=`memberInfo.hp`.
- page title 괄호 안 title은 결과 첫 행에서 파생 → 0건이면 `()`.
- 번호 내림차순. `count(result)>0`일 때만 tbody 렌더.
- 배송 X 수령시간은 status==3에서만 reg_date 표시.

## 데이터 (legacy)
- DB: **DGKR** (`dsn_dgkr`).
- `getEventMemberList`:
  `SELECT teg.title, teg.is_delivery, teg.start_dt, teg.end_dt, tegm.* FROM tbl_event_gift_member tegm INNER JOIN tbl_event_gift teg ON tegm.parent_idx=teg.idx WHERE {add_where} ORDER BY {orderby}`, 30/page.
  - add_where: `1 AND tegm.parent_idx={idx} [AND tegm.m_id='{searchTitle}']`
  - orderby: `tegm.reg_date DESC`
- 행별 회원 enrich: `getMemberInfo(getMemberNo(m_id)[0])` → name, birth_day, hp.
- tegm 컬럼: m_id, gift_nm, tel, receiver, zipcode, address, address_detail, reg_date, status, tracking_no, delivery_code, asset_id.

## API 계약 (백엔드 전달)

### `GET /admin/event/gift-member` — 사은품 이벤트 당첨자현황
- 요청(query): `idx`(number, 필수·parent_idx), `page`(number, 기본 1), `searchTitle`(string, 회원아이디 등호, 선택)
- 응답: 행 + 이벤트 정보(첫 행 파생, is_delivery로 레이아웃 결정). 회원 정보 백엔드 enrich.
  ```json
  {
    "items": [
      {
        "gift_nm": "닌텐도 스위치 2", "m_id": "winner01",
        "name": "홍길동", "birth_day": "900101", "hp": "010-1234-5678",
        "tel": "010-1234-5678", "receiver": "홍길동",
        "zipcode": "06236", "address": "서울 강남구 테헤란로 1", "address_detail": "101호",
        "reg_date": "2025-08-06 10:12:00", "status": 2,
        "tracking_no": "1234-5678-9012", "delivery_code": "001", "asset_id": ""
      }
    ],
    "title": "여름 프로모션 사은품 이벤트", "is_delivery": "Y",
    "start_dt": "2025-07-01 00:00:00", "end_dt": "2025-07-31 23:59:59",
    "pagination": { "current_page": 1, "results_per_page": 30, "total_results": 1, "total_pages": 1 }
  }
  ```
- 필터: `parent_idx=idx` + `searchTitle`(m_id 등호). 정렬 `reg_date DESC`. 30/page.
- 0건이면 title/is_delivery/start_dt/end_dt는 빈 문자열(legacy `$result[0]` 부재). is_delivery 빈값 → 배송 X 레이아웃.
- 필드: 휴대폰(배송 O=`tel`, 배송 X=`hp`), 상태 `status`(0~3), 배송 O 전용(receiver/zipcode/address/address_detail/tracking_no/delivery_code), 배송 X 전용(asset_id).
- 백엔드 책임: DGKR 조인 + tbl_member enrich(name/birth_day/hp). **PII(생년월일·휴대폰·주소)** — 관리자 권한 서버측 강제.
- 에러: legacy PDOException → `Error!` die. 프론트 계약은 표준 5xx 가정.

## 타겟 매핑
- 라우트: `/event/event_gift_member` (`routes/event/event_gift_member.tsx`, idx/page/searchTitle 검증)
- screen: `screens/event-gift-member`
- entities: `entities/event` 확장 — `EventGiftMemberSearch`/`EventGiftMemberItem`/`EventGiftMemberResponse`, `EVENT_GIFT_STATUS`, `fetchEventGiftMember`, `useEventGiftMember`, `eventGiftMemberQueryKey`
- mock: `handlers/event.ts`에 `GET /admin/event/gift-member` + fixture(idx 12=배송 O, idx 11=배송 X)
- 공용: `shared/ui` `ServerPagination`(params: idx, searchTitle)
- 배송조회 POST 헬퍼는 screen-local(epost/CJ, target _blank)
- #148 "당첨자현황" 링크 활성화(→ SPA 경로)

## Parity 체크리스트
- [ ] 화면 요소 일치 (배송 O 11컬럼 / 배송 X 9컬럼 분기·검색폼·기간 text-danger·page title(title))
- [ ] 필드/포맷 일치 (번호 내림차순·휴대폰 소스 분기·상태 라벨·주소 조합·수령시간 status==3)
- [ ] 분기/플로우 일치 (parent_idx·searchTitle 등호·reg_date desc·30/page·0건 시 `()`·배송조회 버튼 tracking_no 조건)
- [ ] 엣지케이스 일치 (배송조회 epost/CJ POST 동작·하이픈 제거·tr:hover)
