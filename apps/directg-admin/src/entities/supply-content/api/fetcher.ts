import { apiClient } from "@shared/api/client";
import type {
  SupplyContentSearch,
  SupplyContentListResponse,
  SupplyContentMemberSearch,
  SupplyContentMemberResponse,
  PatchDownloadSearch,
  PatchDownloadResponse,
} from "../model/types";

// legacy supply_content.php — 제공컨텐츠 현황 목록(title_id desc, 30/page).
export const fetchSupplyContentList = (query: SupplyContentSearch) => {
  const searchParams: Record<string, string> = {};
  const set = (key: keyof SupplyContentSearch, value: string | number | undefined) => {
    if (value !== undefined && value !== "") {
      searchParams[key] = String(value);
    }
  };
  set("page", query.page);
  set("search_value", query.search_value);
  set("search_supply_content_type", query.search_supply_content_type);
  set("search_is_encode", query.search_is_encode);
  return apiClient.get<SupplyContentListResponse>("/admin/goods/supply-contents", { searchParams });
};

// legacy supply_content_member.php — 회원별 제공컨텐츠 조회(페이지네이션 없음).
export const fetchSupplyContentMember = (query: SupplyContentMemberSearch) => {
  const searchParams: Record<string, string> = {};
  if (query.search_key) {
    searchParams.search_key = query.search_key;
  }
  if (query.search_value) {
    searchParams.search_value = query.search_value;
  }
  return apiClient.get<SupplyContentMemberResponse>("/admin/goods/supply-contents/member", {
    searchParams,
  });
};

// legacy supply_content_download.php — 제공컨텐츠 다운로드 현황(idx desc, 50/page).
export const fetchPatchDownloadLog = (query: PatchDownloadSearch) => {
  const searchParams: Record<string, string> = {};
  const set = (key: keyof PatchDownloadSearch, value: string | number | undefined) => {
    if (value !== undefined && value !== "") {
      searchParams[key] = String(value);
    }
  };
  set("page", query.page);
  set("search_key", query.search_key);
  set("search_value", query.search_value);
  return apiClient.get<PatchDownloadResponse>("/admin/goods/supply-contents/download-log", {
    searchParams,
  });
};
