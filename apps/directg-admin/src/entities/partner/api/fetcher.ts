import { apiClient } from "@shared/api/client";
import type {
  PartnerMemberListSearch,
  PartnerMemberListResponse,
  PartnerListSearch,
  PartnerListResponse,
  PartnerSupplierItem,
  PartnerMutationResult,
  PartnerAddRequest,
  PartnerConfigRequest,
  PartnerReportConfigRequest,
  PartnerPgFeeSearch,
  PartnerPgFeeListResponse,
  PartnerPgFeeCandidate,
  PartnerPgFeeRegisterRequest,
  PartnerPgFeeModifyRequest,
  PartnerPgFeeDeleteRequest,
  PartnerEmailSearch,
  PartnerEmailListResponse,
  PartnerEmailCandidate,
  PartnerSalesListSearch,
  PartnerSalesListResponse,
  PartnerListAllItem,
  PartnerSalesSyncRequest,
  PartnerRefundListSearch,
  PartnerRefundListResponse,
  PartnerRefundSyncRequest,
  PartnerReportPreviewParams,
  PartnerReportPreviewResponse,
  PartnerReportCreateRequest,
  PartnerRevenueEditRequest,
  PartnerReportListParams,
  PartnerReportListResponse,
  PartnerReportViewResponse,
} from "../model/types";

// legacy partner/partner_list.php — 파트너 계정 목록.
export const fetchPartnerMemberList = (query: PartnerMemberListSearch) => {
  const searchParams: Record<string, string> = {};
  const set = (key: keyof PartnerMemberListSearch, value: string | number | undefined) => {
    if (value !== undefined && value !== "") {
      searchParams[key] = String(value);
    }
  };
  set("page", query.page);
  set("search_publisher_name", query.search_publisher_name);
  set("report_term", query.report_term);
  set("is_system", query.is_system);
  return apiClient.get<PartnerMemberListResponse>("/admin/partner/members", { searchParams });
};

// legacy partner/partner_code.php — 파트너 코드 목록(tbl_partner).
export const fetchPartnerList = (query: PartnerListSearch) => {
  const searchParams: Record<string, string> = {};
  const set = (key: keyof PartnerListSearch, value: string | number | undefined) => {
    if (value !== undefined && value !== "") {
      searchParams[key] = String(value);
    }
  };
  set("page", query.page);
  set("search_publisher_name", query.search_publisher_name);
  set("report_term", query.report_term);
  set("is_system", query.is_system);
  return apiClient.get<PartnerListResponse>("/admin/partner/partners", { searchParams });
};

// legacy getSupplierList() — 미등록 공급처 목록(추가 모달 select).
export const fetchPartnerSuppliers = () =>
  apiClient.get<PartnerSupplierItem[]>("/admin/partner/suppliers");

// legacy partner_ps.php mode=partner_add — 파트너 등록.
export const createPartner = (payload: PartnerAddRequest) =>
  apiClient.post<PartnerMutationResult>("/admin/partner/partners", payload);

// legacy partner_ps.php mode=partner_config — is_system 토글.
export const configPartnerSystem = (payload: PartnerConfigRequest) =>
  apiClient.post<PartnerMutationResult>("/admin/partner/partners/system", payload);

// legacy partner_ps.php mode=partner_report_config — 리포트 주기 수정.
export const configPartnerReportTerm = (payload: PartnerReportConfigRequest) =>
  apiClient.post<PartnerMutationResult>("/admin/partner/partners/report-term", payload);

// legacy partner/partner_pg_fee.php — PG 수수료 목록(tbl_pg_fee).
export const fetchPartnerPgFeeList = (query: PartnerPgFeeSearch) => {
  const searchParams: Record<string, string> = {};
  const set = (key: keyof PartnerPgFeeSearch, value: string | number | undefined) => {
    if (value !== undefined && value !== "") {
      searchParams[key] = String(value);
    }
  };
  set("page", query.page);
  set("search_publisher_name", query.search_publisher_name);
  return apiClient.get<PartnerPgFeeListResponse>("/admin/partner/pg-fees", { searchParams });
};

// legacy getNonPgfeePartner() — 수수료 미등록 파트너(등록 모달 select).
export const fetchPartnerPgFeeCandidates = () =>
  apiClient.get<PartnerPgFeeCandidate[]>("/admin/partner/pg-fees/candidates");

// legacy partner_pg_fee_ps.php mode=register — PG 수수료 등록.
export const registerPartnerPgFee = (payload: PartnerPgFeeRegisterRequest) =>
  apiClient.post<PartnerMutationResult>("/admin/partner/pg-fees", payload);

// legacy partner_pg_fee_ps.php mode=modify — PG 수수료 수정.
export const modifyPartnerPgFee = (payload: PartnerPgFeeModifyRequest) =>
  apiClient.post<PartnerMutationResult>("/admin/partner/pg-fees/modify", payload);

