import { apiClient } from "@shared/api/client";
import type {
  AssetStockRandomSearch,
  AssetStockRandomListResponse,
  AssetStockRandomCheckResponse,
} from "../model/types";

// legacy Admin::getAssetList + assetType='랜덤박스' 고정, order stock asc/asset_id asc, 30/page.
// 필터 Cd→name 변환은 백엔드. codes 3종(publisher/product_type/platform) 동봉.
export const fetchAssetStockRandomList = (query: AssetStockRandomSearch) => {
  const searchParams: Record<string, string> = {};
  const set = (key: keyof AssetStockRandomSearch, value: string | number | undefined) => {
    if (value !== undefined && value !== "") {
      searchParams[key] = String(value);
    }
  };
  set("page", query.page);
  set("asset_id", query.asset_id);
  set("asset_name", query.asset_name);
  set("publisherCd", query.publisherCd);
  set("productTypeCd", query.productTypeCd);
  set("platformCd", query.platformCd);
  return apiClient.get<AssetStockRandomListResponse>("/admin/goods/stock/asset-random", {
    searchParams,
  });
};

// legacy asset_stock_ps.php mode=stock_chk — #154와 동일 엔드포인트(FSD상 entity 교차 import 금지로 재정의). batch 없음.
export const checkAssetStockRandom = (asset_id: string) =>
  apiClient.post<AssetStockRandomCheckResponse>("/admin/goods/stock/asset/check", { asset_id });
