# 추첨 이벤트 현황 (event_lottery_list)

## 원본
- 파일: `pc/_Admin_/event/event_lottery_list.php` (라이브 버전 — 변형/테스트 파일 없음)
- 도메인: `src/classes/AdminEvent.php` (`getEventLotteryList`/`getEventLotteryMemberCount`/`getEventLotteryJoinCount`/`getEventLotteryItem`)
- 참조 문서: `../legacy-project/docs/PROMOTION-EVENT-OPS.md`, `docs/legacy-admin/*`
- sidebar: `sidebar_event.php` "이벤트 관리" 그룹 첫 항목(이미 `EVENT_SIDE_NAV`에 등록됨)

## 화면·플로우
- 진입 URL/파라미터: `/event/event_lottery_list.php?page=N` (page만, 기본 1)
- page title: **추첨 이벤트 현황** (사이드바 라벨 "이벤트 현황"과 상이 — 원문 유지)
- breadcrumb: 홈 / 이벤트 / 추첨 이벤트 관리 / 추첨 이벤트 현황
- **필터 없음** — `$where = []` 항상 비어있고, 검색 폼도 없음. `$param`은 GET 순회로 만들지만 필터 필드가 없어 항상 빈 문자열.
- 상단: `{number_format(total_results)} 개`
- 표(13컬럼, `table-centered table-sm table-bordered`, thead `table-light font-13`, tbody `font-12`):
  1. 번호 (`idx`, text-center, width 50)
  2. 이벤트명 (`event_name` + `<br/><small style="font-size:11px">=> 사은품: {event_gift}</small>`, text-start)
  3. 진행수량 (`number_format(event_gift_count)`, text-end, width 80)
  4. 이벤트 기간 (`event_start_dt ~ event_end_dt` 문자열 그대로, text-center, width 250)
  5. 대상금액 (`number_format(member.total)`, text-end, width 90)
  6. 대상자수 (`number_format(member.member_count)`, text-end, width 90)
  7. 참여자수 (`number_format(join.event_member)`, text-end, width 90)
  8. 참여횟수 (`number_format(join.event_count)`, text-end, width 90)
  9. 당첨자수 (`number_format(item[0])`, text-end, width 90)
  10. 참여율 (**서버 주석처리 dead** → `%` 문자만 렌더, width 90)
  11. 당첨확률 (**서버 주석처리 dead** → `%` 문자만 렌더, width 90)
  12. 당첨자현황 → `<a href="event_lottery_success.php?event_no={idx}" class="btn btn-outline-secondary btn-sm font-12">당첨자현황</a>` (width 100)
  13. 낙첨자현황 → `<a href="event_lottery_fail.php?event_no={idx}" class="btn btn-outline-secondary btn-sm font-12">낙첨자현황</a>` (width 100)
- 하단: `links_html` 서버 페이지네이션 (30/page, `idx desc`)
- 분기/리다이렉트: 없음(순수 조회). `event_lottery_list->success == true`일 때만 tbody 렌더.
- 세션/권한 의존: `lib.php` 관리자 세션 가드(공통, 기존 route-guard). topmenu `event` active.

### quirk (원문 유지)
- 참여율/당첨확률 두 컬럼은 legacy에서 `<?//=round(...)?>` 주석처리 → 값 없이 `%`만 출력. 그대로 이식.
- page title "추첨 이벤트 현황" ≠ 사이드바 라벨 "이벤트 현황".
- 당첨자수 셀은 `getEventLotteryItem`의 `count(*)` 결과를 `$lottery_item_data['0']`(숫자 키)로 접근.
- 링크 대상 `event_lottery_success.php`(사이드바 display:none)·`event_lottery_fail.php`(사이드바 미등록)는 **미이관** → legacy 경로 `<a href>` 그대로 유지(후속 단위).

## 데이터 (legacy)
- DB: **DGKR** (`dsn_dgkr`) — main DB 아님. 백엔드 데이터 소스 주의.
- `getEventLotteryList($page,$add_where,$orderby,$param)`:
  - `SELECT * FROM tbl_event_lottery_config WHERE 1=1 {add_where} ORDER BY idx desc`, 30/page (pagination class).
  - 사용 컬럼: `idx`, `event_name`, `event_gift`, `event_gift_count`, `event_start_dt`, `event_end_dt`, `event_per_price`.