// legacy partner_pg_fee_ps.php mode=delete — PG 수수료 삭제.
export const deletePartnerPgFee = (payload: PartnerPgFeeDeleteRequest) =>
  apiClient.post<PartnerMutationResult>("/admin/partner/pg-fees/delete", payload);

// legacy partner/partner_email.php — 파트너 알림 주소록 목록(읽기 전용, tbl_publisher_email).
export const fetchPartnerEmailList = (query: PartnerEmailSearch) => {
  const searchParams: Record<string, string> = {};
  if (query.page) {
    searchParams.page = String(query.page);
  }
  return apiClient.get<PartnerEmailListResponse>("/admin/partner/notification-emails", {
    searchParams,
  });
};

// legacy getNonEmailPartner() — 등록 모달 후보(이메일 미등록 파트너).
export const fetchPartnerEmailCandidates = () =>
  apiClient.get<PartnerEmailCandidate[]>("/admin/partner/notification-emails/candidates");

// legacy partner/sales_list.php — Sales list 조회(publisher_code 미지정 시 빈 목록).
export const fetchPartnerSalesList = (query: PartnerSalesListSearch) => {
  const searchParams: Record<string, string> = {};
  if (query.search_publisher_code) {
    searchParams.publisher_code = query.search_publisher_code;
  }
  if (query.search_year) {
    searchParams.year = query.search_year;
  }
  if (query.search_month) {
    searchParams.month = query.search_month;
  }
  return apiClient.get<PartnerSalesListResponse>("/admin/partner/sales-list", { searchParams });
};

// legacy getPartnerListAll(is_system) — 파트너 select(is_system 지정 시 필터, 없으면 전체).
export const fetchPartnerListAll = (isSystem?: string) => {
  const searchParams: Record<string, string> = {};
  if (isSystem) {
    searchParams.is_system = isSystem;
  }
  return apiClient.get<PartnerListAllItem[]>("/admin/partner/list-all", { searchParams });
};

// legacy report_ps.php mode=report_batch — Sales list 동기화(저장 프로시저).
export const syncPartnerSales = (payload: PartnerSalesSyncRequest) =>
  apiClient.post<PartnerMutationResult>("/admin/partner/sales-list/sync", payload);

// legacy partner/refund_list.php — Refund list 조회(publisher_code 미지정 시 빈 목록).
export const fetchPartnerRefundList = (query: PartnerRefundListSearch) => {
  const searchParams: Record<string, string> = {};
  if (query.search_publisher_code) {
    searchParams.publisher_code = query.search_publisher_code;
  }
  if (query.search_year) {
    searchParams.year = query.search_year;
  }
  if (query.search_month) {
    searchParams.month = query.search_month;
  }
  return apiClient.get<PartnerRefundListResponse>("/admin/partner/refund-list", { searchParams });
};

// legacy report_ps.php mode=refund_batch — Refund list 동기화(저장 프로시저).
export const syncPartnerRefund = (payload: PartnerRefundSyncRequest) =>
  apiClient.post<PartnerMutationResult>("/admin/partner/refund-list/sync", payload);

// legacy partner/report_register.php — 정산 리포트 미리보기(setPartnerReport + getPartnerPGFee).
export const fetchPartnerReportPreview = (params: PartnerReportPreviewParams) => {
  const searchParams: Record<string, string> = {};
  if (params.publisher_code) {
    searchParams.publisher_code = params.publisher_code;
  }
  searchParams.report_term = params.report_term;
  if (params.year) {
    searchParams.year = params.year;
  }
  if (params.month) {
    searchParams.month = params.month;
  }
  return apiClient.get<PartnerReportPreviewResponse>("/admin/partner/report/preview", {
    searchParams,
  });
};

// legacy report_ps.php mode=report_register — tbl_report_config + tbl_report.
export const createPartnerReport = (payload: PartnerReportCreateRequest) =>
  apiClient.post<PartnerMutationResult>("/admin/partner/report", payload);

// legacy report_ps.php mode=revenue_edit — tbl_goods_item product_rs/product_srp.
export const editPartnerRevenue = (payload: PartnerRevenueEditRequest) =>
  apiClient.post<PartnerMutationResult>("/admin/partner/report/revenue-edit", payload);

// legacy partner/report_list.php — 리포트 내역 목록(tbl_report_config).
export const fetchPartnerReportList = (params: PartnerReportListParams) => {
  const searchParams: Record<string, string> = { report_term: params.report_term };
  if (params.publisher_code) {
    searchParams.publisher_code = params.publisher_code;
  }
  if (params.year) {
    searchParams.year = params.year;
  }
  if (params.month) {
    searchParams.month = params.month;
  }
  return apiClient.get<PartnerReportListResponse>("/admin/partner/report/list", { searchParams });
};

// legacy partner/report_view.php — 리포트 상세보기(read-only).
export const fetchPartnerReportView = (idx: string) =>
  apiClient.get<PartnerReportViewResponse>("/admin/partner/report/view", {
    searchParams: { idx },
  });
