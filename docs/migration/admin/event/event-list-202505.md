# 2025 가정의달 이벤트 (event_list_202505)

## 원본
- 파일: `pc/_Admin_/event/event_list_202505.php` (라이브 — "이벤트 관리" 그룹, 사이드바 노출)
- 도메인: `AdminEvent::getEventLotteryList`(tbl_event_lottery_config) + 행별 `getEventLotteryMemberCount`/`getEventLotteryJoinCount`/`getEventLotteryItem`
- 참조 문서: `../legacy-project/docs/PROMOTION-EVENT-OPS.md`
- 자매: `event_list_20250626.php`(2025 여름 프로모션, #146 예정 — 같은 6컬럼 골격이나 데이터/계산 상이)

## 화면·플로우
- 진입 URL/파라미터: `/event/event_list_202505.php?page=N` (page만)
- page title: **2025 가정의달 이벤트**
- breadcrumb: 홈 / 이벤트 / 추첨 이벤트 관리 / 2025 가정의달 이벤트
- **필터 UI 없음** — 하드코딩 `idx in ('29','30','31','32','33')` 고정.
- 상단: `{number_format(total_results)} 개`
- 표(6컬럼, `table-centered w-100 nowrap table-sm bg-white table-bordered`, thead `table-light font-13`, tbody `font-12`):
  1. 번호 (`idx`, width 50)
  2. 이벤트명 (`event_name<br/><small style="font-size:11px">=> 사은품: {event_gift}</small>`, text-start)
  3. 이벤트 기간 (`event_start_dt ~ event_end_dt`, width 250)
  4. 사은품수량 (`number_format(event_gift_count)`, text-end, width 80)
  5. 참여자수 (`number_format(join.event_member)`, text-end, width 90)
  6. 사용예산 (**항상 빈 셀**, text-end, width 90)
- 하단: `links_html` 서버 페이지네이션(30/page, `idx desc`)
- 세션/권한: `lib.php` 관리자 가드(공통). topmenu event active.

### quirk / dead (원문 유지)
- 필터/검색 UI 없음. idx 집합 `29~33` 하드코딩(legacy 캠페인 정의).
- 행별로 `getEventLotteryMemberCount`·`getEventLotteryItem`도 호출하지만 **출력에 미사용(dead fetch)** — 화면에 쓰이는 집계는 참여자수(`getEventLotteryJoinCount.event_member`)뿐.
- **사용예산 컬럼은 항상 빈 셀**(계산 없음). #146(20250626)과 달리 tfoot 합계 없음.
- `event_lottery_list->success == true`일 때만 tbody 렌더.

## 데이터 (legacy)
- DB: **DGKR** (`dsn_dgkr`).
- `getEventLotteryList`: `SELECT * FROM tbl_event_lottery_config WHERE 1=1 AND idx in ('29','30','31','32','33') ORDER BY idx desc`, 30/page.
- 참여자수: `getEventLotteryJoinCount(idx)` = `SELECT count(*) event_member ... FROM (SELECT m_id,count(*) FROM tbl_event_lottery_log WHERE event_no=:idx GROUP BY m_id) t` → `event_member`.

## API 계약 (백엔드 전달)

### `GET /admin/event/campaign-202505` — 2025 가정의달 이벤트 목록
- 요청(query): `page`(number, 기본 1). 필터 없음.
- 응답: idx 집합 `29~33` 고정, 행별 참여자수 백엔드 집계.
  ```json
  {
    "items": [
      {
        "idx": 33,
        "event_name": "가정의달 적립금 이벤트",
        "event_gift": "스타벅스 기프티콘",
        "event_gift_count": 100,
        "event_start_dt": "2025-05-01 00:00:00",
        "event_end_dt": "2025-05-31 23:59:59",
        "event_member": 512
      }
    ],
    "pagination": { "current_page": 1, "results_per_page": 30, "total_results": 5, "total_pages": 1 }
  }
  ```
- 필드: `event_member`=참여자수(tbl_event_lottery_log 기준 distinct m_id count). **사용예산은 응답에 없음(프론트 빈 셀)**.
- 정렬: `idx desc`. 페이지크기: 30. idx 집합 `29,30,31,32,33` 고정(백엔드 캠페인 정의).
- 백엔드 책임: DGKR DB 조회 + idx 화이트리스트 + 참여자수 집계. 관리자 권한 서버측 강제.
- 에러: legacy PDOException → `Error!` die. 프론트 계약은 표준 5xx 가정.

## 타겟 매핑
- 라우트: `/event/event_list_202505` (`routes/event/event_list_202505.tsx`, page 검증)
- screen: `screens/event-list-202505`
- entities: `entities/event` 확장 — `EventCampaign202505Search`/`EventCampaign202505Item`/`EventCampaign202505ListResponse`, `fetchEventCampaign202505`, `useEventCampaign202505`, `eventCampaign202505QueryKey`
- mock: `handlers/event.ts`에 `GET /admin/event/campaign-202505` + fixture(idx 29~33)
- 공용: `shared/ui` `ServerPagination`

## Parity 체크리스트
- [ ] 화면 요소 일치 (6컬럼 헤더·width·page title·breadcrumb·"N 개")
- [ ] 필드/포맷 일치 (number_format·이벤트명+사은품 small·기간 문자열·참여자수·**사용예산 빈 셀**)
- [ ] 분기/플로우 일치 (필터 없음·idx desc·30/page·success 시만 렌더)
- [ ] 엣지케이스 일치 (빈 목록·페이지네이션·tfoot 없음·dead fetch 미노출)
