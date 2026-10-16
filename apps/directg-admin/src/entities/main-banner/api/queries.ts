import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createMainBanner,
  deleteMainBanner,
  fetchMainBanner,
  fetchMainBannerList,
  sortMainBanner,
  updateMainBanner,
} from "./fetcher";
import type {
  BannerSortDirection,
  MainBannerListQuery,
  UpdateMainBannerRequest,
} from "../model/types";

const MAIN_BANNER_KEY = ["admin", "site", "main-banners"] as const;

export const mainBannerListQueryKey = (query: MainBannerListQuery) =>
  [...MAIN_BANNER_KEY, query] as const;

export const useMainBannerList = (query: MainBannerListQuery) =>
  useQuery({
    queryKey: mainBannerListQueryKey(query),
    queryFn: () => fetchMainBannerList(query),
  });

export const useMainBanner = (idx: number) =>
  useQuery({
    queryKey: [...MAIN_BANNER_KEY, "detail", idx] as const,
    queryFn: () => fetchMainBanner(idx),
  });

// legacy: mutation 성공 후 location.reload → 목록 재조회. invalidate로 동일 효과.
export const useSortMainBanner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ idx, direction }: { idx: number; direction: BannerSortDirection }) =>
      sortMainBanner(idx, direction),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MAIN_BANNER_KEY }),
  });
};

export const useDeleteMainBanner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (idx: number) => deleteMainBanner(idx),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MAIN_BANNER_KEY }),
  });
};

// legacy: register 성공 → banner_list.php 리다이렉트. 목록 invalidate 후 소비 측에서 이동.
export const useCreateMainBanner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMainBanner,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MAIN_BANNER_KEY }),
  });
};

// legacy: modify 성공 → banner_list.php 리다이렉트.
export const useUpdateMainBanner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ idx, payload }: { idx: number; payload: UpdateMainBannerRequest }) =>
      updateMainBanner(idx, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MAIN_BANNER_KEY }),
  });
};
