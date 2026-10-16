/**
 * 자주묻는질문 (legacy `tbl_faq` — Board::getFaqList).
 * 계약: `GET /api/board/faqs?page=N&searchValue=S`. 문서: docs/migration/storefront/board/faq.md
 */
export interface FaqRow {
  idx: number;
  faq_type: string;
  /** htmlspecialchars_decode(Parsedown(question)) — 백엔드 렌더 HTML. */
  question_html: string;
  /** htmlspecialchars_decode(Parsedown(answer)) — 백엔드 렌더 HTML. */
  answer_html: string;
}

export interface FaqListResponse {
  list: FaqRow[];
  page: number;
  totalPages: number;
}
