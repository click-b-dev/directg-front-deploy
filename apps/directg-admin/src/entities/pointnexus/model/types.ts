// legacy goods/pointnexus/* — PointNexus API 연동. 공통 타입/헬퍼.

// _inc.php pn_normalize_mode — 'prod' | 'test' (그 외 → 'prod').
export type PnMode = "prod" | "test";

// pointnexus_ping.php runTest() 결과의 data 원소.
export interface PnTestProvider {
  name?: string;
  persona?: string;
  id?: string;
}

export interface PnTestCredentials {
  name?: string;
  clientID?: string;
}

export interface PnTestData {
  isSandbox?: boolean;
  authenticatedProvider?: PnTestProvider;
  credentials?: PnTestCredentials;
}

// PointNexus API 공통 응답 골격.
export interface PnResponse<T> {
  success?: boolean;
  data?: T | T[];
  count?: number;
  errors?: { message?: string }[];
}

export type PnTestResponse = PnResponse<PnTestData>;

// pointnexus_product_type.php runProductType() — 가변 스키마 객체 배열.
export type PnDynamicRow = Record<string, unknown>;
export type PnProductTypeResponse = PnResponse<PnDynamicRow>;

// pointnexus_partner.php runPartner() — 파트너 목록.
export interface PnPartner {
  id?: string;
  name?: string;
  persona?: string;
  useAPI?: boolean;
  contracts?: unknown[];
}
export type PnPartnerResponse = PnResponse<PnPartner>;

// pointnexus_promo.php runPromo() — 프로모션 캠페인 목록.
export interface PnCampaign {
  id?: string;
  name?: string;
  state?: string;
  issuer?: { name?: string };
  productIDs?: unknown[];
  startDate?: string;
  endDate?: string;
}
export type PnPromoResponse = PnResponse<PnCampaign>;

// pointnexus_product.php runProduct() — 판매 가능 상품 목록.
export interface PnPrice {
  currency?: string;
  promo?: boolean | string; // 상세에서 프로모션명 문자열일 수 있음
  initialFormatted?: string;
  priceFormatted?: string;
  allowedCountries?: string[];
}
export interface PnProduct {
  id?: string;
  genericName?: string;
  platform?: string;
  publisher?: string;
  type?: string;
  isPreOrder?: boolean;
  genres?: string[];
  prices?: PnPrice[];
  allowedCurrencies?: string[];
  allowedCountries?: unknown[];
  releaseDate?: string;
}
export type PnProductResponse = PnResponse<PnProduct>;

// pointnexus_capsule.php runCapsule() — 캡슐 단건(가변 + known 필드).
export type PnCapsule = Record<string, unknown>;
export type PnCapsuleResponse = PnResponse<PnCapsule>;

// pointnexus_activity_log.php runActivityLog() — 활동 로그 목록.
export interface PnActivityLog {
  id?: string;
  type?: string;
  createdAt?: string;
  operationID?: string;
  product?: { id?: string; genericName?: string };
}
export type PnActivityLogResponse = PnResponse<PnActivityLog>;

// pointnexus_operation.php runOperation() — 오퍼레이션 단건 상세.
export interface PnOperationDetails {
  sellPrice?: number | string;
  sellCurrencyCode?: string;
  VAT?: number | string;
  convertedCurrencyCode?: string;
  sellPriceConverted?: number | string;
  conversionRate?: number | string;
  SRPBeforePromo?: number | string;
  SRP?: number | string;
  promoName?: string;
  promoDiscountPct?: number | string;
  revSharePct?: number | string;
  publisherShareAmount?: number | string;
  publisherCurrencyCode?: string;
  sellerShareAmount?: number | string;
  sellerCurrencyCode?: string;
}
export interface PnOperation {
  state?: string;
  type?: string;
  qtyToProcess?: number | string | null;
  qtyProcessed?: number | string | null;
  qtyInError?: number | string | null;
  createdAt?: string;
  lastUpdatedAt?: string;
  buildID?: string;
  productVariant?: { countryCodes?: string };
  capsule?: { id?: string; item?: { key?: string; platform?: string } };
  details?: PnOperationDetails;
}
export type PnOperationResponse = PnResponse<PnOperation>;

