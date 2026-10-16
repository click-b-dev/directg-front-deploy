import { apiClient } from "@shared/api/client";
import type {
  BannerLinkResponse,
  BannerMutationResponse,
  BannerSortDirection,
  CreateMainBannerRequest,
  MainBannerDetail,
  MainBannerListQuery,
  MainBannerListResponse,
  UpdateMainBannerRequest,
} from "../model/types";

// legacy AdminSite::getMainbannerList — is_del='N' + 선택 필터, order banner_sort asc, page당 20.
export const fetchMainBannerList = (query: MainBannerListQuery) => {
  const searchParams: Record<string, string> = {};
  if (query.page) {
    searchParams.page = String(query.page);
  }
  if (query.search_banner_title) {
    searchParams.search_banner_title = query.search_banner_title;
  }
  if (query.search_flag) {
    searchParams.search_flag = query.search_flag;
  }
  return apiClient.get<MainBannerListResponse>("/admin/site/main-banners", { searchParams });
};

// legacy banner_proc.php banner_sort_up/down — 해당 행 banner_sort만 ±1(swap 아님).
export const sortMainBanner = (idx: number, direction: BannerSortDirection) =>
  apiClient.post<BannerMutationResponse>(`/admin/site/main-banners/${idx}/sort`, { direction });

// legacy banner_proc.php banner_delete — 소프트 삭제(is_del='Y').
export const deleteMainBanner = (idx: number) =>
  apiClient.del<BannerMutationResponse>(`/admin/site/main-banners/${idx}`);

// legacy banner_proc.php register — INSERT tbl_main_banner.
export const createMainBanner = (payload: CreateMainBannerRequest) =>
  apiClient.post<BannerMutationResponse>("/admin/site/main-banners", payload);

// legacy banner_proc.php banner_link_search — product_code → 상세 링크.
export const searchBannerLink = (productCode: string) =>
  apiClient.get<BannerLinkResponse>("/admin/site/banner-link", {
    searchParams: { product_code: productCode },
  });

// legacy banner_modify.php: select * where idx — 폼 프리필용 단건.
export const fetchMainBanner = (idx: number) =>
  apiClient.get<MainBannerDetail>(`/admin/site/main-banners/${idx}`);

// legacy banner_proc.php modify — UPDATE tbl_main_banner WHERE idx.
export const updateMainBanner = (idx: number, payload: UpdateMainBannerRequest) =>
  apiClient.put<BannerMutationResponse>(`/admin/site/main-banners/${idx}`, payload);
