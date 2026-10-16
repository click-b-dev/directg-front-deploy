import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchGoodsOptionStockList,
  checkGoodsOptionStock,
  checkGoodsOptionStockBatch,
} from "./fetcher";
import type { GoodsOptionStockSearch } from "../model/types";

const GOODS_OPTION_STOCK_KEY = ["admin", "goods", "stock", "goods-option"] as const;

const listQueryKey = (query: GoodsOptionStockSearch) =>
  [...GOODS_OPTION_STOCK_KEY, "list", query] as const;

export const useGoodsOptionStockList = (query: GoodsOptionStockSearch) =>
  useQuery({
    queryKey: listQueryKey(query),
    queryFn: () => fetchGoodsOptionStockList(query),
  });

// 재고확인(개별) — 성공 시 목록 invalidate(legacy location.reload() 대응).
export const useCheckGoodsOptionStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (asset_id: string) => checkGoodsOptionStock(asset_id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GOODS_OPTION_STOCK_KEY }),
  });
};

// 저재고 동기화(일괄).
export const useCheckGoodsOptionStockBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => checkGoodsOptionStockBatch(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GOODS_OPTION_STOCK_KEY }),
  });
};
