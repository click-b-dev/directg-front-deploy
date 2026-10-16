import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchPartnerMemberList,
  fetchPartnerList,
  fetchPartnerSuppliers,
  createPartner,
  configPartnerSystem,
  configPartnerReportTerm,
  fetchPartnerPgFeeList,
  fetchPartnerPgFeeCandidates,
  registerPartnerPgFee,
  modifyPartnerPgFee,
  deletePartnerPgFee,
  fetchPartnerEmailList,
  fetchPartnerEmailCandidates,
  fetchPartnerSalesList,
  fetchPartnerListAll,
  syncPartnerSales,
  fetchPartnerRefundList,
  syncPartnerRefund,
  fetchPartnerReportPreview,
  createPartnerReport,
  editPartnerRevenue,
  fetchPartnerReportList,
  fetchPartnerReportView,
} from "./fetcher";
import type {
  PartnerMemberListSearch,
  PartnerListSearch,
  PartnerAddRequest,
  PartnerConfigRequest,
  PartnerReportConfigRequest,
  PartnerPgFeeSearch,
  PartnerPgFeeRegisterRequest,
  PartnerPgFeeModifyRequest,
  PartnerPgFeeDeleteRequest,
  PartnerEmailSearch,
  PartnerSalesListSearch,
  PartnerSalesSyncRequest,
  PartnerRefundListSearch,
  PartnerRefundSyncRequest,
  PartnerReportPreviewParams,
  PartnerReportCreateRequest,
  PartnerRevenueEditRequest,
  PartnerReportListParams,
} from "../model/types";

const PARTNER_KEY = ["admin", "partner"] as const;
const PARTNER_LIST_KEY = [...PARTNER_KEY, "partners"] as const;
const PARTNER_PG_FEE_KEY = [...PARTNER_KEY, "pg-fees"] as const;
const PARTNER_EMAIL_KEY = [...PARTNER_KEY, "notification-emails"] as const;
const PARTNER_SALES_KEY = [...PARTNER_KEY, "sales-list"] as const;
const PARTNER_REFUND_KEY = [...PARTNER_KEY, "refund-list"] as const;
const PARTNER_REPORT_KEY = [...PARTNER_KEY, "report"] as const;

export const partnerMemberListQueryKey = (query: PartnerMemberListSearch) =>
  [...PARTNER_KEY, "members", query] as const;

// legacy partner/partner_list.php — 파트너 계정 관리 목록.
export const usePartnerMemberList = (query: PartnerMemberListSearch) =>
  useQuery({
    queryKey: partnerMemberListQueryKey(query),
    queryFn: () => fetchPartnerMemberList(query),
  });

export const partnerListQueryKey = (query: PartnerListSearch) =>
  [...PARTNER_LIST_KEY, query] as const;

// legacy partner/partner_code.php — 파트너 코드 관리 목록.
export const usePartnerList = (query: PartnerListSearch) =>
  useQuery({
    queryKey: partnerListQueryKey(query),
    queryFn: () => fetchPartnerList(query),
  });

// legacy getSupplierList() — 추가 모달 공급처 목록.
export const usePartnerSuppliers = () =>
  useQuery({
    queryKey: [...PARTNER_KEY, "suppliers"] as const,
    queryFn: () => fetchPartnerSuppliers(),
  });

// legacy partner_add → window.location.reload() = 목록+공급처 invalidate.
export const useCreatePartner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (p: PartnerAddRequest) => createPartner(p),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PARTNER_LIST_KEY });
      queryClient.invalidateQueries({ queryKey: [...PARTNER_KEY, "suppliers"] });
    },
  });
};

// legacy partner_config → location.reload 주석 = invalidate 없음(목록 미갱신, 로컬 상태 유지).
export const useConfigPartnerSystem = () =>
  useMutation({
    mutationFn: (p: PartnerConfigRequest) => configPartnerSystem(p),
  });

// legacy partner_report_config → window.location.reload() = 목록 invalidate.
export const useConfigPartnerReportTerm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (p: PartnerReportConfigRequest) => configPartnerReportTerm(p),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PARTNER_LIST_KEY }),
  });
};

export const partnerPgFeeListQueryKey = (query: PartnerPgFeeSearch) =>
  [...PARTNER_PG_FEE_KEY, query] as const;

// legacy partner/partner_pg_fee.php — PG 수수료 목록.
export const usePartnerPgFeeList = (query: PartnerPgFeeSearch) =>
  useQuery({
    queryKey: partnerPgFeeListQueryKey(query),
    queryFn: () => fetchPartnerPgFeeList(query),
  });

// legacy getNonPgfeePartner() — 등록 모달 후보.
export const usePartnerPgFeeCandidates = () =>
  useQuery({
    queryKey: [...PARTNER_PG_FEE_KEY, "candidates"] as const,
    queryFn: () => fetchPartnerPgFeeCandidates(),
  });

