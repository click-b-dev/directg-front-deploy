import { apiClient } from "@shared/api/client";
import type {
  GracListSearch,
  GracListResponse,
  GracEntnameListResponse,
  GracBatchRequest,
  GracActionResult,
  GracRegisterRequest,
} from "../model/types";

// legacy grac/grac_list.php — 심의정보 현황(rateddate desc, 50/page).
export const fetchGracList = (query: GracListSearch) => {
  const searchParams: Record<string, string> = {};
  const set = (key: keyof GracListSearch, value: string | number | undefined) => {
    if (value !== undefined && value !== "") {
      searchParams[key] = String(value);
    }
  };
  set("page", query.page);
  set("search_rateno", query.search_rateno);
  set("search_gametitle", query.search_gametitle);
  set("search_entname", query.search_entname);
  set("search_orgname", query.search_orgname);
  set("search_givenrate", query.search_givenrate);
  set("search_platform", query.search_platform);
  return apiClient.get<GracListResponse>("/admin/goods/grac", { searchParams });
};

// legacy grac/grac_batch.php — 심의정보 동기화 대상 심의업체 목록(페이징 없음).
export const fetchGracEntnameList = () =>
  apiClient.get<GracEntnameListResponse>("/admin/goods/grac/entname");

// legacy grac_ps.php mode=grac_batch — 심의정보 동기화(entname).
export const syncGracBatch = (payload: GracBatchRequest) =>
  apiClient.post<GracActionResult>("/admin/goods/grac/batch", payload);

// legacy grac_register.php + grac_ps.php mode=register — 심의정보 등록.
export const createGrac = (payload: GracRegisterRequest) =>
  apiClient.post<GracActionResult>("/admin/goods/grac", payload);
