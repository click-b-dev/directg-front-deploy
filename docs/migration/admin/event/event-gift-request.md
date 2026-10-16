# 사은품 발송 현황 (event_gift_request)

## 원본
- 파일: `pc/_Admin_/event/event_gift_request.php` (라이브 — "사은품 관리" 그룹, 사이드바 노출)
- 도메인: `AdminEvent::getEventMemberList`(tbl_event_gift_member ⋈ tbl_event_gift), `getEventGiftList2`(드롭다운), `AdminV1::getMemberInfo`/`getMemberNo`
- 참조 문서: `../legacy-project/docs/PROMOTION-EVENT-OPS.md`
- #149(event_gift_member) 배송 O 레이아웃과 유사하나 **이벤트명 컬럼 추가·검색필터·항상 is_delivery='Y'**.

## 화면·플로우
- 진입 URL/파라미터: `/event/event_gift_request.php?page&search_type&search_value&status&event_gift_idx`
- page title: **사은품 발송 현황**
- breadcrumb: 홈 / 이벤트 / 사은품 관리 / 사은품 발송 현황
- 검색필터 카드(`card-header bg-secondary text-white "검색필터"`):
  - **검색어**: `search_type` select(회원아이디 `tegm.m_id` / 송장번호 `tegm.tracking_no` / 수신인 `tegm.receiver`) + `search_value` text
  - **상태**: radio `all`(전체)/`1`(배송지입력)/`2`(발송완료) — **3(수령완료)·0은 없음**. 기본 all(status='' → all).
  - **이벤트/사은품 명**: `event_gift_idx` select2(`:::선택:::` + getEventGiftList2 옵션 `{title} / {gift_nm}`)
  - `검색` 버튼(float-end)
- 상단: `{number_format(total_results)} 개`
- 표(12컬럼, `table-hover table-centered w-100 nowrap table-sm table-bordered border-light`, colgroup 3/16/16/5/5/5/5/5/20/10/5/5, thead `table-light font-13`, tbody `font-12 bg-white`):
  1. 번호(**내림차순** `total_results-(page-1)*30-num`)
  2. 이벤트명(`title`)
  3. 사은품명(`gift_nm`)
  4. 회원아이디(`m_id`)
  5. 회원명(`memberInfo.name`)
  6. 생년월일(`memberInfo.birth_day`)
  7. 휴대폰번호(`tegm.tel`)
  8. 수신인(`receiver`)
  9. 주소(`(zipcode) address address_detail`)
  10. 배송지입력일자(`reg_date`)
  11. 상태(`event_status_arr[status]`)
  12. 송장번호(`tracking_no` 있으면 `<p>{tracking_no}</p>` + 배송조회 버튼)
- 하단: `links_html` 서버 페이지네이션(30/page)
- 세션/권한: `lib.php` 관리자 가드(공통).

### 배송조회 버튼 (tracking_no 있을 때) — 실제 동작
- `shared/lib/delivery-tracking` `openDeliveryTracking`(epost/CJ POST, target _blank, 하이픈 제거) 재사용(#149와 공통).

### quirk (원문 유지)
- 상태 필터에 3(수령완료)·0 없음 — 전체/배송지입력/발송완료만.
- 항상 `teg.is_delivery='Y'` 고정(배송 O만 대상).
- select2는 SPA에 미초기화 → native select 렌더(드롭다운 동작 동일, 시각 enhancement 없음 — 기존 Bootstrap JS 미로드 관례).
- 하단 `responsive.bootstrap5.min.js`(DataTables) 로드는 init 없음 = 무효 → 미이식.

## 데이터 (legacy)
- DB: **DGKR** (`dsn_dgkr`).
- `getEventMemberList`: `SELECT teg.title, teg.is_delivery, teg.start_dt, teg.end_dt, tegm.* FROM tbl_event_gift_member tegm INNER JOIN tbl_event_gift teg ON tegm.parent_idx=teg.idx WHERE {add_where} ORDER BY {orderby}`, 30/page.
  - add_where: `1 AND teg.is_delivery='Y' [AND {search_type}='{search_value}'] [AND tegm.status='{status}'] [AND tegm.parent_idx='{event_gift_idx}']`
  - orderby: `tegm.reg_date DESC`
- `getEventGiftList2`: `SELECT teg.idx, teg.title, teg.gift_nm FROM tbl_event_gift teg WHERE teg.is_delivery='Y' ORDER BY teg.idx DESC` (드롭다운 옵션).
- 행별 회원 enrich: `getMemberInfo(getMemberNo(m_id)[0])` → name, birth_day.

## API 계약 (백엔드 전달)

### `GET /admin/event/gift-request` — 사은품 발송 현황
- 요청(query): `page`(기본 1), `search_type`(tegm.m_id|tegm.tracking_no|tegm.receiver), `search_value`(string), `status`(all|1|2, 기본 all), `event_gift_idx`(number, 선택)
- 응답:
  ```json
  {
    "items": [
      {
        "title": "여름 프로모션 사은품 이벤트", "gift_nm": "닌텐도 스위치 2",
        "m_id": "winner01", "name": "홍길동", "birth_day": "900101",
        "tel": "010-1234-5678", "receiver": "홍길동",
        "zipcode": "06236", "address": "서울 강남구 테헤란로 1", "address_detail": "101호",
        "reg_date": "2025-08-06 10:12:00", "status": 2,
        "tracking_no": "1234-5678-9012", "delivery_code": "001"
      }
    ],
    "event_gift_options": [{ "idx": 12, "title": "여름 프로모션 사은품 이벤트", "gift_nm": "닌텐도 스위치 2" }],
    "pagination": { "current_page": 1, "results_per_page": 30, "total_results": 1, "total_pages": 1 }
  }
  ```
- 필터: `is_delivery='Y'` 고정 + search_type/value(등호) + status(등호) + event_gift_idx(parent_idx). 정렬 `reg_date DESC`. 30/page.
- `event_gift_options`: getEventGiftList2 결과(필터 무관 전체, is_delivery='Y', idx desc).
- 백엔드 책임: DGKR 조인 + tbl_member enrich. **PII(생년월일·휴대폰·주소)** — 관리자 권한 서버측 강제.
- 에러: legacy PDOException → `Error!` die. 프론트 계약은 표준 5xx 가정.

## 타겟 매핑
- 라우트: `/event/event_gift_request` (`routes/event/event_gift_request.tsx`, page/search_type/search_value/status/event_gift_idx 검증)
- screen: `screens/event-gift-request`
- entities: `entities/event` 확장 — `EventGiftRequestSearch`/`EventGiftRequestItem`/`EventGiftOption`/`EventGiftRequestListResponse`, `fetchEventGiftRequest`, `useEventGiftRequest`, `eventGiftRequestQueryKey`
- mock: `handlers/event.ts`에 `GET /admin/event/gift-request` + fixture
- 공용: `shared/ui` `ServerPagination`(params: search_type/search_value/status/event_gift_idx), `shared/lib/delivery-tracking`, `entities/event` `EVENT_GIFT_STATUS`

## Parity 체크리스트
- [ ] 화면 요소 일치 (검색필터 카드·12컬럼·colgroup·page title·breadcrumb·"N 개")
- [ ] 필드/포맷 일치 (번호 내림차순·이벤트명·주소 조합·상태 라벨·송장번호 텍스트+버튼)
- [ ] 분기/플로우 일치 (is_delivery=Y 고정·search_type/status/event_gift_idx 필터·reg_date desc·30/page)
- [ ] 엣지케이스 일치 (상태 all/1/2만·select2 native·배송조회 POST·기본 status all)
