import { apiClient } from "@shared/api/client";
import type {
  GenbaPingResult,
  GenbaPublisherListResponse,
  GenbaPublisherConfigRequest,
  GenbaActionResult,
  GenbaTitleSearch,
  GenbaTitleListResponse,
  GenbaTitlePublisherListResponse,
  GenbaPriceSyncRequest,
  GenbaProductSearch,
  GenbaProductListResponse,
  GenbaSkuRequest,
  GenbaPromotionSearch,
  GenbaPromotionListResponse,
} from "../model/types";

// legacy genba_ping.php — Genba 연결 확인.
export const fetchGenbaPing = () => apiClient.get<GenbaPingResult>("/admin/genba/ping");

// legacy genba_publisher.php — Genba 퍼블리셔 현황.
export const fetchGenbaPublisherList = () =>
  apiClient.get<GenbaPublisherListResponse>("/admin/genba/publishers");

// legacy genba_ps.php mode=publisher_config — 퍼블리셔 status 토글.
export const configGenbaPublisher = (payload: GenbaPublisherConfigRequest) =>
  apiClient.post<GenbaActionResult>("/admin/genba/publisher-config", payload);

// legacy genba_title.php — Genba 타이틀 현황(50/page).
export const fetchGenbaTitleList = (query: GenbaTitleSearch) => {
  const searchParams: Record<string, string> = { page: String(query.page || 1) };
  if (query.search_product_id) {
    searchParams.search_product_id = query.search_product_id;
  }
  if (query.search_publisher) {
    searchParams.search_publisher = query.search_publisher;
  }
  if (query.search_name) {
    searchParams.search_name = query.search_name;
  }
  return apiClient.get<GenbaTitleListResponse>("/admin/genba/titles", { searchParams });
};

// legacy getGenbaTitlePublisher() — Publisher select 옵션.
export const fetchGenbaTitlePublishers = () =>
  apiClient.get<GenbaTitlePublisherListResponse>("/admin/genba/title-publishers");

// legacy genba_api.php api_type=price — 개별 가격 동기화.
export const syncGenbaPrice = (payload: GenbaPriceSyncRequest) =>
  apiClient.post<GenbaActionResult>("/admin/genba/price-sync", payload);

// legacy genba_api.php api_type=product — 전체 상품 동기화.
export const syncGenbaProduct = () =>
  apiClient.post<GenbaActionResult>("/admin/genba/product-sync", {});

// legacy genba_product_sync.php — Genba 상품 관리(카탈로그 현황, 50/page).
export const fetchGenbaProductList = (query: GenbaProductSearch) => {
  const searchParams: Record<string, string> = { page: String(query.page || 1) };
  if (query.search_product_id) {
    searchParams.search_product_id = query.search_product_id;
  }
  if (query.search_sku) {
    searchParams.search_sku = query.search_sku;
  }
  if (query.search_name) {
    searchParams.search_name = query.search_name;
  }
  if (query.search_publisher) {
    searchParams.search_publisher = query.search_publisher;
  }
  if (query.PreLiveState) {
    searchParams.PreLiveState = query.PreLiveState;
  }
  return apiClient.get<GenbaProductListResponse>("/admin/genba/products", { searchParams });
};

// legacy genba_api.php api_type=product_sync — 개별 상품 동기화.
export const syncGenbaProductItem = (payload: GenbaSkuRequest) =>
  apiClient.post<GenbaActionResult>("/admin/genba/product-sync-item", payload);

// legacy genba_api.php api_type=stock — 재고 확인.
export const syncGenbaStock = (payload: GenbaSkuRequest) =>
  apiClient.post<GenbaActionResult>("/admin/genba/stock-sync", payload);

// legacy genba_api.php api_type=prelive — pre-live 요청(재조회 없음).
export const requestGenbaPreLive = (payload: GenbaSkuRequest) =>
  apiClient.post<GenbaActionResult>("/admin/genba/prelive-request", payload);

// legacy genba_promotion_sync.php — Genba 프로모션 조회(상태별 50/20).
export const fetchGenbaPromotionSchedule = (query: GenbaPromotionSearch) => {
  const searchParams: Record<string, string> = {
    page: String(query.page || 1),
    promotion_status: query.promotion_status || "Scheduled",
  };
  return apiClient.get<GenbaPromotionListResponse>("/admin/genba/promotions", { searchParams });
};

// legacy genba_api.php api_type=promotion — 프로모션 동기화.
export const syncGenbaPromotion = () =>
  apiClient.post<GenbaActionResult>("/admin/genba/promotion-sync", {});
