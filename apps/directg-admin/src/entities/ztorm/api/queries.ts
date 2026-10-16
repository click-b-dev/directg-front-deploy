import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchZtormPing,
  fetchZtormPublisherList,
  fetchZtormCatalogue,
  searchZtormRrp,
  addZtormProduct,
  fetchZtormPromotion,
  syncZtormPromotion,
} from "./fetcher";
import type { ZtormCatalogueSearch, ZtormItemRequest, ZtormPromotionSearch } from "../model/types";

const ZTORM_KEY = ["admin", "ztorm"] as const;

export const ztormPingQueryKey = () => [...ZTORM_KEY, "ping"] as const;

// legacy ztorm_ping.php — Ztorm 연결 확인.
export const useZtormPing = () =>
  useQuery({
    queryKey: ztormPingQueryKey(),
    queryFn: () => fetchZtormPing(),
  });

export const ztormPublisherListQueryKey = () => [...ZTORM_KEY, "publishers"] as const;

// legacy ztorm_publisher_list.php — Ztorm 퍼블리셔 현황.
export const useZtormPublisherList = () =>
  useQuery({
    queryKey: ztormPublisherListQueryKey(),
    queryFn: () => fetchZtormPublisherList(),
  });

export const ztormCatalogueQueryKey = (query: ZtormCatalogueSearch) =>
  [...ZTORM_KEY, "catalogue", query] as const;

// legacy ztorm_catalogue.php — Ztorm 카탈로그 현황.
export const useZtormCatalogue = (query: ZtormCatalogueSearch) =>
  useQuery({
    queryKey: ztormCatalogueQueryKey(query),
    queryFn: () => fetchZtormCatalogue(query),
  });

// legacy ztorm_api.php rrp_search/product_add → alert + reload = Ztorm invalidate.
export const useSearchZtormRrp = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (p: ZtormItemRequest) => searchZtormRrp(p),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ZTORM_KEY }),
  });
};
export const useAddZtormProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (p: ZtormItemRequest) => addZtormProduct(p),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ZTORM_KEY }),
  });
};

export const ztormPromotionQueryKey = (query: ZtormPromotionSearch) =>
  [...ZTORM_KEY, "promotions", query] as const;

// legacy ztorm_promotion.php — Ztorm 프로모션 현황.
export const useZtormPromotion = (query: ZtormPromotionSearch) =>
  useQuery({
    queryKey: ztormPromotionQueryKey(query),
    queryFn: () => fetchZtormPromotion(query),
  });

// legacy ztorm_api.php promotion → reload = Ztorm invalidate.
export const useSyncZtormPromotion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => syncZtormPromotion(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ZTORM_KEY }),
  });
};
