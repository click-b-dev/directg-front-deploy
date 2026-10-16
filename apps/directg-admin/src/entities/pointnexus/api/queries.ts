import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchPointNexusPing,
  fetchPointNexusProductTypes,
  fetchPointNexusPartners,
  fetchPointNexusPromos,
  fetchPointNexusProducts,
  fetchPointNexusCapsule,
  fetchPointNexusActivityLogs,
  fetchPointNexusOperation,
  fetchPointNexusCatalogue,
  deletePointNexusCatalogue,
  fetchPointNexusCatalogueSyncStats,
  fetchPointNexusBookConfirm,
  runPointNexusBookAction,
  fetchPointNexusVcntCancelStats,
  fetchPointNexusCancelVerifyStats,
  fetchPointNexusProductRetrieve,
  fetchPointNexusPromoRetrieve,
  fetchPointNexusPartnerRetrieve,
  fetchPointNexusActivityLogRetrieve,
  fetchPointNexusCatalogueMap,
  runPointNexusCatalogueMapAction,
} from "./fetcher";
import type { PnMode, PnCatalogueSearch, PnBookConfirmSearch } from "../model/types";

const POINTNEXUS_KEY = ["admin", "pointnexus"] as const;

export const pointNexusPingQueryKey = (mode: PnMode) => [...POINTNEXUS_KEY, "ping", mode] as const;

// legacy pointnexus_ping.php — PointNexus 인증 상태.
export const usePointNexusPing = (mode: PnMode) =>
  useQuery({
    queryKey: pointNexusPingQueryKey(mode),
    queryFn: () => fetchPointNexusPing(mode),
  });

export const pointNexusProductTypesQueryKey = (mode: PnMode) =>
  [...POINTNEXUS_KEY, "product-types", mode] as const;

// legacy pointnexus_product_type.php — 상품 타입 목록.
export const usePointNexusProductTypes = (mode: PnMode) =>
  useQuery({
    queryKey: pointNexusProductTypesQueryKey(mode),
    queryFn: () => fetchPointNexusProductTypes(mode),
  });

export const pointNexusPartnersQueryKey = (mode: PnMode, persona: string) =>
  [...POINTNEXUS_KEY, "partners", mode, persona] as const;

// legacy pointnexus_partner.php — 파트너 목록.
export const usePointNexusPartners = (mode: PnMode, persona: string) =>
  useQuery({
    queryKey: pointNexusPartnersQueryKey(mode, persona),
    queryFn: () => fetchPointNexusPartners(mode, persona),
  });

export const pointNexusPromosQueryKey = (mode: PnMode) =>
  [...POINTNEXUS_KEY, "promos", mode] as const;

// legacy pointnexus_promo.php — 프로모션 캠페인 목록.
export const usePointNexusPromos = (mode: PnMode) =>
  useQuery({
    queryKey: pointNexusPromosQueryKey(mode),
    queryFn: () => fetchPointNexusPromos(mode),
  });

export const pointNexusProductsQueryKey = (
  mode: PnMode,
  page: number,
  limit: number,
  filters: string,
) => [...POINTNEXUS_KEY, "products-sale", mode, page, limit, filters] as const;

// legacy pointnexus_product.php — 판매 가능 상품 목록.
export const usePointNexusProducts = (mode: PnMode, page: number, limit: number, filters: string) =>
  useQuery({
    queryKey: pointNexusProductsQueryKey(mode, page, limit, filters),
    queryFn: () => fetchPointNexusProducts(mode, page, limit, filters),
  });

export const pointNexusCapsuleQueryKey = (mode: PnMode, id: string) =>
  [...POINTNEXUS_KEY, "capsule", mode, id] as const;

// legacy pointnexus_capsule.php — 캡슐 단건 조회. id 없으면 호출 안 함(legacy는 안내만).
export const usePointNexusCapsule = (mode: PnMode, id: string) =>
  useQuery({
    queryKey: pointNexusCapsuleQueryKey(mode, id),
    queryFn: () => fetchPointNexusCapsule(mode, id),
    enabled: !!id,
  });

export const pointNexusActivityLogsQueryKey = (
  mode: PnMode,
  offset: number,
  limit: number,
  sort: string,
  sortDirection: string,
  filters: string,
) =>
  [...POINTNEXUS_KEY, "activity-logs", mode, offset, limit, sort, sortDirection, filters] as const;

// legacy pointnexus_activity_log.php — 활동 로그 목록.
export const usePointNexusActivityLogs = (
  mode: PnMode,
  offset: number,
  limit: number,
  sort: string,
  sortDirection: string,
  filters: string,
) =>
  useQuery({
    queryKey: pointNexusActivityLogsQueryKey(mode, offset, limit, sort, sortDirection, filters),
    queryFn: () => fetchPointNexusActivityLogs(mode, offset, limit, sort, sortDirection, filters),
  });

export const pointNexusOperationQueryKey = (mode: PnMode, id: string) =>
  [...POINTNEXUS_KEY, "operation", mode, id] as const;

// legacy pointnexus_operation.php — 오퍼레이션 단건 조회. id 없으면 호출 안 함.
export const usePointNexusOperation = (mode: PnMode, id: string) =>
  useQuery({
    queryKey: pointNexusOperationQueryKey(mode, id),
    queryFn: () => fetchPointNexusOperation(mode, id),
    enabled: !!id,
  });

export const pointNexusCatalogueQueryKey = (query: PnCatalogueSearch) =>
  [...POINTNEXUS_KEY, "catalogue", query] as const;

// legacy pointnexus_catalogue.php — DB 카탈로그 조회.
export const usePointNexusCatalogue = (query: PnCatalogueSearch) =>
  useQuery({
    queryKey: pointNexusCatalogueQueryKey(query),
    queryFn: () => fetchPointNexusCatalogue(query),
  });