// legacy register → location.reload() = 목록+후보 invalidate.
export const useRegisterPartnerPgFee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (p: PartnerPgFeeRegisterRequest) => registerPartnerPgFee(p),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PARTNER_PG_FEE_KEY });
    },
  });
};

// legacy modify → location.reload 주석 = invalidate 없음(인라인 인풋 값 유지).
export const useModifyPartnerPgFee = () =>
  useMutation({
    mutationFn: (p: PartnerPgFeeModifyRequest) => modifyPartnerPgFee(p),
  });

// legacy delete → location.reload() = 목록+후보 invalidate.
export const useDeletePartnerPgFee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (p: PartnerPgFeeDeleteRequest) => deletePartnerPgFee(p),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PARTNER_PG_FEE_KEY });
    },
  });
};

export const partnerEmailListQueryKey = (query: PartnerEmailSearch) =>
  [...PARTNER_EMAIL_KEY, query] as const;

// legacy partner/partner_email.php — 알림 주소록 목록(읽기 전용).
export const usePartnerEmailList = (query: PartnerEmailSearch) =>
  useQuery({
    queryKey: partnerEmailListQueryKey(query),
    queryFn: () => fetchPartnerEmailList(query),
  });

// legacy getNonEmailPartner() — 등록 모달 후보(이메일 미등록 파트너).
export const usePartnerEmailCandidates = () =>
  useQuery({
    queryKey: [...PARTNER_EMAIL_KEY, "candidates"] as const,
    queryFn: () => fetchPartnerEmailCandidates(),
  });

export const partnerSalesListQueryKey = (query: PartnerSalesListSearch) =>
  [...PARTNER_SALES_KEY, query] as const;

// legacy partner/sales_list.php — Sales list 조회.
export const usePartnerSalesList = (query: PartnerSalesListSearch) =>
  useQuery({
    queryKey: partnerSalesListQueryKey(query),
    queryFn: () => fetchPartnerSalesList(query),
  });

// legacy getPartnerListAll(is_system) — 검색필터 파트너 select(is_system 지정 시 필터).
export const usePartnerListAll = (isSystem?: string) =>
  useQuery({
    queryKey: [...PARTNER_KEY, "list-all", isSystem ?? ""] as const,
    queryFn: () => fetchPartnerListAll(isSystem),
  });

// legacy report_batch → 성공 후 조회 조건으로 이동 = 목록 invalidate.
export const useSyncPartnerSales = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (p: PartnerSalesSyncRequest) => syncPartnerSales(p),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PARTNER_SALES_KEY });
    },
  });
};

export const partnerRefundListQueryKey = (query: PartnerRefundListSearch) =>
  [...PARTNER_REFUND_KEY, query] as const;

// legacy partner/refund_list.php — Refund list 조회.
export const usePartnerRefundList = (query: PartnerRefundListSearch) =>
  useQuery({
    queryKey: partnerRefundListQueryKey(query),
    queryFn: () => fetchPartnerRefundList(query),
  });

// legacy refund_batch → 성공 후 조회 조건으로 이동 = 목록 invalidate.
export const useSyncPartnerRefund = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (p: PartnerRefundSyncRequest) => syncPartnerRefund(p),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PARTNER_REFUND_KEY });
    },
  });
};

export const partnerReportPreviewQueryKey = (params: PartnerReportPreviewParams) =>
  [...PARTNER_REPORT_KEY, "preview", params] as const;

// legacy partner/report_register.php — 정산 리포트 미리보기.
export const usePartnerReportPreview = (params: PartnerReportPreviewParams) =>
  useQuery({
    queryKey: partnerReportPreviewQueryKey(params),
    queryFn: () => fetchPartnerReportPreview(params),
  });

// legacy report_register → 성공 후 report_list 이동(스크린 navigate).
export const useCreatePartnerReport = () =>
  useMutation({
    mutationFn: (p: PartnerReportCreateRequest) => createPartnerReport(p),
  });

// legacy revenue_edit → location.reload() = 미리보기 invalidate.
export const useEditPartnerRevenue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (p: PartnerRevenueEditRequest) => editPartnerRevenue(p),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PARTNER_REPORT_KEY });
    },
  });
};

export const partnerReportListQueryKey = (params: PartnerReportListParams) =>
  [...PARTNER_REPORT_KEY, "list", params] as const;

// legacy partner/report_list.php — 리포트 내역 목록.
export const usePartnerReportList = (params: PartnerReportListParams) =>
  useQuery({
    queryKey: partnerReportListQueryKey(params),
    queryFn: () => fetchPartnerReportList(params),
  });

export const partnerReportViewQueryKey = (idx: string) =>
  [...PARTNER_REPORT_KEY, "view", idx] as const;

// legacy partner/report_view.php — 리포트 상세보기.
export const usePartnerReportView = (idx: string) =>
  useQuery({
    queryKey: partnerReportViewQueryKey(idx),
    queryFn: () => fetchPartnerReportView(idx),
  });
