import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchSteamAppList,
  fetchSteamGameList,
  fetchSteamDlcList,
  fetchSteamPackageList,
  fetchSteamReviewList,
  fetchSteamAppAllList,
  fetchSteamComingSoon,
  fetchSteamRanking,
  syncSteamApp,
  syncSteamGenre,
  syncSteamCategory,
  syncSteamTag,
  syncSteamReview,
  syncSteamPackage,
  registerSteamApp,
  deleteSteamApp,
  deleteSteamPackage,
} from "./fetcher";
import type {
  SteamAppSearch,
  SteamGameSearch,
  SteamDlcSearch,
  SteamPackageSearch,
  SteamReviewSearch,
  SteamAppAllSearch,
  SteamComingSoonSearch,
  SteamRankingSearch,
  SteamAppSyncRequest,
  SteamGenreSyncRequest,
  SteamTagSyncRequest,
  SteamReviewSyncRequest,
  SteamPackageSyncRequest,
  SteamRegisterRequest,
} from "../model/types";

const STEAM_KEY = ["admin", "steam"] as const;

export const steamAppListQueryKey = (query: SteamAppSearch) =>
  [...STEAM_KEY, "apps", query] as const;

// legacy steam/steam_apps_list.php — 스팀 Apps 검색.
export const useSteamAppList = (query: SteamAppSearch) =>
  useQuery({
    queryKey: steamAppListQueryKey(query),
    queryFn: () => fetchSteamAppList(query),
  });

export const steamGameListQueryKey = (query: SteamGameSearch) =>
  [...STEAM_KEY, "games", query] as const;

// legacy steam/steam_game_list.php — 스팀 Game 현황.
export const useSteamGameList = (query: SteamGameSearch) =>
  useQuery({
    queryKey: steamGameListQueryKey(query),
    queryFn: () => fetchSteamGameList(query),
  });

export const steamDlcListQueryKey = (query: SteamDlcSearch) =>
  [...STEAM_KEY, "dlcs", query] as const;

// legacy steam/steam_dlc_list.php — 스팀 DLC 현황.
export const useSteamDlcList = (query: SteamDlcSearch) =>
  useQuery({
    queryKey: steamDlcListQueryKey(query),
    queryFn: () => fetchSteamDlcList(query),
  });

export const steamPackageListQueryKey = (query: SteamPackageSearch) =>
  [...STEAM_KEY, "packages", query] as const;

// legacy steam/steam_package_list.php — 스팀 Package 현황.
export const useSteamPackageList = (query: SteamPackageSearch) =>
  useQuery({
    queryKey: steamPackageListQueryKey(query),
    queryFn: () => fetchSteamPackageList(query),
  });

export const steamReviewListQueryKey = (query: SteamReviewSearch) =>
  [...STEAM_KEY, "reviews", query] as const;

// legacy steam/steam_review_list.php — 스팀 평가 현황.
export const useSteamReviewList = (query: SteamReviewSearch) =>
  useQuery({
    queryKey: steamReviewListQueryKey(query),
    queryFn: () => fetchSteamReviewList(query),
  });

export const steamAppAllListQueryKey = (query: SteamAppAllSearch) =>
  [...STEAM_KEY, "apps-all", query] as const;

// legacy steam/steam_apps_list_all.php — 스팀 Apps list.
export const useSteamAppAllList = (query: SteamAppAllSearch) =>
  useQuery({
    queryKey: steamAppAllListQueryKey(query),
    queryFn: () => fetchSteamAppAllList(query),
  });

export const steamComingSoonQueryKey = (query: SteamComingSoonSearch) =>
  [...STEAM_KEY, "coming-soon", query] as const;

// legacy steam/steam_apps_comingsoon.php — 스팀 출시예정 App.
export const useSteamComingSoon = (query: SteamComingSoonSearch) =>
  useQuery({
    queryKey: steamComingSoonQueryKey(query),
    queryFn: () => fetchSteamComingSoon(query),
  });

export const steamRankingQueryKey = (query: SteamRankingSearch) =>
  [...STEAM_KEY, "ranking", query] as const;

// legacy steam/steam_apps_ranking.php — 스팀 Apps 평가수 순위.
export const useSteamRanking = (query: SteamRankingSearch) =>
  useQuery({
    queryKey: steamRankingQueryKey(query),
    queryFn: () => fetchSteamRanking(query),
  });

// ===== 동기화 액션 훅(#69~76 후속). 성공 시 STEAM 쿼리 invalidate(=reload) =====
const useSteamInvalidate = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: STEAM_KEY });
};

export const useSyncSteamApp = () => {
  const invalidate = useSteamInvalidate();
  return useMutation({
    mutationFn: (p: SteamAppSyncRequest) => syncSteamApp(p),
    onSuccess: invalidate,
  });
};
export const useSyncSteamGenre = () => {
  const invalidate = useSteamInvalidate();
  return useMutation({
    mutationFn: (p: SteamGenreSyncRequest) => syncSteamGenre(p),
    onSuccess: invalidate,
  });
};
export const useSyncSteamCategory = () => {
  const invalidate = useSteamInvalidate();
  return useMutation({
    mutationFn: (p: SteamGenreSyncRequest) => syncSteamCategory(p),
    onSuccess: invalidate,
  });
};
export const useSyncSteamTag = () => {
  const invalidate = useSteamInvalidate();
  return useMutation({
    mutationFn: (p: SteamTagSyncRequest) => syncSteamTag(p),
    onSuccess: invalidate,
  });
};
export const useSyncSteamReview = () => {
  const invalidate = useSteamInvalidate();
  return useMutation({
    mutationFn: (p: SteamReviewSyncRequest) => syncSteamReview(p),
    onSuccess: invalidate,
  });
};
export const useSyncSteamPackage = () => {
  const invalidate = useSteamInvalidate();
  return useMutation({
    mutationFn: (p: SteamPackageSyncRequest) => syncSteamPackage(p),
    onSuccess: invalidate,
  });
};
export const useRegisterSteamApp = () => {
  const invalidate = useSteamInvalidate();
  return useMutation({
    mutationFn: (p: SteamRegisterRequest) => registerSteamApp(p),
    onSuccess: invalidate,
  });
};
export const useDeleteSteamApp = () => {
  const invalidate = useSteamInvalidate();
  return useMutation({
    mutationFn: (appid: string) => deleteSteamApp(appid),
    onSuccess: invalidate,
  });
};
export const useDeleteSteamPackage = () => {
  const invalidate = useSteamInvalidate();
  return useMutation({
    mutationFn: (packageid: string) => deleteSteamPackage(packageid),
    onSuccess: invalidate,
  });
};
