# 사은품 이벤트 진행이력 (event_gift_list)

## 원본
- 파일: `pc/_Admin_/event/event_gift_list.php` (라이브 — "사은품 관리" 그룹, 사이드바 노출)
- 도메인: `AdminEvent::getEventGiftList`(tbl_event_gift)
- 참조 문서: `../legacy-project/docs/PROMOTION-EVENT-OPS.md`
- 링크 대상 `event_gift_member.php`(사이드바 display:none, 진행이력 상세)는 **미이관**(후속 단위) → legacy 경로 링크 유지.

## 화면·플로우
- 진입 URL/파라미터: `/event/event_gift_list.php?page=N` (page만)
- page title: **사은품 이벤트 진행이력**
- breadcrumb: 홈 / 이벤트 / 사은품 관리 / 사은품 이벤트 진행이력
- **필터 UI 없음** (`$where=[]`).
- 상단: `{number_format(total_results)} 개`
- 표(9컬럼, `table-centered w-100 nowrap table-sm bg-white table-bordered`, **colgroup width 3%/*/20%/5%/17%/5%/5%/5%/7%**, thead `table-light font-13`, tbody `font-12 bg-white`):
  1. 번호 (`idx`, text-center)
  2. 이벤트명 (`title`, text-start)
  3. 사은품명 (`gift_nm`, text-start)
  4. 사은품수량 (`number_format(gift_count)`, text-end)
  5. 이벤트 기간 (`start_dt ~ end_dt`, text-center)
  6. 당첨자발표 (`event_m_date`, text-center)
  7. 사은품발송 (`delivery_date`, text-center)
  8. 배송여부 (`is_delivery` raw, text-center)
  9. 당첨자현황 → `<a href="event_gift_member.php?idx={idx}" class="btn btn-outline-secondary btn-sm font-12">당첨자현황</a>`
- 하단: `links_html` 서버 페이지네이션(30/page, `idx desc`)
- 세션/권한: `lib.php` 관리자 가드(공통). topmenu event active.

### quirk / dead (원문 유지)
- 필터/검색 UI 없음.
- 행별로 `getEventLotteryMemberCount`·`getEventLotteryJoinCount`·`getEventLotteryItem`를 호출하지만 **출력에 전혀 미사용(dead fetch)** — 화면 데이터는 tbl_event_gift 컬럼뿐.
- `is_delivery`는 가공 없이 raw 출력.
- `success == true`일 때만 tbody 렌더.
- 당첨자현황 링크 대상 `event_gift_member.php`는 미이관 → legacy 경로 유지.

## 데이터 (legacy)
- DB: **DGKR** (`dsn_dgkr`).
- `getEventGiftList`: `SELECT * FROM tbl_event_gift WHERE 1=1 ORDER BY idx desc`, 30/page.
  - 사용 컬럼: idx, title, gift_nm, gift_count, start_dt, end_dt, event_m_date, delivery_date, is_delivery. (event_per_price는 dead 서브쿼리용)

## API 계약 (백엔드 전달)

### `GET /admin/event/gift-list` — 사은품 이벤트 진행이력
- 요청(query): `page`(number, 기본 1). 필터 없음.
- 응답:
  ```json
  {
    "items": [
      {
        "idx": 12,
        "title": "여름 프로모션 사은품 이벤트",
        "gift_nm": "닌텐도 스위치 2",
        "gift_count": 3,
        "start_dt": "2025-07-01 00:00:00",
        "end_dt": "2025-07-31 23:59:59",
        "event_m_date": "2025-08-05",
        "delivery_date": "2025-08-10",
        "is_delivery": "Y"
      }
    ],
    "pagination": { "current_page": 1, "results_per_page": 30, "total_results": 2, "total_pages": 1 }
  }
  ```
- 필드: `event_m_date`=당첨자발표, `delivery_date`=사은품발송, `is_delivery`=배송여부(raw).
- 정렬: `idx desc`. 페이지크기: 30.
- 백엔드 책임: DGKR DB `tbl_event_gift` 조회. 관리자 권한 서버측 강제.
- 에러: legacy PDOException → `Error!` die. 프론트 계약은 표준 5xx 가정.

## 타겟 매핑
- 라우트: `/event/event_gift_list` (`routes/event/event_gift_list.tsx`, page 검증)
- screen: `screens/event-gift-list`
- entities: `entities/event` 확장 — `EventGiftSearch`/`EventGiftItem`/`EventGiftListResponse`, `fetchEventGiftList`, `useEventGiftList`, `eventGiftListQueryKey`
- mock: `handlers/event.ts`에 `GET /admin/event/gift-list` + fixture
- 공용: `shared/ui` `ServerPagination`
- 미이관 링크: `/event/event_gift_member`(당첨자현황, 후속 단위)

## Parity 체크리스트
- [ ] 화면 요소 일치 (9컬럼 헤더·colgroup width·page title·breadcrumb·"N 개")
- [ ] 필드/포맷 일치 (number_format·이벤트명/사은품명 text-start·날짜 raw·is_delivery raw)
- [ ] 분기/플로우 일치 (필터 없음·idx desc·30/page·success 시만 렌더·dead fetch 미노출)
- [ ] 엣지케이스 일치 (빈 목록·페이지네이션·당첨자현황 링크 legacy 경로)