// pointnexus_catalogue.php — DB(pointnexus_catalogue) 직접 조회 + 매핑 집계.
export interface PnCatalogueSearch {
  mode: PnMode;
  keyword: string;
  publisher: string;
  platform: string;
  preorder: string; // '' | 'Y' | 'N'
  mapping: string; // '' | 'Y' | 'N'
  stale: string; // '' | 'Y' | 'N'
  page: number;
  limit: number;
}
export interface PnCatalogueItem {
  productID: string;
  genericName?: string;
  edition?: string;
  platform?: string;
  publisher?: string;
  type?: string;
  isPreOrder?: boolean | number;
  releaseDate?: string;
  prices?: PnPrice[];
  lastUpdatedAt?: string;
  update_date?: string;
  mappedCodes?: string[];
  mappedNames?: string[];
  isDiscontinued?: boolean;
}
export interface PnCatalogueResponse {
  items: PnCatalogueItem[];
  total: number;
  publisher_list: string[];
  platform_list: string[];
}
export interface PnCatalogueDeleteRequest {
  productID: string;
  mode: PnMode;
}
export interface PnCatalogueDeleteResult {
  success: boolean;
  message: string;
  flash_type: string; // "success" | "warning"
}

// pointnexus_catalogue_sync.php — 카탈로그 동기화(배치 반복).
export interface PnCatalogueSyncStats {
  db_count_total: number;
  db_count_mode: number;
  last_batch_at: string | null;
}
export interface PnCatalogueSyncBatchRequest {
  mode: PnMode;
  offset: number;
  limit: number;
}
export interface PnCatalogueSyncBatchItem {
  id: string;
  name: string;
  error?: string;
}
export interface PnCatalogueSyncBatchResult {
  success: boolean;
  mode: string;
  offset: number;
  limit: number;
  count: number;
  has_more: boolean;
  synced_ok: number;
  synced_fail: number;
  items: PnCatalogueSyncBatchItem[];
  error: string | null;
}

// pointnexus_book_confirm.php — booked 상태 수동 confirm/cancel.
export interface PnBookConfirmSearch {
  mode: string; // '' | 'test' | 'prod'
  ordno: string;
  m_id: string;
  page: number;
}
export interface PnBookRow {
  idx: number;
  m_no?: number;
  m_id?: string;
  ordno?: string;
  productID?: string;
  operationID?: string;
  license_platform?: string;
  currency?: string;
  countryCode?: string;
  price?: number | string;
  vat?: number | string;
  clientRequestID?: string;
  status?: string;
  mode?: string;
  reg_date?: string;
  update_date?: string;
  settle_no?: string;
}
export interface PnBookConfirmResponse {
  items: PnBookRow[];
  total: number;
}
export interface PnBookActionRequest {
  action: string; // 'confirm' | 'cancel'
  idx: number;
}
export interface PnBookActionResult {
  success: boolean;
  message: string;
  flash_type: string;
}

// pointnexus_vcnt_cancel.php — VCNT 미입금 만료 취소 대상 조회(dry_run).
export interface PnVcntCancelStats {
  target_cnt: number;
  now: string;
}
export interface PnVcntCancelItem {
  ordno?: string;
  settle_no?: string;
  reg_date?: string;
  m_id?: string;
  name?: string;
  total_price?: number | string;
  va_date?: string;
  productID?: string;
  operationID?: string;
  status?: string;
  action?: string;
  result?: string;
  message?: string;
}
export interface PnVcntCancelBatchResult {
  success: boolean;
  mode?: string;
  limit?: number;
  dry_run?: number;
  count: number;
  has_more: boolean;
  canceled_ok?: number;
  canceled_fail?: number;
  items: PnVcntCancelItem[];
  error: string | null;
}

