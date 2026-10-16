/**
 * 이벤트 목록 (legacy `Board::getEvenBoardtList` — 리뉴얼 DB `tbl_event`).
 * 계약: `GET /api/events`.
 * 문서: docs/migration/storefront/event/event-list.md
 */
export interface EventItem {
  /** 이벤트 제목(tbl_event.subject). 카드 h4 + 배너 alt. */
  subject: string;
  /** 본문 — legacy `Parsedown->text(htmlspecialchars_decode(contents))` 렌더 HTML. */
  contents_html: string;
  /** 배너 이미지 URL(event_banner). */
  event_banner: string;
  /** 배너 링크 URL(event_link_url). */
  event_link_url: string;
  /** 배너 링크 target(event_link_target: _blank/_self 등). */
  event_link_target: string;
}

export interface EventListResponse {
  list: EventItem[];
}
