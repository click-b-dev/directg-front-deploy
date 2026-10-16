import { apiClient } from "@shared/api/client";
import type {
  PnMode,
  PnTestResponse,
  PnProductTypeResponse,
  PnPartnerResponse,
  PnPromoResponse,
  PnProductResponse,
  PnCapsuleResponse,
  PnActivityLogResponse,
  PnOperationResponse,
  PnCatalogueSearch,
  PnCatalogueResponse,
  PnCatalogueDeleteRequest,
  PnCatalogueDeleteResult,
  PnCatalogueSyncStats,
  PnCatalogueSyncBatchRequest,
  PnCatalogueSyncBatchResult,
  PnBookConfirmSearch,
  PnBookConfirmResponse,
  PnBookActionRequest,
  PnBookActionResult,
  PnVcntCancelStats,
  PnVcntCancelBatchResult,
  PnCancelVerifyStats,
  PnCancelVerifyBatchResult,
  PnProductRetrieveResponse,
  PnPromoRetrieveResponse,
  PnPartnerRetrieveResponse,
  PnActivityLogRetrieveResponse,
  PnCatalogueMapInfo,
  PnCatalogueMapSearchResponse,
  PnCatalogueMapActionRequest,
  PnCatalogueMapActionResult,
} from "../model/types";

// legacy pointnexus_ping.php — PointNexus 인증 상태(runTest).
export const fetchPointNexusPing = (mode: PnMode) =>
  apiClient.get<PnTestResponse>("/admin/pointnexus/ping", { searchParams: { mode } });

// legacy pointnexus_product_type.php — 상품 타입 목록(runProductType).
export const fetchPointNexusProductTypes = (mode: PnMode) =>
  apiClient.get<PnProductTypeResponse>("/admin/pointnexus/product-types", {
    searchParams: { mode },
  });

// legacy pointnexus_partner.php — 파트너 목록(runPartner).
export const fetchPointNexusPartners = (mode: PnMode, persona: string) => {
  const searchParams: Record<string, string> = { mode };
  if (persona) {
    searchParams.persona = persona;
  }
  return apiClient.get<PnPartnerResponse>("/admin/pointnexus/partners", { searchParams });
};

// legacy pointnexus_promo.php — 프로모션 캠페인 목록(runPromo).
export const fetchPointNexusPromos = (mode: PnMode) =>
  apiClient.get<PnPromoResponse>("/admin/pointnexus/promos", { searchParams: { mode } });

// legacy pointnexus_product.php — 판매 가능 상품 목록(runProduct).
export const fetchPointNexusProducts = (
  mode: PnMode,
  page: number,
  limit: number,
  filters: string,
) => {
  const searchParams: Record<string, string> = {
    mode,
    page: String(page),
    limit: String(limit),
  };
  if (filters) {
    searchParams.filters = filters;
  }
  return apiClient.get<PnProductResponse>("/admin/pointnexus/products-sale", { searchParams });
};

// legacy pointnexus_capsule.php — 캡슐 단건 조회(runCapsule).
export const fetchPointNexusCapsule = (mode: PnMode, id: string) =>
  apiClient.get<PnCapsuleResponse>("/admin/pointnexus/capsule", {
    searchParams: { mode, id },
  });

// legacy pointnexus_activity_log.php — 활동 로그 목록(runActivityLog).
export const fetchPointNexusActivityLogs = (
  mode: PnMode,
  offset: number,
  limit: number,
  sort: string,
  sortDirection: string,
  filters: string,
) => {
  const searchParams: Record<string, string> = {
    mode,
    offset: String(offset),
    limit: String(limit),
    sort,
    sortDirection,
  };
  if (filters) {
    searchParams.filters = filters;
  }
  return apiClient.get<PnActivityLogResponse>("/admin/pointnexus/activity-logs", {
    searchParams,
  });
};

// legacy pointnexus_operation.php — 오퍼레이션 단건 조회(runOperation).
export const fetchPointNexusOperation = (mode: PnMode, id: string) =>
  apiClient.get<PnOperationResponse>("/admin/pointnexus/operation", {
    searchParams: { mode, id },
  });

// legacy pointnexus_catalogue.php — DB 카탈로그 조회.
export const fetchPointNexusCatalogue = (query: PnCatalogueSearch) => {
  const searchParams: Record<string, string> = {
    mode: query.mode,
    page: String(query.page),
    limit: String(query.limit),
  };
  if (query.keyword) {
    searchParams.keyword = query.keyword;
  }
  if (query.publisher) {
    searchParams.publisher = query.publisher;
  }
  if (query.platform) {
    searchParams.platform = query.platform;
  }
  if (query.preorder) {
    searchParams.preorder = query.preorder;
  }
  if (query.mapping) {
    searchParams.mapping = query.mapping;
  }
  if (query.stale) {
    searchParams.stale = query.stale;
  }
  return apiClient.get<PnCatalogueResponse>("/admin/pointnexus/catalogue", { searchParams });
};

// legacy pointnexus_catalogue.php action=delete — 카탈로그 삭제(매핑 시 차단).
export const deletePointNexusCatalogue = (payload: PnCatalogueDeleteRequest) =>
  apiClient.post<PnCatalogueDeleteResult>("/admin/pointnexus/catalogue/delete", payload);

