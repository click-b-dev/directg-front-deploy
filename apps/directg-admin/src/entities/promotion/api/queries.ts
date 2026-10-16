import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchPromotionReadyList,
  fetchPromotionIngList,
  fetchPromotionUpcomingList,
  fetchPromotionEndList,
  fetchPromotionWeekendList,
  fetchPromotionWeekendDetail,
  fetchPromotionWeekendView,
  createPromotionWeekend,
  updatePromotionWeekend,
  fetchPromotionSeasonList,
  fetchPromotionSeasonDetail,
  createPromotionSeason,
  updatePromotionSeason,
  fetchPromotionSeasonView,
  fetchOfflineCouponList,
  fetchOfflineCouponDetail,
  createOfflineCoupon,
  updateOfflineCoupon,
  fetchOfflineCouponUsed,
  uploadPromotionFile,
  confirmPromotions,
  deleteAllPromotions,
  deletePromotion,
} from "./fetcher";
import type {
  PromotionReadyListSearch,
  PromotionIngListSearch,
  PromotionUpcomingListSearch,
  PromotionEndListSearch,
  PromotionWeekendListSearch,
  PromotionWeekendSaveRequest,
  PromotionSeasonListSearch,
  PromotionSeasonSaveRequest,
  OfflineCouponListSearch,
  OfflineCouponSaveRequest,
  OfflineCouponViewSearch,
  PromotionUploadRequest,
} from "../model/types";

const PROMOTION_KEY = ["admin", "promotion"] as const;

export const promotionReadyListQueryKey = (query: PromotionReadyListSearch) =>
  [...PROMOTION_KEY, "ready", query] as const;

// legacy promotion/promotion_ready.php — 승인대기 할인 프로모션 목록.
export const usePromotionReadyList = (query: PromotionReadyListSearch) =>
  useQuery({
    queryKey: promotionReadyListQueryKey(query),
    queryFn: () => fetchPromotionReadyList(query),
  });

export const promotionIngListQueryKey = (query: PromotionIngListSearch) =>
  [...PROMOTION_KEY, "ing", query] as const;

// legacy promotion/promotion_ing.php — 진행중인 할인 프로모션 목록.
export const usePromotionIngList = (query: PromotionIngListSearch) =>
  useQuery({
    queryKey: promotionIngListQueryKey(query),
    queryFn: () => fetchPromotionIngList(query),
  });

export const promotionUpcomingListQueryKey = (query: PromotionUpcomingListSearch) =>
  [...PROMOTION_KEY, "upcoming", query] as const;

// legacy promotion/promotion_upcoming.php — 진행예정 할인 프로모션 목록.
export const usePromotionUpcomingList = (query: PromotionUpcomingListSearch) =>
  useQuery({
    queryKey: promotionUpcomingListQueryKey(query),
    queryFn: () => fetchPromotionUpcomingList(query),
  });

export const promotionEndListQueryKey = (query: PromotionEndListSearch) =>
  [...PROMOTION_KEY, "end", query] as const;

// legacy promotion/promotion_end.php — 종료된 할인 프로모션 목록(읽기전용).
export const usePromotionEndList = (query: PromotionEndListSearch) =>
  useQuery({
    queryKey: promotionEndListQueryKey(query),
    queryFn: () => fetchPromotionEndList(query),
  });

export const promotionWeekendListQueryKey = (query: PromotionWeekendListSearch) =>
  [...PROMOTION_KEY, "weekend", query] as const;

// legacy promotion/promotion_weekend.php — 주말특가 프로모션 목록.
export const usePromotionWeekendList = (query: PromotionWeekendListSearch) =>
  useQuery({
    queryKey: promotionWeekendListQueryKey(query),
    queryFn: () => fetchPromotionWeekendList(query),
  });

export const promotionWeekendDetailQueryKey = (idx: number) =>
  [...PROMOTION_KEY, "weekend", "detail", idx] as const;

// legacy promotion_weekend_register.php(modify 로드) — 주말특가 상세.
export const usePromotionWeekendDetail = (idx: number, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: promotionWeekendDetailQueryKey(idx),
    queryFn: () => fetchPromotionWeekendDetail(idx),
    enabled: options?.enabled ?? true,
  });

export const promotionWeekendViewQueryKey = (idx: number) =>
  [...PROMOTION_KEY, "weekend", "view", idx] as const;

// legacy promotion_weekend_view.php — 주말특가 상세보기(카드 미리보기).
export const usePromotionWeekendView = (idx: number) =>
  useQuery({
    queryKey: promotionWeekendViewQueryKey(idx),
    queryFn: () => fetchPromotionWeekendView(idx),
  });

export const promotionSeasonListQueryKey = (query: PromotionSeasonListSearch) =>
  [...PROMOTION_KEY, "season", query] as const;

// legacy promotion/promotion_season.php — 대규모 프로모션 목록.
export const usePromotionSeasonList = (query: PromotionSeasonListSearch) =>
  useQuery({
    queryKey: promotionSeasonListQueryKey(query),
    queryFn: () => fetchPromotionSeasonList(query),
  });

