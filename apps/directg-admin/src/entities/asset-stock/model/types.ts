// legacy goods/stock/asset_stock.php — Asset 재고현황(docs/migration/admin/stock/asset-stock.md).

export type AssetStockSearch = {
  page: number;
  asset_id: string;
  asset_name: string;
  publisherCd: string;
  assetTypeCd: string;
  productTypeCd: string;
  platformCd: string;
};

// tbl_asset 행(동기화된 미러 데이터).
export type AssetStockItem = {
  asset_id: string;
  asset_name: string;
  productType: string; // Asset 유형
  assetType: string; // Asset 형식
  platform: string; // Asset 플랫폼
  publisher: string; // Asset 공급처
  stock: number;
  update_dt: string;
};

// tbl_asset_code (code_id/name) — 필터 드롭다운 옵션.
export type AssetCodeOption = {
  code_id: string;
  name: string;
};

export type AssetStockListResponse = {
  items: AssetStockItem[];
  pagination: { total_results: number; total_pages: number };
  codes: {
    publisher: AssetCodeOption[]; // getAssetCodeList('PUBL')
    product_type: AssetCodeOption[]; // 'PDTP'
    asset_type: AssetCodeOption[]; // 'ASTP'
    platform: AssetCodeOption[]; // 'PLFM'
  };
};

// stock_chk / stock_chk_batch 응답(성공 여부만 — legacy는 reload로 목록 재조회).
export type AssetStockCheckResponse = { success: boolean };
