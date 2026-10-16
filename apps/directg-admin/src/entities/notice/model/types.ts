// legacy board/notice_list.php — 공지사항 목록(getNoticeList, deploy_date desc, 30/page).

export type NoticeListSearch = {
  page: number;
  search_title: string; // 제목(subject LIKE %val%)
  search_notice_type: string; // 구분(notice_type 등호 1|2|3|4, all/빈값 미적용)
};

export type NoticeListItem = {
  idx: number;
  notice_type: string; // 1|2|3|4
  subject: string;
  is_notice: "Y" | "N"; // Y면 "공지" badge
  reg_date: string; // 작성일자
  deploy_date: string; // 배포일자
  is_view: "Y" | "N"; // Y→O / N→X
  hit: number; // 조회수
};

export type NoticePagination = {
  current_page: number;
  results_per_page: number;
  total_results: number;
  total_pages: number;
};

export type NoticeListResponse = {
  items: NoticeListItem[];
  pagination: NoticePagination;
};

// legacy notice_ps.php mode=delete — 하드 삭제.
export type NoticeActionResult = { success: boolean };

// legacy notice_register.php(modify 로드) · notice_view.php — 상세.
export type NoticeDetail = {
  idx: number;
  notice_type: string;
  subject: string;
  contents: string; // 원문 마크다운(편집용, #114)
  contents_html: string; // Parsedown 렌더 HTML(뷰용, #115 dangerouslySetInnerHTML)
  is_notice: "Y" | "N";
  is_view: "Y" | "N";
  deploy_date: string;
  reg_date: string;
  admin_id: string;
};

// legacy notice_ps.php mode=regitster / modify — 등록/수정 요청(공통 필드).
export type NoticeSaveRequest = {
  notice_type: string;
  subject: string;
  contents: string;
  is_notice: string;
  is_view: string;
  deploy_date: string;
};