// pointnexus_cancel_verify.php — cancel_pending 검증(dry_run 조회 + 배치 실행).
export interface PnCancelVerifyStats {
  target_cnt: number;
  now: string;
}
export interface PnCancelVerifyItem {
  idx?: number;
  ordno?: string;
  settle_no?: string;
  productID?: string;
  name?: string;
  operationID?: string;
  state?: string;
  result?: string; // 'preview' | 'ok' | 'fail' | 'pending'
  message?: string;
}
export interface PnCancelVerifyBatchResult {
  success: boolean;
  mode?: string;
  limit?: number;
  dry_run?: number;
  count: number;
  has_more: boolean;
  resolved_ok?: number;
  resolved_fail?: number;
  still_pending?: number;
  items: PnCancelVerifyItem[];
  error: string | null;
}

// pointnexus_product_view.php runProductRetrieve() — 상품 상세.
export interface PnProductDetail {
  id?: string;
  genericName?: string;
  platform?: string;
  publisher?: string;
  type?: string;
  edition?: string;
  copyright?: string;
  isPreOrder?: boolean;
  genres?: string[];
  prices?: PnPrice[];
  allowedCurrencies?: string[];
  allowedCountries?: string[];
  releaseDate?: string;
  lastUpdatedAt?: string;
  platformSKU?: string;
  publisherSKU?: string;
  steamAppID?: string;
  shortDescription?: unknown;
  longDescription?: unknown;
}
export type PnProductRetrieveResponse = PnResponse<PnProductDetail>;

// pointnexus_promo_view.php runPromoRetrieve() — 프로모션 캠페인 상세.
export interface PnCampaignPrice {
  currency?: { name?: string };
  initialPrice?: { formatted?: string };
  discountedPrice?: { formatted?: string };
  discount?: { percent?: number };
}
export interface PnCampaignProduct {
  id?: string;
  name?: string;
  defaultDiscountPercent?: number;
  prices?: PnCampaignPrice[];
}
export interface PnCampaignDetail {
  id?: string;
  name?: string;
  state?: string;
  issuer?: { name?: string; id?: string };
  startDate?: string;
  endDate?: string;
  productIDs?: string[];
  products?: PnCampaignProduct[];
}
export type PnPromoRetrieveResponse = PnResponse<PnCampaignDetail>;

// pointnexus_partner_view.php runPartnerRetrieve() — 파트너 상세.
export interface PnPartnerDetail {
  id?: string;
  name?: string;
  persona?: string;
  useAPI?: boolean;
  contracts?: Record<string, unknown>[];
}
export type PnPartnerRetrieveResponse = PnResponse<PnPartnerDetail>;

// pointnexus_activity_log_view.php runActivityLogRetrieve() — 활동 로그 상세(가변 + known 필드).
export type PnActivityLogDetail = Record<string, unknown>;
export type PnActivityLogRetrieveResponse = PnResponse<PnActivityLogDetail>;

// pointnexus_catalogue_map.php — 카탈로그 매핑 관리(DB).
export interface PnCatalogueMapProduct {
  productID?: string;
  genericName?: string;
  edition?: string;
  platform?: string;
  publisher?: string;
  type?: string;
  isPreOrder?: boolean | number;
  releaseDate?: string;
  mode?: string;
  update_date?: string;
}
export interface PnCatalogueMappedItem {
  product_code?: string;
  product_name?: string;
  product_platform_label?: string;
}
export interface PnCatalogueMapInfo {
  pn_info: PnCatalogueMapProduct | null;
  is_discontinued: boolean;
  max_update: string | null;
  mapped_list: PnCatalogueMappedItem[];
}
export interface PnCatalogueMapSearchItem {
  product_code: string;
  product_name?: string;
  product_platform_label?: string;
  option_type?: string;
  status?: string;
  already?: boolean;
}
export interface PnCatalogueMapSearchResponse {
  items: PnCatalogueMapSearchItem[];
}
export interface PnCatalogueMapActionRequest {
  action: string; // 'map' | 'unmap'
  product_code: string;
  productID: string;
  mode: string;
}
export interface PnCatalogueMapActionResult {
  success: boolean;
  message: string;
  flash_type: string;
}
