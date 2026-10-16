// legacy board/dataroom_file.php — 자료실 파일현황(getDataroomList, deploy_date desc, 30/page).

export type DataroomListSearch = {
  page: number;
};

export type DataroomListItem = {
  idx: number;
  file_type: string; // P=한글패치 / else 컨텐츠
  file_name: string;
  is_encode: string; // raw
  encode_type: string; // raw
  is_free: string; // Y=무료 / else 유료
  deploy_date: string;
  total_download: number;
  file_url: string;
};

export type DataroomPagination = {
  current_page: number;
  results_per_page: number;
  total_results: number;
  total_pages: number;
};

export type DataroomListResponse = {
  items: DataroomListItem[];
  pagination: DataroomPagination;
};

// legacy dataroom_register.php(modify 로드) · dataroom_view.php — 상세.
export type DataroomDetail = {
  idx: number;
  file_type: string;
  file_name: string;
  file_url: string;
  is_encode: string;
  encode_type: string;
  is_free: string;
  is_view: string;
  deploy_date: string;
  contents: string; // 원문 마크다운(편집용, #122)
  contents_html: string; // Parsedown 렌더 HTML(뷰용, #123)
  thumbnail: string;
};

// legacy dataroom_ps.php register/modify — 저장 요청.
export type DataroomSaveRequest = {
  file_type: string;
  file_name: string;
  file_url: string;
  is_encode: string;
  encode_type: string;
  is_free: string;
  is_view: string;
  deploy_date: string;
  contents: string;
  thumbnail: string; // 선택 파일명(백엔드 실제 업로드로 대체)
};

export type DataroomActionResult = { success: boolean };

// legacy dataroom_download.php — 자료실 다운로드현황(getDataroomDownloadList, b.idx desc, 30/page).
export type DataroomDownloadSearch = {
  page: number;
  search_title_name: string; // legacy 미적용(비기능 필터)
};

export type DataroomDownloadItem = {
  m_no: number;
  m_id: string;
  file_name: string;
  download_count: number;
};

export type DataroomDownloadResponse = {
  items: DataroomDownloadItem[];
  pagination: DataroomPagination;
};
