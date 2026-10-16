import { apiClient } from "@shared/api/client";
import type {
  SteamAppSearch,
  SteamAppListResponse,
  SteamGameSearch,
  SteamGameListResponse,
  SteamDlcSearch,
  SteamDlcListResponse,
  SteamPackageSearch,
  SteamPackageListResponse,
  SteamReviewSearch,
  SteamReviewListResponse,
  SteamAppAllSearch,
  SteamAppAllListResponse,
  SteamComingSoonSearch,
  SteamComingSoonResponse,
  SteamRankingSearch,
  SteamRankingResponse,
  SteamSyncResult,
  SteamAppSyncRequest,
  SteamGenreSyncRequest,
  SteamTagSyncRequest,
  SteamReviewSyncRequest,
  SteamPackageSyncRequest,
  SteamRegisterRequest,
} from "../model/types";

// legacy steam/steam_apps_list.php — 스팀 Apps 검색(release_date desc, 10/page).
export const fetchSteamAppList = (query: SteamAppSearch) => {
  const searchParams: Record<string, string> = {};
  const set = (key: keyof SteamAppSearch, value: string | number | undefined) => {
    if (value !== undefined && value !== "") {
      searchParams[key] = String(value);
    }
  };
  set("page", query.page);
  set("search_app_type", query.search_app_type);
  set("search_appid", query.search_appid);
  set("search_name", query.search_name);
  set("drm_notice", query.drm_notice);
  set("ext_user_account_notice", query.ext_user_account_notice);
  return apiClient.get<SteamAppListResponse>("/admin/steam/apps", { searchParams });
};

// legacy steam/steam_game_list.php — 스팀 Game 현황(50/page).
export const fetchSteamGameList = (query: SteamGameSearch) => {
  const searchParams: Record<string, string> = {};
  const set = (key: keyof SteamGameSearch, value: string | number | undefined) => {
    if (value !== undefined && value !== "") {
      searchParams[key] = String(value);
    }
  };
  set("page", query.page);
  set("search_appid", query.search_appid);
  set("search_name", query.search_name);
  return apiClient.get<SteamGameListResponse>("/admin/steam/games", { searchParams });
};

// legacy steam/steam_dlc_list.php — 스팀 DLC 현황(50/page).
export const fetchSteamDlcList = (query: SteamDlcSearch) => {
  const searchParams: Record<string, string> = {};
  const set = (key: keyof SteamDlcSearch, value: string | number | undefined) => {
    if (value !== undefined && value !== "") {
      searchParams[key] = String(value);
    }
  };
  set("page", query.page);
  set("search_appid", query.search_appid);
  set("search_name", query.search_name);
  set("is_free", query.is_free);
  return apiClient.get<SteamDlcListResponse>("/admin/steam/dlcs", { searchParams });
};

// legacy steam/steam_package_list.php — 스팀 Package 현황(50/page).
export const fetchSteamPackageList = (query: SteamPackageSearch) => {
  const searchParams: Record<string, string> = {};
  const set = (key: keyof SteamPackageSearch, value: string | number | undefined) => {
    if (value !== undefined && value !== "") {
      searchParams[key] = String(value);
    }
  };
  set("page", query.page);
  set("search_packageid", query.search_packageid);
  set("search_name", query.search_name);
  return apiClient.get<SteamPackageListResponse>("/admin/steam/packages", { searchParams });
};

// legacy steam/steam_review_list.php — 스팀 평가 현황(50/page).
export const fetchSteamReviewList = (query: SteamReviewSearch) => {
  const searchParams: Record<string, string> = {};
  const set = (key: keyof SteamReviewSearch, value: string | number | undefined) => {
    if (value !== undefined && value !== "") {
      searchParams[key] = String(value);
    }
  };
  set("page", query.page);
  set("search_appid", query.search_appid);
  set("search_name", query.search_name);
  set("search_year", query.search_year);
  return apiClient.get<SteamReviewListResponse>("/admin/steam/reviews", { searchParams });
};

