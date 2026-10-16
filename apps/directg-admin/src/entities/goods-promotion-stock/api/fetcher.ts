import { apiClient } from "@shared/api/client";
import type {
  GoodsPromotionStockSearch,
  GoodsPromotionStockListResponse,
  GoodsPromotionStockCheckResponse,
} from "../model/types";

// legacy AdminGoods::getGoodsPromotionStockList — promotion_schedule 조인·진행중 조건, order_system=1·status=0,
// stock asc/item_name asc, 30/page. 검색키 분기·프로모션 조건·코드 Cd→name은 백엔드.
export const fetchGoodsPromotionStockList = (query: GoodsPromotionStockSearch) => {
  const searchParams: Record<string, string> = {};
  const set = (key: keyof GoodsPromotionStockSearch, value: string | number | undefined) => {
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
  return apiClient.get<GoodsPromotionStockListResponse>("/admin/goods/stock/goods-promotion", {
    searchParams,
  });
};

// legacy asset_stock_ps.php 공유(asset_id=item_id). #154/#155와 동일 엔드포인트(FSD상 entity 교차 import 금지로 재정의).
export const checkGoodsPromotionStock = (asset_id: string) =>
  apiClient.post<GoodsPromotionStockCheckResponse>("/admin/goods/stock/asset/check", { asset_id });

export const checkGoodsPromotionStockBatch = () =>
  apiClient.post<GoodsPromotionStockCheckResponse>("/admin/goods/stock/asset/check-batch", {
    thr: 30,
  });
