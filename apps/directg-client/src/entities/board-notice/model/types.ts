/**
 * 공지사항 목록 (legacy `tbl_notice` — Board::getNoticeList).
 * 계약: `GET /api/board/notices?page=N&searchValue=S`. 문서: docs/migration/storefront/board/notice-list.md
 */
export interface NoticeListRow {
  idx: number;
  /** legacy select 포함(구분). 화면엔 미표시(주석처리). */
  notice_type: string;
  subject: string;
  deploy_date: string;
  hit: number;
}

export interface NoticeListResponse {
  list: NoticeListRow[];
  page: number;
  totalPages: number;
}

/**
 * 공지사항 상세 (legacy Board::getNoticeView). 계약: `GET /api/board/notices/:idx`.
 * 문서: docs/migration/storefront/board/notice-view.md
 */
export interface NoticeView {
  idx: number;
  subject: string;
  deploy_date: string;
  notice_type: string;
  hit: number;
  /** html_print2 디코딩 원문 (meta description용). */
  contents: string;
  /** Parsedown 렌더 + `&#13;&#10;`→`<br/>` 최종 HTML (본문용). */
  contents_html: string;
}
