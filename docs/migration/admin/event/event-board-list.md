# 이벤트게시판 목록 (event_board_list) + 이벤트 영역 사이드바 배선

## 원본
- 파일: `pc/_Admin_/event/event_board_list.php` (라이브)
- 데이터: `AdminBoard::getEventList($page, $add_where, $orderby, $param)`
- SQL: `select * from tbl_event where 1=1 [add_where] order by is_view desc, start_date desc` — **10/page**
- 참조: `docs/legacy-admin/`, `../legacy-project/docs/PROMOTION-EVENT-OPS.md`

## 화면·플로우
- 진입 URL: `/event/event_board_list?page&is_view` (topbar `이벤트` 메뉴 진입점)
- breadcrumb: 홈 / 게시판 / 이벤트게시판 관리 / (active) 이벤트게시판 목록 · h4 `이벤트게시판 목록`
- 상단: `N 개`(total_results) + `이벤트 게시판 등록` 버튼(btn-danger → `/event/event_board_register`, Unit 2)
- col-10: 이벤트 카드 목록(각 tbl_event 행)
  - card-header: `노출 기간` = `date('Y-m-d H:i:s', start_date) ~ date(..., end_date)`(start/end_date는 **unix**) + is_view 뱃지(Y 노출함/N 노출안함) + 프로모션 노출 여부 뱃지(show_promotion)
  - float-end: `event_gubun != '5'`일 때만 `이벤트 통계` 링크(→ `statistics/event/event_order_count.php?event_no=idx`, **통계 영역 미이관** → legacy 경로 `<a href target=_blank>` 유지) · `이벤트 수정` 링크(→ `event_board_modify?idx`, Unit 2)
  - card-body: col-5 배너 이미지(`event_banner`, `event_link_url`로 링크 target _blank) / col-7 event_gubun 뱃지 + subject + contents(Parsedown → HTML, `dangerouslySetInnerHTML`)
  - ServerPagination(10/page, links_html 재현)
- col-2: 필터 폼(`is_view` select: 전체/노출함/노출안함, onchange submit=GET 네비게이션)
- `event_gubun` 라벨: 1 예약구매 / 2 네이버페이 즉시할인 / 3 토스 즉시할인 / 4 네이버페이 포인트 쿠폰 / 5 당첨자발표 / 6 DGKR 포인트

## 사이드바 배선 (영역 착수)
- `widgets/sidebar` `EVENT_SIDE_NAV` 신규 + `resolveSideNav`에 `/event` 분기(expandAll). event는 대시보드 없음 → 5개 그룹만.
- 그룹: 이벤트 게시판 관리 / 이벤트 관리 / 구매 이벤트 관리 / 사은품 관리 / 추가 포인트 지급 관리
- 제외: 추첨 이벤트 등록·[X]사은품 발송완료(HTML 주석) / 이벤트 현황 상세·사은품 진행이력 상세(display:none)
- topbar `이벤트` 메뉴는 기존 배선됨(#3).

## API 계약 (백엔드 전달)
### `GET /admin/event/board-list`
- 쿼리: `page`(10/page), `is_view`("" | "Y" | "N")
- where: `is_view` 있으면 `is_view = :is_view`. 정렬 `is_view desc, start_date desc`.
- 응답 `200`: `{ items: [{ idx, event_gubun, subject, contents_html, start_date(unix), end_date(unix), event_banner, event_link_url, is_view, show_promotion }], pagination: { current_page, results_per_page, total_results, total_pages } }`
- 백엔드 책임: `contents`를 htmlspecialchars_decode 후 Parsedown 렌더한 `contents_html` 제공.

## 타겟 매핑
- 라우트: `routes/event/event_board_list.tsx` / screens: `event-board-list` / entities: `event`(신규) / mock: `handlers/event`(신규) / `shared/ui/ServerPagination`

## Parity 체크리스트
- [ ] N개·등록 버튼 · 카드(노출기간 unix→date·뱃지·통계/수정 링크·배너·gubun 뱃지·Parsedown 내용)
- [ ] event_gubun=5는 통계 링크 숨김 · is_view 필터 · 10/page 페이지네이션
- [ ] 사이드바 event 트리(5그룹 expandAll) 전환