- 행별 N+1 서브쿼리 3종:
  - `getEventLotteryMemberCount(idx, event_per_price)`:
    `SELECT count(*) member_count, sum(t.event_price) total FROM (SELECT m_no, sum(event_price) event_price FROM tbl_event_lottery_member WHERE event_no=:idx GROUP BY m_no HAVING sum(event_price)>=:event_per_price) t`
    → 대상금액(`total`)·대상자수(`member_count`).
  - `getEventLotteryJoinCount(idx)`:
    `SELECT count(*) event_member, sum(t.cc) event_count FROM (SELECT m_id, count(*) cc FROM tbl_event_lottery_log WHERE event_no=:idx GROUP BY m_id) t`
    → 참여자수(`event_member`)·참여횟수(`event_count`).
  - `getEventLotteryItem(idx)`:
    `SELECT count(*) FROM tbl_event_lottery_item WHERE event_no=:idx AND lottery_status='Y'`
    → 당첨자수(첫 컬럼).

## API 계약 (백엔드 전달)

### `GET /admin/event/lottery-list` — 추첨 이벤트 현황 목록
- 요청(query): `page` (number, 기본 1). **필터 없음**.
- 응답: 각 행을 백엔드에서 집계 완료(enrich)하여 반환(legacy N+1 서브쿼리를 백엔드가 대신 수행).
  ```json
  {
    "items": [
      {
        "idx": 12,
        "event_name": "6월 적립금 추첨 이벤트",
        "event_gift": "닌텐도 스위치 2",
        "event_gift_count": 3,
        "event_start_dt": "2025-06-01 00:00:00",
        "event_end_dt": "2025-06-30 23:59:59",
        "total": 15230000,
        "member_count": 842,
        "event_member": 631,
        "event_count": 2894,
        "won_count": 3
      }
    ],
    "pagination": { "current_page": 1, "results_per_page": 30, "total_results": 2, "total_pages": 1 }
  }
  ```
- 필드 매핑: `total`=대상금액, `member_count`=대상자수, `event_member`=참여자수, `event_count`=참여횟수, `won_count`=당첨자수(lottery_status='Y' count).
- 정렬: `idx desc`. 페이지크기: 30.
- 백엔드 책임:
  - DGKR DB(`tbl_event_lottery_config`/`_member`/`_log`/`_item`) 조회.
  - 대상자 집계는 이벤트별 `event_per_price` 임계값(`HAVING sum(event_price)>=event_per_price`) 적용.
  - 관리자 세션 권한 서버측 강제(프론트는 라우트 가드만).
- 에러: legacy는 PDOException 시 `Error!: {msg}` 출력 후 die. 프론트 계약은 표준 에러 응답(5xx) 가정.

## 타겟 매핑
- 라우트: `/event/event_lottery_list` (`routes/event/event_lottery_list.tsx`, page/normPage 검증)
- screen: `screens/event-lottery-list`
- entities: `entities/event` 확장 — `EventLotterySearch`/`EventLotteryItem`/`EventLotteryListResponse`, `fetchEventLotteryList`, `useEventLotteryList`, `eventLotteryListQueryKey`
- mock: `handlers/event.ts`에 `GET /admin/event/lottery-list` 핸들러 + fixture
- 공용: `shared/ui` `ServerPagination`
- 미이관 링크: `/event/event_lottery_success`·`/event/event_lottery_fail` (legacy 경로 `<a href>` 유지)

## Parity 체크리스트
- [ ] 화면 요소 일치 (13컬럼 헤더·width·정렬 클래스·"N 개"·breadcrumb·page title)
- [ ] 필드/포맷 일치 (number_format·이벤트명+사은품 small·기간 문자열·참여율/당첨확률 `%`만)
- [ ] 분기/플로우 일치 (필터 없음·idx desc·30/page·success 시만 렌더)
- [ ] 엣지케이스 일치 (빈 목록·페이지네이션·당첨자현황/낙첨자현황 링크 legacy 경로 유지)
