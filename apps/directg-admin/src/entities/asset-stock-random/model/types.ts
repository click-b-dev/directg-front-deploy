// legacy goods/stock/asset_stock_random.php — Asset 랜덤박스 재고현황(assetType='랜덤박스' 고정).
// docs/migration/admin/stock/asset-stock-random.md. #154 자매(동일 getAssetList·batch/modify 없음).

export type AssetStockRandomSearch = {
  page: number;
  asset_id: string;
  asset_name: string;
  publisherCd: string;
  productTypeCd: string;
  platformCd: string;
};

// tbl_asset 행(동기화 미러). assetType은 항상 '랜덤박스'.
export type AssetStockRandomItem = {
  asset_id: string;
  asset_name: string;
  productType: string; // Asset 유형
  assetType: string; // Asset 형식(랜덤박스)
  platform: string; // Asset 플랫폼
  publisher: string; // Asset 공급처
  stock: number;
  update_dt: string;
};

export type AssetCodeOption = {
  code_id: string;
  name: string;
};

export type AssetStockRandomListResponse = {
  items: AssetStockRandomItem[];
  pagination: { total_results: number; total_pages: number };
  codes: {
    publisher: AssetCodeOption[]; // getAssetCodeList('PUBL')
    product_type: AssetCodeOption[]; // 'PDTP'
    platform: AssetCodeOption[]; // 'PLFM'
  };
};

export type AssetStockRandomCheckResponse = { success: boolean };
