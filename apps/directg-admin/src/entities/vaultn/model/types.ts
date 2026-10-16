// legacy goods/vaultn/* — Vaultn API 연동.

// vaultn_ping.php — runVaultnPingPost() 원시 결과(임의 형태 → 덤프 표시).
export type VaultnPingResult = Record<string, unknown>;

// vaultn_connection.php — runConnections() 연결 컬렉션.
export interface VaultnConnectionOwner {
  imageUrl: string;
  name: string;
  companyName: string;
  guid: string;
  country: string;
  timezone: string;
  defaultCurrencyCode: string;
}

export interface VaultnConnectionItem {
  guid: string;
  created: string;
  catalogSharingEnabled: boolean;
  connectedOwner: VaultnConnectionOwner;
}

export interface VaultnConnectionListResponse {
  items: VaultnConnectionItem[];
}

// vaultn_catalogue.php — Vaultn 카탈로그 현황.
export interface VaultnProductSearch {
  page: number;
  search_product_id: string;
  search_sku: string;
  search_name: string;
}

export interface VaultnProductItem {
  publisher: string;
  productGUID: string;
  sku: string;
  title: string;
  provider: string;
  regionCode: string;
  srp: number;
  purchasePrice: number;
  reservedUnits: number;
  networkUnits: number;
  batch_date: string;
  update_date: string;
}

export interface VaultnPagination {
  current_page: number;
  results_per_page: number;
  total_results: number;
  total_pages: number;
}

export interface VaultnProductListResponse {
  items: VaultnProductItem[];
  pagination: VaultnPagination;
}

// vaultn_connection_product.php — runConnectionProduct() 중첩 상품 목록.
export interface VaultnPromotion {
  promotionGuid?: string;
  promotionName?: string;
  startDate?: string;
  endDate?: string;
  discountedSrp?: number | string;
  discountedPurchasePrice?: number | string;
  discountType?: string;
  discount?: number | string;
  discountCurrencyCode?: string;
}
export interface VaultnSkuPrice {
  priceListGuid?: string;
  srp?: number | string;
  purchasePrice?: number | string;
  priceListVAT?: number | string;
  currencyCode?: string;
  pricePoint?: number | string;
  isActivePromotion?: boolean | number | string;
  promotionDetails?: VaultnPromotion[];
}
export interface VaultnSku {
  sku?: string;
  provider?: string;
  regionCode?: string;
  prices?: VaultnSkuPrice[];
}
export interface VaultnConnProduct {
  guid?: string;
  title?: string;
  publisher?: string;
  edition?: string;
  franchise?: string;
  productType?: string;
  skus?: VaultnSku[];
}
export interface VaultnConnectionProductResponse {
  count: number;
  payload: VaultnConnProduct[];
}
export interface VaultnSyncBatchResult {
  message: string;
}

// valutn_connection_product_view.php — runConnectionProductRetrieve(connectionGuid, productGUID).
export interface VaultnRegionSkuRef {
  keyProvider?: string;
  sku?: string;
}
export interface VaultnRegionPrice {
  countryCode?: string;
  currencyCode?: string;
  amount?: number | string;
  purchasePrice?: number | string;
}
export interface VaultnRegionCountry {
  countryCode?: string;
  countryName?: string;
}
export interface VaultnRegion {
  code?: string;
  skus?: VaultnRegionSkuRef[];
  prices?: VaultnRegionPrice[];
  agreements?: unknown;
  regionCountries?: VaultnRegionCountry[];
  salesCountries?: VaultnRegionCountry[];
}
export interface VaultnConnectionProductRetrieve {
  guid?: string;
  title?: string;
  publisher?: string;
  edition?: string;
  franchise?: string;
  productType?: string;
  regions?: VaultnRegion[];
}

// valutn_product_view.php — runProductRetrieveAll(productGUID, page). print_r 덤프 + attributes 테이블.
export interface VaultnProductRetrieveProduct {
  productCoreAttributes?: Record<string, unknown>;
  productTypeAttributes?: Record<string, unknown>;
  skus?: Record<string, unknown>;
  assets?: Record<string, unknown>;
}
export interface VaultnProductRetrieveAll {
  products?: VaultnProductRetrieveProduct[];
  [key: string]: unknown;
}

// vaultn_cert.php — ReadCertificate() (validFrom/validTo는 unix timestamp).
export interface VaultnCertificate {
  validFrom: number;
  validTo: number;
  thumbprint: string;
}

// vaultn_connection_promotion.php — runConnectionPromotion(connectionGuid).
export interface VaultnConnectionPromotionItem {
  guid?: string;
  title?: string;
  validFrom?: string;
  validTo?: string;
}
export interface VaultnConnectionPromotionListResponse {
  items: VaultnConnectionPromotionItem[];
}

// vaultn_connection_promotion_view.php — runConnectionPromotionRetrieve(connectionGuid, promotionGuid).
export interface VaultnConnectionPromotionRetrieveItem {
  sku?: string;
  discountPercentage?: number | string;
}
export interface VaultnConnectionPromotionRetrieve {
  items: VaultnConnectionPromotionRetrieveItem[];
}

// vaultn_connection_pricelist.php / vaultn_connection_price.php — print_r + exit(원시 덤프, 임의 형태).
export type VaultnConnectionPriceListResult = unknown;
export type VaultnConnectionPriceResult = unknown;

// vaultn_promotion.php — AdminGoods::getVaultnPromotionList (DB, 50/page).
export interface VaultnPromotionRow {
  title: string;
  validFrom: string;
  validTo: string;
  product_name: string;
  sku: string;
  discountPercentage: number;
  srp: number;
  purchasePrice: number;
  reg_date: string;
  update_date: string;
}
export interface VaultnPromotionListResponse {
  items: VaultnPromotionRow[];
  pagination: VaultnPagination;
}

// vaultn_stock.php — runVaultnStock(page).
export interface VaultnStockConnection {
  connectionGuid?: string;
  connectionName?: string;
  reservedUnits?: number;
  networkUnits?: number;
  totalAvailableUnits?: number;
}
export interface VaultnStockItem {
  sku?: string;
  isKeyless?: boolean | string;
  title?: string;
  ownedUnits?: number | string;
  totalAvailableUnits?: number;
  connections?: VaultnStockConnection[];
}
export interface VaultnStockResponse {
  recordCount: number;
  stockLevelInformation: VaultnStockItem[];
}

// stock/vaultn_stock.php — runVaultnStockAll()(전량) + sku_map(order_system=8) 옵션 매핑.
// 필터/정렬/페이징은 클라이언트. #139(vaultn/vaultn_stock.php)와 별개 화면.
export interface VaultnStockAllOption {
  product_code: string;
  product_name: string;
  soldout: string; // "N" | "Y"
  status: string; // "0"(판매중) 등
}
export interface VaultnStockAllItem {
  sku: string;
  title: string;
  ownedUnits: number | string;
  totalAvailableUnits: number;
  connections: VaultnStockConnection[];
  options: VaultnStockAllOption[]; // sku_map 매핑(없으면 빈 배열)
}
export interface VaultnStockAllResponse {
  recordCount: number;
  loadedCount?: number; // recordCount보다 작으면 부분 로드
  stockLevelInformation: VaultnStockAllItem[];
}
