import { apiClient } from "@shared/api/client";
import type { GenbaAvailabilityLogSearch, GenbaAvailabilityLogListResponse } from "../model/types";

// legacy AdminStock::getGenbaAvaliabilityLog — webhook_type='avaliability', reg_date desc, 20/page.
// 검색키 분기(search_sku=a.sku 등호 / search_name=b.item_name LIKE)는 백엔드.
export const fetchGenbaAvailabilityLogList = (query: GenbaAvailabilityLogSearch) => {
  const searchParams: Record<string, string> = {};
  const set = (key: keyof GenbaAvailabilityLogSearch, value: string | number | undefined) => {
    if (value !== undefined && value !== "") {
      searchParams[key] = String(value);
    }
  };
  set("page", query.page);
  set("search_key", query.search_key);
  set("search_value", query.search_value);
  return apiClient.get<GenbaAvailabilityLogListResponse>("/admin/goods/stock/genba-availability", {
    searchParams,
  });
};
