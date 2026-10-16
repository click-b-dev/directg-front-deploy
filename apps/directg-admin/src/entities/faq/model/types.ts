// legacy board/faq_list.php — 자주묻는질문 목록(getFaqList, idx desc, 30/page).

export type FaqListSearch = {
  page: number;
  search_item_cd: string; // 구분(faq_type 등호, all/빈값 미적용)
  search_subject: string; // 질문검색(question LIKE %v%)
};

export type FaqListItem = {
  idx: number;
  faq_type: string;
  question: string; // 평문
  answer_html: string; // Parsedown 렌더 HTML(뷰용)
};

export type FaqPagination = {
  current_page: number;
  results_per_page: number;
  total_results: number;
  total_pages: number;
};

export type FaqListResponse = {
  items: FaqListItem[];
  pagination: FaqPagination;
};

// legacy faq_register.php(modify 로드) — 상세.
export type FaqDetail = {
  idx: number;
  faq_type: string;
  question: string;
  answer: string; // 원문 마크다운(편집용)
};

// legacy faq_ps.php mode=modify — 수정 요청.
export type FaqSaveRequest = {
  faq_type: string;
  question: string;
  answer: string;
};

export type FaqActionResult = { success: boolean };
