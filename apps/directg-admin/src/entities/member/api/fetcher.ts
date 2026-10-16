import { apiClient } from "@shared/api/client";
import type {
  MemberListResponse,
  MemberListSearch,
  LeaveMemberResult,
  MemberViewResponse,
  ResetAuthResult,
  MemberReadyListResponse,
  MemberReadyListSearch,
  MemberProcResult,
  MemberSnsListResponse,
  MemberSnsListSearch,
  SnsProvider,
  MemberPointListResponse,
  MemberPointListSearch,
  MemberPointTargetResponse,
  MemberPointSubmitRequest,
  MemberPointSubmitResult,
  DirectSendRemaining,
  DirectSendMailLogResponse,
  DirectSendMailLogSearch,
} from "../model/types";

// legacy member_list.php + AdminV1::getMemberList — status=0 목록(필터/정렬/30 페이지).
// 빈값/중립값(member_level 0)은 미전송, 백엔드가 WHERE 빌드(등호/LIKE 규칙은 계약 참조).
export const fetchMemberList = (query: MemberListSearch) => {
  const searchParams: Record<string, string> = { page: String(query.page) };
  const setStr = (key: string, value: string) => {
    if (value !== "") searchParams[key] = value;
  };
  setStr("search_type", query.search_type);
  setStr("search_value", query.search_value);
  if (query.member_level > 0) searchParams.member_level = String(query.member_level);
  setStr("old_login", query.old_login);
  setStr("mailling", query.mailling);
  setStr("is_auth", query.is_auth);
  setStr("mem_type", query.mem_type);
  setStr("start_reg_date", query.start_reg_date);
  setStr("end_reg_date", query.end_reg_date);
  setStr("start_log_date", query.start_log_date);
  setStr("end_log_date", query.end_log_date);
  setStr("sort", query.sort);
  setStr("dir", query.dir);
  return apiClient.get<MemberListResponse>("/admin/member/list", { searchParams });
};

// legacy member_proc.php mode=leave — 회원 탈퇴(status=1·out_date, sns_info 삭제, log_hack 기록은 백엔드).
export const leaveMember = (m_no: number) =>
  apiClient.post<LeaveMemberResult>("/admin/member/leave", { m_no });

// legacy member_view.php — 회원 상세 통합 스냅샷(회원/포인트/등급이력/주문·문의 요약).
export const fetchMemberView = (m_no: string) =>
  apiClient.get<MemberViewResponse>("/admin/member/view", { searchParams: { m_no } });

// legacy member_proc.php mode=authReset — 본인인증 초기화(is_auth=N, 개인정보 NULL은 백엔드).
export const resetMemberAuth = (m_no: number) =>
  apiClient.post<ResetAuthResult>("/admin/member/auth-reset", { m_no });

// legacy member_list_ready.php + AdminV1::getMemberReadyList — status=5 목록(검색/30 페이지).
export const fetchMemberReadyList = (query: MemberReadyListSearch) => {
  const searchParams: Record<string, string> = { page: String(query.page) };
  if (query.search_type !== "") searchParams.search_type = query.search_type;
  if (query.search_value !== "") searchParams.search_value = query.search_value;
  return apiClient.get<MemberReadyListResponse>("/admin/member/ready", { searchParams });
};

// legacy member_proc.php mode=apply — 가입승인(status=0은 백엔드).
export const applyMember = (m_no: number) =>
  apiClient.post<MemberProcResult>("/admin/member/apply", { m_no });

// legacy member_proc.php mode=delete — 삭제(sns_info·tbl_member 삭제는 백엔드).
export const deleteMember = (m_no: number) =>
  apiClient.post<MemberProcResult>("/admin/member/delete", { m_no });

// legacy member_{naver|kakao|payco}_list.php + AdminV1::getMemberSnsList — 간편로그인 연동현황(30/page).
export const fetchMemberSnsList = (provider: SnsProvider, query: MemberSnsListSearch) => {
  const searchParams: Record<string, string> = { sns_type: provider, page: String(query.page) };
  if (query.search_type !== "") searchParams.search_type = query.search_type;
  if (query.search_value !== "") searchParams.search_value = query.search_value;
  if (query.sns_flag !== "" && query.sns_flag !== "all") searchParams.sns_flag = query.sns_flag;
  return apiClient.get<MemberSnsListResponse>("/admin/member/sns", { searchParams });
};

// legacy member_point_list.php + AdminV1::getMemberPointList — tbl_emoney_log 내역(50/page).
export const fetchMemberPointList = (query: MemberPointListSearch) => {
  const searchParams: Record<string, string> = { page: String(query.page) };
  if (query.search_type !== "") searchParams.search_type = query.search_type;
  if (query.search_value !== "") searchParams.search_value = query.search_value;
  if (query.emoney_type !== "" && query.emoney_type !== "all")
    searchParams.emoney_type = query.emoney_type;
  return apiClient.get<MemberPointListResponse>("/admin/member/point/list", { searchParams });
};

// legacy member_point_form.php — 지급/차감 대상 회원 조회(아이디 완전일치).
export const fetchMemberPointTarget = (search_value: string) =>
  apiClient.get<MemberPointTargetResponse>("/admin/member/point/target", {
    searchParams: { search_value },
  });

// legacy member_point_proc.php — 포인트 지급/차감(tbl_emoney_log INSERT는 백엔드).
export const submitMemberPoint = (payload: MemberPointSubmitRequest) =>
  apiClient.post<MemberPointSubmitResult>("/admin/member/point", payload);

// legacy directsend_remaining_emoney.php — DirectSend 메일 API 잔액(외부 API는 백엔드).
export const fetchDirectSendRemaining = () =>
  apiClient.get<DirectSendRemaining>("/admin/member/directsend/remaining");

// legacy directsend_mail_log.php + AdminV1::getDirectSendMailLog — tbl_email_api 발송로그(50/page).
export const fetchDirectSendMailLog = (query: DirectSendMailLogSearch) => {
  const searchParams: Record<string, string> = { page: String(query.page) };
  if (query.gubun !== "" && query.gubun !== "all") searchParams.gubun = query.gubun;
  if (query.failed !== "" && query.failed !== "all") searchParams.failed = query.failed;
  if (query.search_type !== "") searchParams.search_type = query.search_type;
  if (query.search_value !== "") searchParams.search_value = query.search_value;
  return apiClient.get<DirectSendMailLogResponse>("/admin/member/directsend/mail-log", {
    searchParams,
  });
};