// legacy pointnexus_catalogue.php action=delete — 삭제(성공 후 재조회).
export const useDeletePointNexusCatalogue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePointNexusCatalogue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...POINTNEXUS_KEY, "catalogue"] });
    },
  });
};

export const pointNexusCatalogueSyncStatsQueryKey = (mode: PnMode) =>
  [...POINTNEXUS_KEY, "catalogue-sync-stats", mode] as const;

// legacy pointnexus_catalogue_sync.php — 동기화 통계.
export const usePointNexusCatalogueSyncStats = (mode: PnMode) =>
  useQuery({
    queryKey: pointNexusCatalogueSyncStatsQueryKey(mode),
    queryFn: () => fetchPointNexusCatalogueSyncStats(mode),
  });

export const pointNexusBookConfirmQueryKey = (query: PnBookConfirmSearch) =>
  [...POINTNEXUS_KEY, "book-confirm", query] as const;

// legacy pointnexus_book_confirm.php — booked 상태 목록.
export const usePointNexusBookConfirm = (query: PnBookConfirmSearch) =>
  useQuery({
    queryKey: pointNexusBookConfirmQueryKey(query),
    queryFn: () => fetchPointNexusBookConfirm(query),
  });

// legacy pointnexus_book_confirm_ps.php — confirm/cancel(성공 후 재조회).
export const usePointNexusBookAction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: runPointNexusBookAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...POINTNEXUS_KEY, "book-confirm"] });
    },
  });
};

export const pointNexusVcntCancelStatsQueryKey = (mode: PnMode) =>
  [...POINTNEXUS_KEY, "vcnt-cancel-stats", mode] as const;

// legacy pointnexus_vcnt_cancel.php — 취소 대상 통계.
export const usePointNexusVcntCancelStats = (mode: PnMode) =>
  useQuery({
    queryKey: pointNexusVcntCancelStatsQueryKey(mode),
    queryFn: () => fetchPointNexusVcntCancelStats(mode),
  });

export const pointNexusCancelVerifyStatsQueryKey = (mode: PnMode) =>
  [...POINTNEXUS_KEY, "cancel-verify-stats", mode] as const;

// legacy pointnexus_cancel_verify.php — 검증 대기 통계.
export const usePointNexusCancelVerifyStats = (mode: PnMode) =>
  useQuery({
    queryKey: pointNexusCancelVerifyStatsQueryKey(mode),
    queryFn: () => fetchPointNexusCancelVerifyStats(mode),
  });

export const pointNexusProductRetrieveQueryKey = (mode: PnMode, id: string) =>
  [...POINTNEXUS_KEY, "product-retrieve", mode, id] as const;

// legacy pointnexus_product_view.php — 상품 상세. id 없으면 호출 안 함.
export const usePointNexusProductRetrieve = (mode: PnMode, id: string) =>
  useQuery({
    queryKey: pointNexusProductRetrieveQueryKey(mode, id),
    queryFn: () => fetchPointNexusProductRetrieve(mode, id),
    enabled: !!id,
  });

export const pointNexusPromoRetrieveQueryKey = (mode: PnMode, id: string) =>
  [...POINTNEXUS_KEY, "promo-retrieve", mode, id] as const;

// legacy pointnexus_promo_view.php — 프로모션 캠페인 상세. id 없으면 호출 안 함.
export const usePointNexusPromoRetrieve = (mode: PnMode, id: string) =>
  useQuery({
    queryKey: pointNexusPromoRetrieveQueryKey(mode, id),
    queryFn: () => fetchPointNexusPromoRetrieve(mode, id),
    enabled: !!id,
  });

export const pointNexusPartnerRetrieveQueryKey = (mode: PnMode, partnerID: string) =>
  [...POINTNEXUS_KEY, "partner-retrieve", mode, partnerID] as const;

// legacy pointnexus_partner_view.php — 파트너 상세. partnerID 없으면 호출 안 함.
export const usePointNexusPartnerRetrieve = (mode: PnMode, partnerID: string) =>
  useQuery({
    queryKey: pointNexusPartnerRetrieveQueryKey(mode, partnerID),
    queryFn: () => fetchPointNexusPartnerRetrieve(mode, partnerID),
    enabled: !!partnerID,
  });

export const pointNexusActivityLogRetrieveQueryKey = (mode: PnMode, id: string) =>
  [...POINTNEXUS_KEY, "activity-log-retrieve", mode, id] as const;

// legacy pointnexus_activity_log_view.php — 활동 로그 상세. id 없으면 호출 안 함.
export const usePointNexusActivityLogRetrieve = (mode: PnMode, id: string) =>
  useQuery({
    queryKey: pointNexusActivityLogRetrieveQueryKey(mode, id),
    queryFn: () => fetchPointNexusActivityLogRetrieve(mode, id),
    enabled: !!id,
  });

export const pointNexusCatalogueMapQueryKey = (mode: PnMode, productID: string) =>
  [...POINTNEXUS_KEY, "catalogue-map", mode, productID] as const;

// legacy pointnexus_catalogue_map.php — 매핑 관리 정보.
export const usePointNexusCatalogueMap = (mode: PnMode, productID: string) =>
  useQuery({
    queryKey: pointNexusCatalogueMapQueryKey(mode, productID),
    queryFn: () => fetchPointNexusCatalogueMap(mode, productID),
    enabled: !!productID,
  });

// legacy _ps.php map/unmap — 매핑 등록/해제(성공 후 재조회).
export const usePointNexusCatalogueMapAction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: runPointNexusCatalogueMapAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...POINTNEXUS_KEY, "catalogue-map"] });
    },
  });
};