// legacy pointnexus_catalogue_sync.php — 동기화 통계.
export const fetchPointNexusCatalogueSyncStats = (mode: PnMode) =>
  apiClient.get<PnCatalogueSyncStats>("/admin/pointnexus/catalogue-sync-stats", {
    searchParams: { mode },
  });

// legacy pointnexus_catalogue_sync_batch.php — 동기화 배치 1회.
export const runPointNexusCatalogueSyncBatch = (payload: PnCatalogueSyncBatchRequest) =>
  apiClient.post<PnCatalogueSyncBatchResult>("/admin/pointnexus/catalogue-sync-batch", payload);

// legacy pointnexus_book_confirm.php — booked 상태 목록.
export const fetchPointNexusBookConfirm = (query: PnBookConfirmSearch) => {
  const searchParams: Record<string, string> = { page: String(query.page) };
  if (query.mode) {
    searchParams.mode = query.mode;
  }
  if (query.ordno) {
    searchParams.ordno = query.ordno;
  }
  if (query.m_id) {
    searchParams.m_id = query.m_id;
  }
  return apiClient.get<PnBookConfirmResponse>("/admin/pointnexus/book-confirm", { searchParams });
};

// legacy pointnexus_book_confirm_ps.php — confirm/cancel 처리.
export const runPointNexusBookAction = (payload: PnBookActionRequest) =>
  apiClient.post<PnBookActionResult>("/admin/pointnexus/book-confirm/action", payload);

// legacy pointnexus_vcnt_cancel.php — 취소 대상 통계.
export const fetchPointNexusVcntCancelStats = (mode: PnMode) =>
  apiClient.get<PnVcntCancelStats>("/admin/pointnexus/vcnt-cancel-stats", {
    searchParams: { mode },
  });

// legacy pointnexus_vcnt_cancel_batch.php — 취소 대상 조회(dry_run).
export const previewPointNexusVcntCancel = (mode: PnMode) =>
  apiClient.post<PnVcntCancelBatchResult>("/admin/pointnexus/vcnt-cancel-batch", {
    mode,
    dry_run: 1,
    limit: 1000,
  });

// legacy pointnexus_cancel_verify.php — 검증 대기 통계.
export const fetchPointNexusCancelVerifyStats = (mode: PnMode) =>
  apiClient.get<PnCancelVerifyStats>("/admin/pointnexus/cancel-verify-stats", {
    searchParams: { mode },
  });

// legacy pointnexus_cancel_verify_batch.php — 대기 조회(dry_run) / 검증 실행 배치.
export const runPointNexusCancelVerifyBatch = (mode: PnMode, dryRun: boolean) =>
  apiClient.post<PnCancelVerifyBatchResult>("/admin/pointnexus/cancel-verify-batch", {
    mode,
    dry_run: dryRun ? 1 : 0,
    limit: dryRun ? 1000 : 50,
  });

// legacy pointnexus_product_view.php — 상품 상세(runProductRetrieve).
export const fetchPointNexusProductRetrieve = (mode: PnMode, id: string) =>
  apiClient.get<PnProductRetrieveResponse>("/admin/pointnexus/product-retrieve", {
    searchParams: { mode, id },
  });

// legacy pointnexus_promo_view.php — 프로모션 캠페인 상세(runPromoRetrieve).
export const fetchPointNexusPromoRetrieve = (mode: PnMode, id: string) =>
  apiClient.get<PnPromoRetrieveResponse>("/admin/pointnexus/promo-retrieve", {
    searchParams: { mode, id },
  });

// legacy pointnexus_partner_view.php — 파트너 상세(runPartnerRetrieve).
export const fetchPointNexusPartnerRetrieve = (mode: PnMode, partnerID: string) =>
  apiClient.get<PnPartnerRetrieveResponse>("/admin/pointnexus/partner-retrieve", {
    searchParams: { mode, partnerID },
  });

// legacy pointnexus_activity_log_view.php — 활동 로그 상세(runActivityLogRetrieve).
export const fetchPointNexusActivityLogRetrieve = (mode: PnMode, id: string) =>
  apiClient.get<PnActivityLogRetrieveResponse>("/admin/pointnexus/activity-log-retrieve", {
    searchParams: { mode, id },
  });

// legacy pointnexus_catalogue_map.php — 매핑 관리 정보(상품+매핑목록).
export const fetchPointNexusCatalogueMap = (mode: PnMode, productID: string) =>
  apiClient.get<PnCatalogueMapInfo>("/admin/pointnexus/catalogue-map", {
    searchParams: { mode, productID },
  });

// legacy _ps.php action=search — 자사 상품 검색.
export const searchPointNexusCatalogueMapItems = (
  mode: PnMode,
  productID: string,
  keyword: string,
) =>
  apiClient.post<PnCatalogueMapSearchResponse>("/admin/pointnexus/catalogue-map/search", {
    mode,
    productID,
    keyword,
  });

// legacy _ps.php action=map/unmap — 매핑 등록/해제.
export const runPointNexusCatalogueMapAction = (payload: PnCatalogueMapActionRequest) =>
  apiClient.post<PnCatalogueMapActionResult>("/admin/pointnexus/catalogue-map/action", payload);
