// legacy member/member_list.php + AdminV1::getMemberList — 회원(status=0) 목록.
// docs/migration/admin/member/member-list.md 계약.

// tbl_member tm.* 중 목록 렌더 사용 컬럼.
export type MemberListItem = {
  m_no: number;
  m_id: string;
  email: string;
  name: string;
  nickname: string;
  birth_day: string; // YYMMDD(6) 또는 YYYYMMDD(8), 빈값 가능
  hp: string;
  mem_level: number; // 1/2/3
  reg_date: string;
  log_date: string;
  ip: string;
  visited: number;
  sns_type: string; // 가입방법(대문자 표기)
  mem_type: string; // P/R/S/E
};

export type MemberPagination = {
  current_page: number;
  total_results: number;
  total_pages: number;
};

export type MemberListResponse = {
  items: MemberListItem[];
  pagination: MemberPagination;
  total_all: number; // status=0 전체(필터 무관)
};

// 검색/정렬/페이지 파라미터 — validateSearch가 채운다(빈값은 "" / member_level 0 / page 1).
export type MemberListSearch = {
  page: number;
  search_type: string;
  search_value: string;
  member_level: number;
  old_login: string;
  mailling: string;
  is_auth: string;
  mem_type: string;
  start_reg_date: string;
  end_reg_date: string;
  start_log_date: string;
  end_log_date: string;
  sort: string;
  dir: string;
};

export type LeaveMemberResult = { success: boolean };

// ── 회원 상세(member_view) ──

export type MemberViewInfo = {
  m_no: number;
  m_id: string;
  email: string;
  name: string;
  nickname: string;
  birth_day: string;
  hp: string;
  mem_level: number;
  reg_date: string;
  log_date: string;
  ip: string;
  visited: number;
  sns_type: string;
  mem_type: string;
  is_auth: string; // Y/N
  point: number; // SUM(amt_delta)
};

export type MemberLevelHistoryItem = {
  history_date: string;
  mem_level: number;
  order_price: number;
};

export type MemberOrderStats = {
  step2_cnt: number;
  step2_price: number;
  success_cnt: number;
  cancel_cnt: number;
};

export type MemberOrderItem = {
  order_date: string;
  settle_no: string;
  step: number;
  step_label: string; // getCheckoutStatus(백엔드)
  ordno: string;
  product_name: string;
  price: number;
  status: number;
  status_label: string; // getOrderStatus(백엔드)
};

export type MemberQnaItem = {
  gubun: string;
  idx: number;
  subject: string;
  file_cnt: number;
  reg_date: string;
  answer: string;
  admin_id: string;
};

export type MemberViewResponse = {
  member: MemberViewInfo;
  level_history: MemberLevelHistoryItem[];
  level_history_total: number;
  order_stats: MemberOrderStats;
  orders: { total_results: number; items: MemberOrderItem[] };
  qna: { total_results: number; items: MemberQnaItem[] };
};

export type ResetAuthResult = { success: boolean };

// ── 승인대기 리스트(member_list_ready, status=5) ──

export type MemberReadyItem = {
  m_no: number;
  m_id: string;
  name: string;
  nickname: string;
  ip: string;
  country: string;
  reg_date: string;
  channel: string;
};

export type MemberReadyListResponse = {
  items: MemberReadyItem[];
  pagination: MemberPagination;
  total_all: number; // status=5 전체
};

export type MemberReadyListSearch = {
  page: number;
  search_type: string;
  search_value: string;
};

export type MemberProcResult = { success: boolean };

// ── 간편로그인 연동현황(sns_info, status=0 ∩ sns_type) ──

export type SnsProvider = "NAVER" | "KAKAO" | "PAYCO";

export type MemberSnsItem = {
  m_no: number;
  m_id: string;
  email: string;
  name: string;
  nickname: string;
  birth_day: string;
  ip: string;
  country: string;
  visited: number;
  flag: string; // N=신규 가입 / C=계정 연결
  reg_date: string;
  sns_connect_date: string;
};

export type MemberSnsListResponse = {
  items: MemberSnsItem[];
  pagination: MemberPagination;
  total_all: number;
};

export type MemberSnsListSearch = {
  page: number;
  search_type: string;
  search_value: string;
  sns_flag: string;
};

// ── 포인트 지급/차감 내역(member_point_list, tbl_emoney_log) ──

export type MemberPointLogItem = {
  sno: number;
  m_no: number;
  m_id: string;
  mem_level: number;
  emoney_type: string; // "+" 지급 / "-" 차감
  emoney: number;
  regdt: string;
  admin_id: string;
  memo: string;
};

export type MemberPointListResponse = {
  items: MemberPointLogItem[];
  pagination: MemberPagination;
  total_all: number;
};

export type MemberPointListSearch = {
  page: number;
  search_type: string;
  search_value: string;
  emoney_type: string;
};

// ── 포인트 지급/차감 폼(member_point_form) ──

export type MemberPointTarget = {
  m_no: number;
  m_id: string;
  nickname: string;
  name: string;
  mem_level: number;
  point: number;
  reg_date: string;
  log_date: string;
};

export type MemberPointTargetResponse = { member: MemberPointTarget | null };

export type MemberPointSubmitRequest = {
  m_no: number;
  point_type: "add" | "sub";
  point: number;
  memo_type: string;
  memo: string;
};

export type MemberPointSubmitResult = { success: boolean; message: string };

// ── 자동메일 잔액조회(directsend_remaining_emoney) ──

export type DirectSendRemaining = { remaining_point: number };

// ── 자동메일발송 로그(directsend_mail_log, tbl_email_api) ──

export type DirectSendMailLogItem = {
  gubun: string;
  email: string;
  reg_date: string;
  result: string;
  failed: number;
  state: number;
  smtp_msg: string;
};

export type DirectSendMailLogResponse = {
  items: DirectSendMailLogItem[];
  pagination: MemberPagination;
};

export type DirectSendMailLogSearch = {
  page: number;
  gubun: string;
  failed: string;
  search_type: string;
  search_value: string;
};
