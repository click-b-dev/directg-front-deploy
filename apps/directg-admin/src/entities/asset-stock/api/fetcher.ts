import { apiClient } from "@shared/api/client";
import type {
  AssetStockSearch,
  AssetStockListResponse,
  AssetStockCheckResponse,
} from "../model/types";

// legacy Admin::getAssetList — publisher<>'EA' AND is_view='Y', order stock asc/update_dt desc, 30/page.
// 필터 Cd(code_id)는 백엔드가 name으로 변환(getAssetCodeInfo)해 매칭. codes(4종)도 함께 반환.
export const fetchAssetStockList = (query: AssetStockSearch) => {
  const searchParams: Record<string, string> = {};
  const set = (key: keyof AssetStockSearch, value: string | number | undefined) => {
    if (value !== undefined && value !== "") {
      searchParams[key] = String(value);
    }
  };
  set("page", query.page);
  set("asset_id", query.asset_id);
  set("asset_name", query.asset_name);
  set("publisherCd", query.publisherCd);
  set("assetTypeCd", query.assetTypeCd);
  set("productTypeCd", query.productTypeCd);
  set("platformCd", query.platformCd);
  return apiClient.get<AssetStockListResponse>("/admin/goods/stock/asset", { searchParams });
};

// legacy asset_stock_ps.php mode=stock_chk — 개별 재고 동기화(runAssetItemStock → 미러 2테이블 갱신).
export const checkAssetStock = (asset_id: string) =>
  apiClient.post<AssetStockCheckResponse>("/admin/goods/stock/asset/check", { asset_id });

// legacy mode=stock_chk_batch — 저재고(재고<30) 일괄 동기화(thr 백엔드 30 하드코딩).
export const checkAssetStockBatch = () =>
  apiClient.post<AssetStockCheckResponse>("/admin/goods/stock/asset/check-batch", { thr: 30 });
