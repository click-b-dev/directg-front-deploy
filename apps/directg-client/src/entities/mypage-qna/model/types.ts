/**
 * 문의 내역 (legacy `tbl_qna` — Mypage::getqnaList).
 * 계약: `GET /api/mypage/qna?page=N`, `POST /api/mypage/qna/view`.
 * 문서: docs/migration/storefront/mypage/qna-list.md
 */
export interface QnaRow {
  idx: number;
  /** 구분 코드 (qnaGubun 라벨은 프론트 상수). */
  gubun: string;
  subject: string;
  reg_date: string;
  /** "Y"=답변완료. */
  is_answer: string;
  /** htmlspecialchars_decode(Parsedown(contents)) — 백엔드 렌더 HTML. */
  contents_html: string;
  /** htmlspecialchars_decode(answer) — 백엔드 디코딩(미답변 시 빈값). */
  answer_html: string;
}

export interface QnaListResponse {
  list: QnaRow[];
  page: number;
  totalPages: number;
}

/** 문의 등록 응답 (legacy mode=register). */
export interface QnaRegisterResponse {
  error_code: "OK" | "NG";
  error_msg: string;
}
