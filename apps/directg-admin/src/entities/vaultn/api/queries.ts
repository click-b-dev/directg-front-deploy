import { useMutation, useQuery } from "@tanstack/react-query";
import {
  fetchVaultnPing,
  fetchVaultnConnections,
  fetchVaultnProductList,
  fetchVaultnConnectionProduct,
  runVaultnSyncBatch,
  fetchVaultnConnectionProductView,
  fetchVaultnProductView,
  fetchVaultnCertificate,
  fetchVaultnConnectionPromotions,
  fetchVaultnConnectionPromotionView,
  fetchVaultnConnectionPriceList,
  fetchVaultnConnectionPrice,
  fetchVaultnPromotionList,
  fetchVaultnStock,
  fetchVaultnStockAll,
} from "./fetcher";
import type { VaultnProductSearch } from "../model/types";

const VAULTN_KEY = ["admin", "vaultn"] as const;

export const vaultnPingQueryKey = () => [...VAULTN_KEY, "ping"] as const;

// legacy vaultn_ping.php — Vaultn 연결 확인.
export const useVaultnPing = () =>
  useQuery({
    queryKey: vaultnPingQueryKey(),
    queryFn: () => fetchVaultnPing(),
  });

export const vaultnConnectionsQueryKey = () => [...VAULTN_KEY, "connections"] as const;

// legacy vaultn_connection.php — Vaultn 퍼블리셔(연결) 현황.
export const useVaultnConnections = () =>
  useQuery({
    queryKey: vaultnConnectionsQueryKey(),
    queryFn: () => fetchVaultnConnections(),
  });

export const vaultnProductListQueryKey = (query: VaultnProductSearch) =>
  [...VAULTN_KEY, "products", query] as const;

// legacy vaultn_catalogue.php — Vaultn 카탈로그 현황.
export const useVaultnProductList = (query: VaultnProductSearch) =>
  useQuery({
    queryKey: vaultnProductListQueryKey(query),
    queryFn: () => fetchVaultnProductList(query),
  });

export const vaultnConnectionProductQueryKey = (connectionGuid: string, page: number) =>
  [...VAULTN_KEY, "connection-products", connectionGuid, page] as const;

// legacy vaultn_connection_product.php — connection별 상품 목록.
export const useVaultnConnectionProduct = (connectionGuid: string, page: number) =>
  useQuery({
    queryKey: vaultnConnectionProductQueryKey(connectionGuid, page),
    queryFn: () => fetchVaultnConnectionProduct(connectionGuid, page),
  });

// legacy vaultn_sync_batch.php — 페이지별 동기화(alert만, 재조회 없음).
export const useVaultnSyncBatch = () =>
  useMutation({
    mutationFn: ({ connectionGuid, page }: { connectionGuid: string; page: number }) =>
      runVaultnSyncBatch(connectionGuid, page),
  });

export const vaultnConnectionProductViewQueryKey = (connectionGuid: string, productGUID: string) =>
  [...VAULTN_KEY, "connection-product-view", connectionGuid, productGUID] as const;

// legacy valutn_connection_product_view.php — connection별 상품 상세.
export const useVaultnConnectionProductView = (connectionGuid: string, productGUID: string) =>
  useQuery({
    queryKey: vaultnConnectionProductViewQueryKey(connectionGuid, productGUID),
    queryFn: () => fetchVaultnConnectionProductView(connectionGuid, productGUID),
  });

export const vaultnProductViewQueryKey = (productGUID: string, page: number) =>
  [...VAULTN_KEY, "product-view", productGUID, page] as const;

// legacy valutn_product_view.php — 상품 상세(retrieve all).
export const useVaultnProductView = (productGUID: string, page: number) =>
  useQuery({
    queryKey: vaultnProductViewQueryKey(productGUID, page),
    queryFn: () => fetchVaultnProductView(productGUID, page),
  });

export const vaultnCertificateQueryKey = () => [...VAULTN_KEY, "cert"] as const;

// legacy vaultn_cert.php — 인증서 관리.
export const useVaultnCertificate = () =>
  useQuery({
    queryKey: vaultnCertificateQueryKey(),
    queryFn: () => fetchVaultnCertificate(),
  });

export const vaultnConnectionPromotionsQueryKey = (connectionGuid: string) =>
  [...VAULTN_KEY, "connection-promotions", connectionGuid] as const;

// legacy vaultn_connection_promotion.php — connection 프로모션 목록.
export const useVaultnConnectionPromotions = (connectionGuid: string) =>
  useQuery({
    queryKey: vaultnConnectionPromotionsQueryKey(connectionGuid),
    queryFn: () => fetchVaultnConnectionPromotions(connectionGuid),
  });

export const vaultnConnectionPromotionViewQueryKey = (
  connectionGuid: string,
  promotionGuid: string,
) => [...VAULTN_KEY, "connection-promotion-view", connectionGuid, promotionGuid] as const;

// legacy vaultn_connection_promotion_view.php — 프로모션 상세(sku/discount).
export const useVaultnConnectionPromotionView = (connectionGuid: string, promotionGuid: string) =>
  useQuery({
    queryKey: vaultnConnectionPromotionViewQueryKey(connectionGuid, promotionGuid),
    queryFn: () => fetchVaultnConnectionPromotionView(connectionGuid, promotionGuid),
  });

export const vaultnConnectionPriceListQueryKey = (connectionGuid: string) =>
  [...VAULTN_KEY, "connection-pricelist", connectionGuid] as const;

// legacy vaultn_connection_pricelist.php — 원시 덤프.
export const useVaultnConnectionPriceList = (connectionGuid: string) =>
  useQuery({
    queryKey: vaultnConnectionPriceListQueryKey(connectionGuid),
    queryFn: () => fetchVaultnConnectionPriceList(connectionGuid),
  });

export const vaultnConnectionPriceQueryKey = (connectionGuid: string, priceListGuid: string) =>
  [...VAULTN_KEY, "connection-price", connectionGuid, priceListGuid] as const;

// legacy vaultn_connection_price.php — 원시 덤프.
export const useVaultnConnectionPrice = (connectionGuid: string, priceListGuid: string) =>
  useQuery({
    queryKey: vaultnConnectionPriceQueryKey(connectionGuid, priceListGuid),
    queryFn: () => fetchVaultnConnectionPrice(connectionGuid, priceListGuid),
  });

export const vaultnPromotionListQueryKey = (page: number) =>
  [...VAULTN_KEY, "promotions", page] as const;

// legacy vaultn_promotion.php — DB 프로모션 현황(50/page).
export const useVaultnPromotionList = (page: number) =>
  useQuery({
    queryKey: vaultnPromotionListQueryKey(page),
    queryFn: () => fetchVaultnPromotionList(page),
  });

export const vaultnStockQueryKey = (page: number) => [...VAULTN_KEY, "stock", page] as const;

// legacy vaultn_stock.php — 재고확인.
export const useVaultnStock = (page: number) =>
  useQuery({
    queryKey: vaultnStockQueryKey(page),
    queryFn: () => fetchVaultnStock(page),
  });

export const vaultnStockAllQueryKey = [...VAULTN_KEY, "stock-all"] as const;

// legacy stock/vaultn_stock.php — 전량 로드(클라이언트 필터/정렬/페이징).
export const useVaultnStockAll = () =>
  useQuery({
    queryKey: vaultnStockAllQueryKey,
    queryFn: fetchVaultnStockAll,
  });
