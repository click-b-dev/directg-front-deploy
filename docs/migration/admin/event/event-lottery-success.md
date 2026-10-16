# 추첨 이벤트 당첨자현황 (event_lottery_success)

## 원본
- 파일: `pc/_Admin_/event/event_lottery_success.php` (라이브 — 사이드바 display:none, #143 "당첨자현황" 버튼 링크 대상)
- 도메인: `AdminEvent::getEventLotteryItemList` (tbl_event_lottery_item ⋈ tbl_event_lottery_config), `AdminV1::getMemberInfo`/`getMemberNo` (tbl_member)
- 참조 문서: `../legacy-project/docs/PROMOTION-EVENT-OPS.md`
- **낙첨자현황(`event_lottery_fail.php`)은 legacy에 파일 부재** → #143 "낙첨자현황" 버튼은 죽은 링크(이관 대상 아님, randombox와 동일).

## 화면·플로우
- 진입 URL/파라미터: `/event/event_lottery_success.php?event_no=N&page=N&searchTitle=회원아이디`
- page title: `추첨 이벤트 당첨자현황 ({event_name})` — 결과 첫 행의 event_name(당첨 행 없으면 빈 괄호 `()`)
- breadcrumb: 홈 / 이벤트 / **사은품 관리** / {page_title}  ← 3번째 "사은품 관리"(추첨 이벤트 관리 아님, quirk 유지)
- 검색 폼(GET): `searchTitle`(회원아이디, placeholder "회원아이디", width 200) + `검색` 버튼 + hidden `event_no`
- 상단: `{number_format(total_results)} 개`(float-start) + `<strong class="text-danger">{event_start_dt} ~ {event_end_dt}</strong>`(float-end)
- 표(7컬럼, `table-centered w-100 nowrap table-sm table-bordered border-light`, thead `table-light font-13`, tbody `bg-white font-12`):
  1. 번호 (**내림차순**: `total_results - (page-1)*30`부터 행마다 -1)
  2. 사은품명 (`item_name`)
  3. 회원아이디 (`m_id`)
  4. 회원명 (`memberInfo.name`)
  5. 생년월일 (`memberInfo.birth_day`)
  6. 휴대폰번호 (`memberInfo.hp`)
  7. 당첨일자 (`lottery_date`)
- 하단: `links_html` 서버 페이지네이션(30/page)
- style: `.table-centered tr:hover { background-color: #FFF0F0; }`
- 세션/권한: `lib.php` 관리자 가드(공통). topmenu event active.

### quirk / dead (원문 유지)
- breadcrumb 3번째 "사은품 관리"(당첨자현황이 사은품 관리 그룹 소속처럼 표기) — 유지.
- page title 괄호 안 event_name은 결과 첫 행에서 파생 → **당첨 행 0건이면 `()`**.
- 번호 내림차순.
- 하단 `btn_delivery_search` 클릭 스크립트(epost/CJ 배송조회) + `$event_status_arr`(0/배송지입력/발송완료/수령완료)는 **이 화면에 대응 요소 없음 = 죽은 복붙 코드** → 미이식.
- 검색 무결과 시 tbody 비어있음(`count(result)>0`일 때만 렌더).

## 데이터 (legacy)
- DB: **DGKR** (`dsn_dgkr`).
- `getEventLotteryItemList($page,$add_where,$orderby,$param)`:
  `SELECT teli.*, telc.event_name, telc.event_start_dt, telc.event_end_dt FROM tbl_event_lottery_item teli INNER JOIN tbl_event_lottery_config telc ON teli.event_no=telc.idx WHERE {add_where} ORDER BY {orderby}`, 30/page.
  - add_where: `teli.lottery_status='Y' AND teli.event_no={event_no} [AND teli.m_id='{searchTitle}']`
  - orderby: `teli.lottery_date DESC`
- 행별 회원 enrichment: `getMemberInfo(getMemberNo(m_id)[0])` → `tbl_member`(name, birth_day, hp).

## API 계약 (백엔드 전달)

### `GET /admin/event/lottery-success` — 추첨 이벤트 당첨자현황
- 요청(query): `event_no`(number, 필수), `page`(number, 기본 1), `searchTitle`(string, 회원아이디 등호, 선택)
- 응답: 행 + 이벤트 정보(첫 행 파생) 동봉. 회원 정보는 백엔드 enrich.
  ```json
  {
    "items": [
      {
        "item_name": "닌텐도 스위치 2",
        "m_id": "winner01",
        "name": "홍길동",
        "birth_day": "900101",
        "hp": "010-1234-5678",
        "lottery_date": "2025-07-15 14:22:03"
      }
    ],
    "event_name": "2025 여름 적립금 추첨 이벤트",
    "event_start_dt": "2025-07-01 00:00:00",
    "event_end_dt": "2025-07-31 23:59:59",
    "pagination": { "current_page": 1, "results_per_page": 30, "total_results": 3, "total_pages": 1 }
  }
  ```
- 필터: `lottery_status='Y'` + `event_no` 고정 + `searchTitle`(m_id 등호). 정렬 `lottery_date DESC`. 30/page.
- 당첨 행이 0건이면 `event_name`/`event_start_dt`/`event_end_dt`는 빈 문자열(legacy `$result[0]` 부재와 동일 — page title `()`).
- 백엔드 책임:
  - DGKR DB 조인 조회 + `tbl_member` enrich(name/birth_day/hp).
  - **PII(생년월일·휴대폰)** 노출 — 관리자 권한 서버측 강제.
- 에러: legacy PDOException → `Error!` die. 프론트 계약은 표준 5xx 가정.

## 타겟 매핑
- 라우트: `/event/event_lottery_success` (`routes/event/event_lottery_success.tsx`, event_no/page/searchTitle 검증)
- screen: `screens/event-lottery-success`
- entities: `entities/event` 확장 — `EventLotterySuccessSearch`/`EventLotterySuccessItem`/`EventLotterySuccessResponse`, `fetchEventLotterySuccess`, `useEventLotterySuccess`, `eventLotterySuccessQueryKey`
- mock: `handlers/event.ts`에 `GET /admin/event/lottery-success` + fixture
- 공용: `shared/ui` `ServerPagination`(params: event_no, searchTitle)
- #143 "당첨자현황" 버튼 링크 활성화(→ SPA 경로). "낙첨자현황"은 죽은 링크로 유지.

## Parity 체크리스트
- [ ] 화면 요소 일치 (7컬럼·검색폼·"N 개"·기간 text-danger·breadcrumb "사은품 관리"·page title(event_name))
- [ ] 필드/포맷 일치 (번호 내림차순·number_format·회원 enrich 필드·lottery_date)
- [ ] 분기/플로우 일치 (lottery_status=Y·event_no·searchTitle 등호·lottery_date desc·30/page·0건 시 `()`)
- [ ] 엣지케이스 일치 (죽은 배송조회 스크립트·event_status_arr 미이식·낙첨자현황 죽은 링크·tr:hover 스타일)
