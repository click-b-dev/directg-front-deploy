import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAssetStockRandomList, checkAssetStockRandom } from "./fetcher";
import type { AssetStockRandomSearch } from "../model/types";

const ASSET_STOCK_RANDOM_KEY = ["admin", "goods", "stock", "asset-random"] as const;

const listQueryKey = (query: AssetStockRandomSearch) =>
  [...ASSET_STOCK_RANDOM_KEY, "list", query] as const;

export const useAssetStockRandomList = (query: AssetStockRandomSearch) =>
  useQuery({
    queryKey: listQueryKey(query),
    queryFn: () => fetchAssetStockRandomList(query),
  });

// 재고확인(개별) — 성공 시 목록 invalidate(legacy location.reload() 대응).
export const useCheckAssetStockRandom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (asset_id: string) => checkAssetStockRandom(asset_id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ASSET_STOCK_RANDOM_KEY }),
  });
};
