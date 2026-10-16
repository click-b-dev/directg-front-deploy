import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchGoodsPromotionStockList,
  checkGoodsPromotionStock,
  checkGoodsPromotionStockBatch,
} from "./fetcher";
import type { GoodsPromotionStockSearch } from "../model/types";

const GOODS_PROMOTION_STOCK_KEY = ["admin", "goods", "stock", "goods-promotion"] as const;

const listQueryKey = (query: GoodsPromotionStockSearch) =>
  [...GOODS_PROMOTION_STOCK_KEY, "list", query] as const;

export const useGoodsPromotionStockList = (query: GoodsPromotionStockSearch) =>
  useQuery({
    queryKey: listQueryKey(query),
    queryFn: () => fetchGoodsPromotionStockList(query),
  });

// 재고확인(개별) — 성공 시 목록 invalidate(legacy location.reload() 대응).
export const useCheckGoodsPromotionStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (asset_id: string) => checkGoodsPromotionStock(asset_id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GOODS_PROMOTION_STOCK_KEY }),
  });
};

// 저재고 동기화(일괄).
export const useCheckGoodsPromotionStockBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => checkGoodsPromotionStockBatch(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GOODS_PROMOTION_STOCK_KEY }),
  });
};
