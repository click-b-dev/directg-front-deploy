// legacy goods/genba/* — Genba API 연동.

// genba_ping.php — runGenbaPingAsync() 원시 결과(임의 형태 → 덤프 표시).
export type GenbaPingResult = Record<string, unknown>;

// genba_publisher.php — getGenbaPublisherList(): select publisher,status.
// ⚠️ legacy quirk: 뷰가 참조하는 cc(sku수)는 SELECT되지 않음 → 항상 빈칸/합계 0.
export interface GenbaPublisherItem {
  publisher: string;
  status: string; // "Y" | "N"
}

export interface GenbaPublisherListResponse {
  items: GenbaPublisherItem[];
}

// genba_ps.php mode=publisher_config — status 토글 upsert.
export interface GenbaPublisherConfigRequest {
  publisher: string;
  status: string; // "Y" | "N"
}

export interface GenbaActionResult {
  message: string;
}

// genba_title.php — Genba 타이틀 현황.
export interface GenbaTitleSearch {
  page: number;
  search_product_id: string;
  search_publisher: string;
  search_name: string;
}

export interface GenbaTitleItem {
  ProductID: string;
  Name: string;
  Publisher: string;
  ReleaseDate: string; // +9h 적용된 "YYYY-MM-DD HH:mm:ss" 표시 문자열
  EtailerSplitPercentage: string;
  is_krw: string; // base where로 항상 'N'
  batch_date: string;
}

export interface GenbaPagination {
  current_page: number;
  results_per_page: number;
  total_results: number;
  total_pages: number;
}

export interface GenbaTitleListResponse {
  items: GenbaTitleItem[];
  pagination: GenbaPagination;
}

// getGenbaTitlePublisher() — select 옵션(distinct Publisher).
export interface GenbaTitlePublisherOption {
  Publisher: string;
}

export interface GenbaTitlePublisherListResponse {
  items: GenbaTitlePublisherOption[];
}

// genba_api.php api_type=price — 개별 가격 동기화.
export interface GenbaPriceSyncRequest {
  productid: string;
}

// genba_product_sync.php — Genba 상품 관리(카탈로그 현황).
export interface GenbaProductSearch {
  page: number;
  search_product_id: string;
  search_sku: string;
  search_name: string;
  search_publisher: string;
  PreLiveState: string;
}

export interface GenbaProductItem {
  ProductID: string;
  Sku: string;
  Name: string;
  IsBundle: string;
  Publisher: string;
  RegionCode: string;
  ReleaseDate: string; // +9h 표시 문자열
  DigitalReleaseDate: string; // +9h 표시 문자열
  EndDate: string; // +9h 표시 문자열
  PreReleaseDate: string; // +9h 표시 문자열, epoch면 ""
  is_presale_available: boolean; // 서버 now 기준
  row_danger: boolean; // strtotime(EndDate)>0
  Srp: number;
  Wsp: number;
  EtailerSplitPercentage: string;
  PreLiveState: string; // "0".."4"
  StockStatus: string; // "0"이면 품절
}

export interface GenbaProductListResponse {
  items: GenbaProductItem[];
  pagination: GenbaPagination;
}

export interface GenbaSkuRequest {
  sku: string;
}

// genba_promotion_sync.php — Genba 프로모션 조회.
export interface GenbaPromotionSearch {
  page: number;
  promotion_status: string; // "Scheduled" | "Live" | "Completed"
}

export interface GenbaPromotionItem {
  PromotionId: string;
  Name: string;
  fromDate: string; // +9h 표시 문자열
  toDate: string; // +9h 표시 문자열
  cc: number; // 그룹 count → Products
}

export interface GenbaPromotionListResponse {
  items: GenbaPromotionItem[];
  pagination: GenbaPagination;
}
