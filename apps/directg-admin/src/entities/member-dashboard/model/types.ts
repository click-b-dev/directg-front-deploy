// legacy member/dashboard_crm.php — 회원 대시보드(read-only 집계 스냅샷).
// docs/migration/admin/member/dashboard-crm.md 계약.

// tbl_member 전체 스캔 집계. status 0=회원/5=승인대기/1=탈퇴, mem_type R/P/S, mem_level 1/2/3.
export type MemberDashboardSummary = {
  total: number;
  active_all: number; // status=0
  pending: number; // status=5
  leave_cnt: number; // status=1
  type_r: number;
  type_p: number;
  type_s: number;
  lv1: number;
  lv2: number;
  lv3: number;
  join_today: number;
  join_week: number;
  join_month: number;
  pending_today: number;
  pending_week: number;
  pending_month: number;
  login_7: number;
  login_30: number;
  login_90: number;
  login_1y: number;
  login_never: number;
};

// sns_info sns_type별 연동 회원(distinct m_no).
export type SnsRow = { sns_type: string; cnt: number };

// tbl_email_api 어제부터 gubun별 발송/실패(failed IN 1,4).
export type MailRow = { gubun: string; cnt: number; fail: number };

export type MemberDashboard = {
  cached_at: number; // 기준시각 unix seconds
  summary: MemberDashboardSummary;
  sns_rows: SnsRow[];
  sns_total: number; // distinct m_no
  mail_rows: MailRow[];
};