export const promotionSeasonDetailQueryKey = (idx: number) =>
  [...PROMOTION_KEY, "season", "detail", idx] as const;

// legacy promotion_season_register.php(modify 로드) — 대규모 프로모션 상세.
export const usePromotionSeasonDetail = (idx: number, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: promotionSeasonDetailQueryKey(idx),
    queryFn: () => fetchPromotionSeasonDetail(idx),
    enabled: options?.enabled ?? true,
  });

// legacy promotion_season_ps.php mode=register → go(promotion_season.php) = 목록 invalidate.
export const useCreatePromotionSeason = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PromotionSeasonSaveRequest) => createPromotionSeason(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PROMOTION_KEY }),
  });
};

// legacy promotion_season_ps.php mode=modify → go(promotion_season.php) = 목록 invalidate.
export const useUpdatePromotionSeason = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ idx, payload }: { idx: number; payload: PromotionSeasonSaveRequest }) =>
      updatePromotionSeason(idx, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PROMOTION_KEY }),
  });
};

export const promotionSeasonViewQueryKey = (idx: number) =>
  [...PROMOTION_KEY, "season", "view", idx] as const;

// legacy promotion_season_view.php — 대규모 프로모션 상세보기.
export const usePromotionSeasonView = (idx: number) =>
  useQuery({
    queryKey: promotionSeasonViewQueryKey(idx),
    queryFn: () => fetchPromotionSeasonView(idx),
  });

export const offlineCouponListQueryKey = (query: OfflineCouponListSearch) =>
  [...PROMOTION_KEY, "offline-coupon", query] as const;

// legacy promotion/offline_coupon_list.php — 오프라인 쿠폰 목록.
export const useOfflineCouponList = (query: OfflineCouponListSearch) =>
  useQuery({
    queryKey: offlineCouponListQueryKey(query),
    queryFn: () => fetchOfflineCouponList(query),
  });

export const offlineCouponDetailQueryKey = (sno: number) =>
  [...PROMOTION_KEY, "offline-coupon", "detail", sno] as const;

// legacy offline_coupon_register.php(update 로드) — 오프라인 쿠폰 상세.
export const useOfflineCouponDetail = (sno: number, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: offlineCouponDetailQueryKey(sno),
    queryFn: () => fetchOfflineCouponDetail(sno),
    enabled: options?.enabled ?? true,
  });

// legacy offline_coupon_ps.php mode=register → 목록 복귀 = 목록 invalidate.
export const useCreateOfflineCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: OfflineCouponSaveRequest) => createOfflineCoupon(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PROMOTION_KEY }),
  });
};

// legacy offline_coupon_ps.php mode=update → 목록 복귀 = 목록 invalidate.
export const useUpdateOfflineCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sno, payload }: { sno: number; payload: OfflineCouponSaveRequest }) =>
      updateOfflineCoupon(sno, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PROMOTION_KEY }),
  });
};

export const offlineCouponUsedQueryKey = (query: OfflineCouponViewSearch) =>
  [...PROMOTION_KEY, "offline-coupon", "used", query] as const;

// legacy offline_coupon_view.php — 오프라인 쿠폰 상세(기본정보 + 사용현황).
export const useOfflineCouponUsed = (query: OfflineCouponViewSearch) =>
  useQuery({
    queryKey: offlineCouponUsedQueryKey(query),
    queryFn: () => fetchOfflineCouponUsed(query),
  });

// legacy promotion_weekend_ps.php mode=register → go(promotion_weekend.php) = 목록 invalidate.
export const useCreatePromotionWeekend = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PromotionWeekendSaveRequest) => createPromotionWeekend(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PROMOTION_KEY }),
  });
};

// legacy promotion_weekend_ps.php mode=modify → go(promotion_weekend.php) = 목록 invalidate.
export const useUpdatePromotionWeekend = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ idx, payload }: { idx: number; payload: PromotionWeekendSaveRequest }) =>
      updatePromotionWeekend(idx, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PROMOTION_KEY }),
  });
};

// legacy promotion_ps.php mode=file_register → go("promotion_ready.php") 리다이렉트 = 목록 invalidate.
export const useUploadPromotionFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PromotionUploadRequest) => uploadPromotionFile(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PROMOTION_KEY }),
  });
};

// legacy promotion_ps.php mode=confirm — 전체 승인.
// legacy JS는 success 콜백에서 `location.relaod()`(오타) 호출 → ReferenceError로 리로드 실패 →
// 목록이 자동 갱신되지 않는다. 관찰 동작 이식 위해 onSuccess invalidate 하지 않음(#170 파리티 결정①).
export const useConfirmPromotions = () =>
  useMutation({
    mutationFn: () => confirmPromotions(),
  });

// legacy promotion_ps.php mode=delete_all — 전체 삭제. 동일 오타 버그로 미갱신.
export const useDeleteAllPromotions = () =>
  useMutation({
    mutationFn: () => deleteAllPromotions(),
  });

// legacy promotion_ps.php mode=delete — 개별 삭제. 동일 오타 버그로 미갱신.
export const useDeletePromotion = () =>
  useMutation({
    mutationFn: (idx: number) => deletePromotion(idx),
  });
