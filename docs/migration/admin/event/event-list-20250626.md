# 2025 여름 프로모션 이벤트 (event_list_20250626)

## 원본
- 파일: `pc/_Admin_/event/event_list_20250626.php` (라이브 — "이벤트 관리" 그룹, 사이드바 노출)
- 도메인: `AdminEvent::getEventLotteryList`(tbl_event_lottery_config) + 행별 `getEventMemberCount`(tbl_event_log)
- 참조 문서: `../legacy-project/docs/PROMOTION-EVENT-OPS.md`
- 자매: `event_list_202505.php`(#145). 같은 6컬럼 골격이나 **정렬·참여자수 소스·사용예산·tfoot이 상이**.

## 화면·플로우
- 진입 URL/파라미터: `/event/event_list_20250626.php?page=N` (page만)
- page title: **2025 여름 프로모션 이벤트**
- breadcrumb: 홈 / 이벤트 / 추첨 이벤트 관리 / 2025 여름 프로모션 이벤트
- **필터 UI 없음** — 하드코딩 `idx in ('34','35','36','37')` 고정.
- 상단: `{number_format(total_results)} 개`
- 표(6컬럼, `table-centered w-100 nowrap table-sm bg-white table-bordered`, thead `table-light font-13`, tbody `font-12`):
  1. 번호 (`idx`, width 50)
  2. 이벤트명 (`event_name<br/><small style="font-size:11px">=> 사은품: {event_gift}</small>`, text-start)
  3. 이벤트 기간 (`event_start_dt ~ event_end_dt`, width 250)
  4. 사은품수량 (`number_format(event_gift_count)`, text-end, width 80)
  5. 참여자수 (`number_format(event_member_count[0])`, text-end, width 90)
  6. 사용예산 (**계산값** `number_format(marketing_cost)`, text-end, width 90)
- **tfoot 합계**: `<tr><th colspan="3" class="text-center">합계</th><th></th><th></th><th class="text-end">{number_format(total_marketing_cost)}</th></tr>`
- 하단: `links_html` 서버 페이지네이션(30/page, **`idx asc`**)
- 세션/권한: `lib.php` 관리자 가드(공통). topmenu event active.

### 사용예산(marketing_cost) 계산 — 원문 그대로
```
if (idx == "37") { marketing_cost = event_gift_count * event_per_price; }
else             { marketing_cost = event_member_count[0] * event_per_price; }
total_marketing_cost += marketing_cost;   // 현재 페이지 행 합
```
- **idx==37 특례**: 참여자수 대신 사은품수량 기준 예산 계산.
- `total_marketing_cost`는 **현재 페이지의 행 합**(legacy foreach 누적). 전체 합이 아님.

### quirk / 자매 차이 (원문 유지)
- 정렬 `idx **asc**` (#145는 desc).
- 참여자수 소스 `getEventMemberCount`(**tbl_event_log** count) — #145의 getEventLotteryJoinCount(tbl_event_lottery_log)와 다른 테이블.
- 사용예산 계산 + tfoot 합계 존재 (#145는 빈 셀·tfoot 없음).
- `success == true`일 때만 tbody 렌더.

## 데이터 (legacy)
- DB: **DGKR** (`dsn_dgkr`).
- `getEventLotteryList`: `SELECT * FROM tbl_event_lottery_config WHERE 1=1 AND idx in ('34','35','36','37') ORDER BY idx asc`, 30/page. 사용 컬럼: idx, event_name, event_gift, event_gift_count, event_start_dt, event_end_dt, **event_per_price**.
- 참여자수: `getEventMemberCount(idx)` = `SELECT count(*) FROM tbl_event_log WHERE event_no=:idx` → 첫 컬럼.

## API 계약 (백엔드 전달)

### `GET /admin/event/campaign-20250626` — 2025 여름 프로모션 이벤트 목록
- 요청(query): `page`(number, 기본 1). 필터 없음.
- 응답: idx 집합 `34~37` 고정, 행별 참여자수(tbl_event_log) + `event_per_price` 동봉(프론트 예산 계산용).
  ```json
  {
    "items": [
      {
        "idx": 34,
        "event_name": "여름 프로모션 구매 이벤트",
        "event_gift": "스팀 기프트카드 3만원",
        "event_gift_count": 80,
        "event_start_dt": "2025-06-26 00:00:00",
        "event_end_dt": "2025-08-31 23:59:59",
        "event_member": 430,
        "event_per_price": 5000
      }
    ],
    "pagination": { "current_page": 1, "results_per_page": 30, "total_results": 4, "total_pages": 1 }
  }
  ```
- 필드: `event_member`=참여자수(**tbl_event_log** count), `event_per_price`=예산 단가.
- **사용예산·합계는 프론트에서 legacy 로직 그대로 계산**(idx==37 특례 포함, 합계는 현재 페이지 행 합).
- 정렬: `idx asc`. 페이지크기: 30. idx 집합 `34,35,36,37` 고정(백엔드 캠페인 정의).
- 백엔드 책임: DGKR DB 조회 + idx 화이트리스트 + tbl_event_log 참여자수 집계 + event_per_price 반환. 관리자 권한 서버측 강제.
- 에러: legacy PDOException → `Error!` die. 프론트 계약은 표준 5xx 가정.

## 타겟 매핑
- 라우트: `/event/event_list_20250626` (`routes/event/event_list_20250626.tsx`, page 검증)
- screen: `screens/event-list-20250626`
- entities: `entities/event` 확장 — `EventCampaign20250626Search`/`EventCampaign20250626Item`/`EventCampaign20250626ListResponse`, `fetchEventCampaign20250626`, `useEventCampaign20250626`, `eventCampaign20250626QueryKey`
- mock: `handlers/event.ts`에 `GET /admin/event/campaign-20250626` + fixture(idx 34~37, idx=37 포함)
- 공용: `shared/ui` `ServerPagination`

## Parity 체크리스트
- [ ] 화면 요소 일치 (6컬럼 헤더·width·page title·breadcrumb·"N 개"·tfoot 합계 행)
- [ ] 필드/포맷 일치 (number_format·이벤트명+사은품 small·참여자수·**사용예산 계산값**)
- [ ] 분기/플로우 일치 (idx **asc**·30/page·**idx==37 예산 특례**·total=현재 페이지 합)
- [ ] 엣지케이스 일치 (빈 목록·tfoot 합계 표기·success 시만 렌더)
