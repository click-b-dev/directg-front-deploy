import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  configGenbaPublisher,
  fetchGenbaPing,
  fetchGenbaPublisherList,
  fetchGenbaTitleList,
  fetchGenbaTitlePublishers,
  syncGenbaPrice,
  syncGenbaProduct,
  fetchGenbaProductList,
  syncGenbaProductItem,
  syncGenbaStock,
  requestGenbaPreLive,
  fetchGenbaPromotionSchedule,
  syncGenbaPromotion,
} from "./fetcher";
import type { GenbaTitleSearch, GenbaProductSearch, GenbaPromotionSearch } from "../model/types";

const GENBA_KEY = ["admin", "genba"] as const;

export const genbaPingQueryKey = () => [...GENBA_KEY, "ping"] as const;

// legacy genba_ping.php — Genba 연결 확인.
export const useGenbaPing = () =>
  useQuery({
    queryKey: genbaPingQueryKey(),
    queryFn: () => fetchGenbaPing(),
  });

export const genbaPublisherListQueryKey = () => [...GENBA_KEY, "publishers"] as const;

// legacy genba_publisher.php — Genba 퍼블리셔 현황.
export const useGenbaPublisherList = () =>
  useQuery({
    queryKey: genbaPublisherListQueryKey(),
    queryFn: () => fetchGenbaPublisherList(),
  });

// legacy genba_ps.php publisher_config — status 토글.
// legacy는 성공 후 location.reload 주석처리 → 재조회/invalidate 없음.
export const useConfigGenbaPublisher = () => useMutation({ mutationFn: configGenbaPublisher });

export const genbaTitleListQueryKey = (query: GenbaTitleSearch) =>
  [...GENBA_KEY, "titles", query] as const;

// legacy genba_title.php — Genba 타이틀 현황.
export const useGenbaTitleList = (query: GenbaTitleSearch) =>
  useQuery({
    queryKey: genbaTitleListQueryKey(query),
    queryFn: () => fetchGenbaTitleList(query),
  });

export const genbaTitlePublishersQueryKey = () => [...GENBA_KEY, "title-publishers"] as const;

// legacy getGenbaTitlePublisher() — Publisher select 옵션.
export const useGenbaTitlePublishers = () =>
  useQuery({
    queryKey: genbaTitlePublishersQueryKey(),
    queryFn: () => fetchGenbaTitlePublishers(),
  });

// 타이틀/상품 목록(genba_title.php·genba_product_sync.php) 모두 재조회.
const invalidateGenbaLists = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: [...GENBA_KEY, "titles"] });
  queryClient.invalidateQueries({ queryKey: [...GENBA_KEY, "products"] });
};

// legacy genba_api.php api_type=price — 개별 가격 동기화(성공 후 목록 재조회).
export const useSyncGenbaPrice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: syncGenbaPrice,
    onSuccess: () => invalidateGenbaLists(queryClient),
  });
};

// legacy genba_api.php api_type=product — 전체 상품 동기화(성공 후 목록 재조회).
export const useSyncGenbaProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: syncGenbaProduct,
    onSuccess: () => invalidateGenbaLists(queryClient),
  });
};

export const genbaProductListQueryKey = (query: GenbaProductSearch) =>
  [...GENBA_KEY, "products", query] as const;

// legacy genba_product_sync.php — Genba 상품 관리(카탈로그 현황).
export const useGenbaProductList = (query: GenbaProductSearch) =>
  useQuery({
    queryKey: genbaProductListQueryKey(query),
    queryFn: () => fetchGenbaProductList(query),
  });

// legacy genba_api.php api_type=product_sync — 개별 상품 동기화(성공 후 재조회).
export const useSyncGenbaProductItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: syncGenbaProductItem,
    onSuccess: () => invalidateGenbaLists(queryClient),
  });
};

// legacy genba_api.php api_type=stock — 재고 확인(성공 후 재조회).
export const useSyncGenbaStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: syncGenbaStock,
    onSuccess: () => invalidateGenbaLists(queryClient),
  });
};

// legacy genba_api.php api_type=prelive — pre-live 요청(재조회 없음, alert만).
export const useRequestGenbaPreLive = () => useMutation({ mutationFn: requestGenbaPreLive });

export const genbaPromotionScheduleQueryKey = (query: GenbaPromotionSearch) =>
  [...GENBA_KEY, "promotions", query] as const;

// legacy genba_promotion_sync.php — Genba 프로모션 조회.
export const useGenbaPromotionSchedule = (query: GenbaPromotionSearch) =>
  useQuery({
    queryKey: genbaPromotionScheduleQueryKey(query),
    queryFn: () => fetchGenbaPromotionSchedule(query),
  });

// legacy genba_api.php api_type=promotion — 프로모션 동기화(성공 후 재조회).
export const useSyncGenbaPromotion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: syncGenbaPromotion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...GENBA_KEY, "promotions"] });
    },
  });
};
