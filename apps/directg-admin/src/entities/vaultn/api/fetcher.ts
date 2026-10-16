import { apiClient } from "@shared/api/client";
import type {
  VaultnPingResult,
  VaultnConnectionListResponse,
  VaultnProductSearch,
  VaultnProductListResponse,
  VaultnConnectionProductResponse,
  VaultnSyncBatchResult,
  VaultnConnectionProductRetrieve,
  VaultnProductRetrieveAll,
  VaultnCertificate,
  VaultnConnectionPromotionListResponse,
  VaultnConnectionPromotionRetrieve,
  VaultnConnectionPriceListResult,
  VaultnConnectionPriceResult,
  VaultnPromotionListResponse,
  VaultnStockResponse,
  VaultnStockAllResponse,
} from "../model/types";

// legacy vaultn_ping.php — Vaultn 연결 확인.
export const fetchVaultnPing = () => apiClient.get<VaultnPingResult>("/admin/vaultn/ping");

// legacy vaultn_connection.php — Vaultn 퍼블리셔(연결) 현황.
export const fetchVaultnConnections = () =>
  apiClient.get<VaultnConnectionListResponse>("/admin/vaultn/connections");

// legacy vaultn_catalogue.php — Vaultn 카탈로그 현황(30/page).
export const fetchVaultnProductList = (query: VaultnProductSearch) => {
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
  return apiClient.get<VaultnProductListResponse>("/admin/vaultn/products", { searchParams });
};

// legacy vaultn_connection_product.php — connection별 상품 목록(20/page).
export const fetchVaultnConnectionProduct = (connectionGuid: string, page: number) =>
  apiClient.get<VaultnConnectionProductResponse>("/admin/vaultn/connection-products", {
    searchParams: { connectionGuid, page: String(page || 1) },
  });

// legacy vaultn_sync_batch.php — 페이지별 상품 동기화.
export const runVaultnSyncBatch = (connectionGuid: string, page: number) =>
  apiClient.post<VaultnSyncBatchResult>("/admin/vaultn/sync-batch", { connectionGuid, page });

// legacy valutn_connection_product_view.php — runConnectionProductRetrieve(connectionGuid, productGUID).
export const fetchVaultnConnectionProductView = (connectionGuid: string, productGUID: string) =>
  apiClient.get<VaultnConnectionProductRetrieve>("/admin/vaultn/connection-product-view", {
    searchParams: { connectionGuid, productGUID },
  });

// legacy valutn_product_view.php — runProductRetrieveAll(productGUID, page).
export const fetchVaultnProductView = (productGUID: string, page: number) =>
  apiClient.get<VaultnProductRetrieveAll>("/admin/vaultn/product-view", {
    searchParams: { productGUID, page: String(page || 1) },
  });

// legacy vaultn_cert.php — ReadCertificate().
export const fetchVaultnCertificate = () => apiClient.get<VaultnCertificate>("/admin/vaultn/cert");

// legacy vaultn_connection_promotion.php — runConnectionPromotion(connectionGuid).
export const fetchVaultnConnectionPromotions = (connectionGuid: string) =>
  apiClient.get<VaultnConnectionPromotionListResponse>("/admin/vaultn/connection-promotions", {
    searchParams: { connectionGuid },
  });

// legacy vaultn_connection_promotion_view.php — runConnectionPromotionRetrieve(connectionGuid, promotionGuid).
export const fetchVaultnConnectionPromotionView = (connectionGuid: string, promotionGuid: string) =>
  apiClient.get<VaultnConnectionPromotionRetrieve>("/admin/vaultn/connection-promotion-view", {
    searchParams: { connectionGuid, promotionGuid },
  });

// legacy vaultn_connection_pricelist.php — runConnectionPriceList(connectionGuid) (print_r 덤프).
export const fetchVaultnConnectionPriceList = (connectionGuid: string) =>
  apiClient.get<VaultnConnectionPriceListResult>("/admin/vaultn/connection-pricelist", {
    searchParams: { connectionGuid },
  });

// legacy vaultn_connection_price.php — runConnectionPriceListPriceRetrieve(connectionGuid, priceListGuid, page=1) (print_r 덤프).
export const fetchVaultnConnectionPrice = (connectionGuid: string, priceListGuid: string) =>
  apiClient.get<VaultnConnectionPriceResult>("/admin/vaultn/connection-price", {
    searchParams: { connectionGuid, priceListGuid },
  });

// legacy vaultn_promotion.php — AdminGoods::getVaultnPromotionList (DB, 50/page).
export const fetchVaultnPromotionList = (page: number) =>
  apiClient.get<VaultnPromotionListResponse>("/admin/vaultn/promotions", {
    searchParams: { page: String(page || 1) },
  });

// legacy vaultn_stock.php — runVaultnStock(page).
export const fetchVaultnStock = (page: number) =>
  apiClient.get<VaultnStockResponse>("/admin/vaultn/stock", {
    searchParams: { page: String(page || 1) },
  });

// legacy stock/vaultn_stock.php — runVaultnStockAll()(전량) + sku_map 옵션 매핑. 필터/정렬/페이징은 클라이언트.
export const fetchVaultnStockAll = () =>
  apiClient.get<VaultnStockAllResponse>("/admin/goods/stock/vaultn");