// legacy steam/steam_apps_list_all.php — 스팀 Apps list(20/page).
export const fetchSteamAppAllList = (query: SteamAppAllSearch) => {
  const searchParams: Record<string, string> = {};
  const set = (key: keyof SteamAppAllSearch, value: string | number | undefined) => {
    if (value !== undefined && value !== "") {
      searchParams[key] = String(value);
    }
  };
  set("page", query.page);
  set("search_year", query.search_year);
  set("search_publisher", query.search_publisher);
  set("search_appid", query.search_appid);
  set("search_name", query.search_name);
  set("search_app_type", query.search_app_type);
  set("is_free", query.is_free);
  set("supported_languages", query.supported_languages);
  set("search_developer", query.search_developer);
  return apiClient.get<SteamAppAllListResponse>("/admin/steam/apps-all", { searchParams });
};

// legacy steam/steam_apps_comingsoon.php — 스팀 출시예정 App(50/page).
export const fetchSteamComingSoon = (query: SteamComingSoonSearch) => {
  const searchParams: Record<string, string> = {};
  const set = (key: keyof SteamComingSoonSearch, value: string | number | undefined) => {
    if (value !== undefined && value !== "") {
      searchParams[key] = String(value);
    }
  };
  set("page", query.page);
  set("search_appid", query.search_appid);
  set("search_name", query.search_name);
  set("search_title_id", query.search_title_id);
  return apiClient.get<SteamComingSoonResponse>("/admin/steam/coming-soon", { searchParams });
};

// legacy steam/steam_apps_ranking.php — 스팀 Apps 평가수 순위(50/page).
export const fetchSteamRanking = (query: SteamRankingSearch) => {
  const searchParams: Record<string, string> = {};
  const set = (key: keyof SteamRankingSearch, value: string | number | undefined) => {
    if (value !== undefined && value !== "") {
      searchParams[key] = String(value);
    }
  };
  set("page", query.page);
  set("search_year", query.search_year);
  set("search_publisher", query.search_publisher);
  set("is_free", query.is_free);
  return apiClient.get<SteamRankingResponse>("/admin/steam/ranking", { searchParams });
};

// ===== 동기화 액션(#69~76 후속) =====
// 앱/게임/DLC 동기화(get_steam_game_info/get_steam_app_info steam_sync, mode로 분기).
export const syncSteamApp = (payload: SteamAppSyncRequest) =>
  apiClient.post<SteamSyncResult>("/admin/steam/apps/sync", payload);

// 장르 동기화.
export const syncSteamGenre = (payload: SteamGenreSyncRequest) =>
  apiClient.post<SteamSyncResult>("/admin/steam/apps/sync-genre", payload);

// 카테고리 동기화.
export const syncSteamCategory = (payload: SteamGenreSyncRequest) =>
  apiClient.post<SteamSyncResult>("/admin/steam/apps/sync-category", payload);

// TAG 동기화(python 크롤 + tag upsert).
export const syncSteamTag = (payload: SteamTagSyncRequest) =>
  apiClient.post<SteamSyncResult>("/admin/steam/apps/sync-tag", payload);

// 리뷰 동기화(get_steam_review).
export const syncSteamReview = (payload: SteamReviewSyncRequest) =>
  apiClient.post<SteamSyncResult>("/admin/steam/reviews/sync", payload);

// 패키지 동기화(get_steam_package_info(_all)).
export const syncSteamPackage = (payload: SteamPackageSyncRequest) =>
  apiClient.post<SteamSyncResult>("/admin/steam/packages/sync", payload);

// App 등록(모달 = steam_sync).
export const registerSteamApp = (payload: SteamRegisterRequest) =>
  apiClient.post<SteamSyncResult>("/admin/steam/apps/register", payload);

// 앱/DLC 삭제(steam_app_delete).
export const deleteSteamApp = (appid: string) =>
  apiClient.del<SteamSyncResult>(`/admin/steam/apps/${appid}`);

// 패키지 삭제(steam_package_delete).
export const deleteSteamPackage = (packageid: string) =>
  apiClient.del<SteamSyncResult>(`/admin/steam/packages/${packageid}`);
