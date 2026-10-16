// legacy board/qna_list.php — 문의하기 목록(getQnaList, idx DESC, 30/page).

export type QnaListSearch = {
  page: number;
  searchType: string; // subject|user_id|contents|subject_contents
  searchTitle: string; // LIKE %v%
  searchGubun: string; // 구분(gubun 등호 1~9)
  is_answer: string; // 답변상태(Y|N)
  replyStatus: string; // 고객확인(0|1)
  email_flag: string; // 메일발송(Y=발송 / N=미발송)
};

export type QnaListItem = {
  idx: number;
  gubun: string;
  subject: string;
  user_id: string;
  reg_date: string;
  answer: string; // 비어있지 않으면 답변상태 O
  admin_id: string;
  replyStatus: string; // "1"이면 확인
  email_flag: string; // "Y"이면 발송
  file_cnt: number; // >0이면 첨부 아이콘
};

export type QnaPagination = {
  current_page: number;
  results_per_page: number;
  total_results: number;
  total_pages: number;
};

export type QnaListResponse = {
  items: QnaListItem[];
  pagination: QnaPagination;
};

// legacy qna_ps.php mode=delete — 다중 삭제(FIND_IN_SET).
export type QnaDeleteRequest = { idx: number[] };
export type QnaDeleteResult = { success: boolean; deleted: number };

// legacy qna_view.php — 문의 상세(회원·첨부·이력 포함).
export type QnaFile = {
  filename: string;
  reg_date: string; // 2025-08-19 기준 도메인 분기
};

export type QnaHistoryItem = {
  idx: number;
  gubun: string;
  subject: string;
  user_id: string;
  reg_date: string;
  is_answer: string; // Y|N
  admin_id: string;
};

export type QnaDetail = {
  idx: number;
  user_id: string;
  subject: string;
  reg_date: string;
  gubun: string;
  contents_html: string; // nl2br + decode(백엔드)
  answer: string; // 원문 HTML(SmartEditor2 초기값, #120)
  answer_html: string; // nl2br + decode(백엔드)
  replyStatus: string; // 0|1
  email_flag: string; // Y|""
  is_answer: string; // Y|N
  admin_id: string;
  member: { m_no: number; email: string };
  files: QnaFile[];
  history: QnaHistoryItem[];
};

// legacy qna_ps.php mode=mail — 문의답변 메일 발송.
export type QnaMailRequest = { email: string };
export type QnaMailResult = { success: boolean; message: string };

// legacy qna_ps.php mode=update — 답변 저장(SmartEditor2 HTML).
export type QnaAnswerRequest = { answer: string };
export type QnaAnswerResult = { success: boolean };
