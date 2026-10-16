import { apiClient } from "@shared/api/client";
import type {
  ZtormPingResult,
  ZtormPublisherListResponse,
  ZtormCatalogueSearch,
  ZtormCatalogueResponse,
  ZtormActionResult,
  ZtormItemRequest,
  ZtormPromotionSearch,
  ZtormPromotionResponse,
} from "../model/types";

// legacy ztorm_ping.php — Ztorm 연결 확인.
export const fetchZtormPing = () => apiClient.get<ZtormPingResult>("/admin/ztorm/ping");

// legacy ztorm_publisher_list.php — Ztorm 퍼블리셔 현황.
export const fetchZtormPublisherList = () =>
  apiClient.get<ZtormPublisherListResponse>("/admin/ztorm/publishers");

// legacy ztorm_catalogue.php — Ztorm 카탈로그 현황(50/page).
export const fetchZtormCatalogue = (query: ZtormCatalogueSearch) => {
  const searchParams: Record<string, string> = {};
  if (query.page) {
    searchParams.page = String(query.page);
  }
  return apiClient.get<ZtormCatalogueResponse>("/admin/ztorm/catalogue", { searchParams });
};

// legacy ztorm_api.php rrp_search — RRP 조회.
export const searchZtormRrp = (payload: ZtormItemRequest) =>
  apiClient.post<ZtormActionResult>("/admin/ztorm/rrp-search", payload);

// legacy ztorm_api.php product_add — Ztorm 상품 등록.
export const addZtormProduct = (payload: ZtormItemRequest) =>
  apiClient.post<ZtormActionResult>("/admin/ztorm/products", payload);

// legacy ztorm_promotion.php — Ztorm 프로모션 현황(50/page).
export const fetchZtormPromotion = (query: ZtormPromotionSearch) => {
  const searchParams: Record<string, string> = {};
  if (query.page) {
    searchParams.page = String(query.page);
  }
  return apiClient.get<ZtormPromotionResponse>("/admin/ztorm/promotions", { searchParams });
};

// legacy ztorm_api.php promotion — 캠페인 동기화.
export const syncZtormPromotion = () =>
  apiClient.post<ZtormActionResult>("/admin/ztorm/promotion-sync", {});
