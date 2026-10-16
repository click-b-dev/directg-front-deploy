import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAssetStockList, checkAssetStock, checkAssetStockBatch } from "./fetcher";
import type { AssetStockSearch } from "../model/types";

const ASSET_STOCK_KEY = ["admin", "goods", "stock", "asset"] as const;

const assetStockListQueryKey = (query: AssetStockSearch) =>
  [...ASSET_STOCK_KEY, "list", query] as const;

export const useAssetStockList = (query: AssetStockSearch) =>
  useQuery({
    queryKey: assetStockListQueryKey(query),
    queryFn: () => fetchAssetStockList(query),
  });

// 재고확인(개별) — 성공 시 목록 invalidate(legacy location.reload() 대응).
export const useCheckAssetStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (asset_id: string) => checkAssetStock(asset_id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ASSET_STOCK_KEY }),
  });
};

// 저재고 동기화(일괄) — 성공 시 목록 invalidate.
export const useCheckAssetStockBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => checkAssetStockBatch(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ASSET_STOCK_KEY }),
  });
};
