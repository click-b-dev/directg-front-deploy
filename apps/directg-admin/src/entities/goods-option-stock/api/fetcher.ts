import { apiClient } from "@shared/api/client";
import type {
  GoodsOptionStockSearch,
  GoodsOptionStockListResponse,
  GoodsOptionStockCheckResponse,
} from "../model/types";

// legacy AdminGoods::getGoodsOptionStockList — order_system=1·status=0 고정, stock asc/item_name asc, 30/page.
// 검색키 분기·코드 Cd→name 변환은 백엔드. codes(publisher/product_type) 동봉.
export const fetchGoodsOptionStockList = (query: GoodsOptionStockSearch) => {
  const searchParams: Record<string, string> = {};
  const set = (key: keyof GoodsOptionStockSearch, value: string | number | undefined) => {
    if (value !== undefined && value !== "") {
      searchParams[key] = String(value);
    }
  };
  set("page", query.page);
  set("search_key", query.search_key);
  set("search_value", query.search_value);
  set("publisherCd", query.publisherCd);
  set("productTypeCd", query.productTypeCd);
  set("assetTypeCd", query.assetTypeCd);
  set("platformCd", query.platformCd);
  return apiClient.get<GoodsOptionStockListResponse>("/admin/goods/stock/goods-option", {
    searchParams,
  });
};

// legacy asset_stock_ps.php 공유(asset_id=item_id). #154와 동일 엔드포인트(FSD상 entity 교차 import 금지로 재정의).
export const checkGoodsOptionStock = (asset_id: string) =>
  apiClient.post<GoodsOptionStockCheckResponse>("/admin/goods/stock/asset/check", { asset_id });

export const checkGoodsOptionStockBatch = () =>
  apiClient.post<GoodsOptionStockCheckResponse>("/admin/goods/stock/asset/check-batch", {
    thr: 30,
  });
