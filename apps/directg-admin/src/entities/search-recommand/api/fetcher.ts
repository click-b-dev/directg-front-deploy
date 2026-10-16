import { apiClient } from "@shared/api/client";
import type {
  SearchRecommandListQuery,
  SearchRecommandModifyRequest,
  SearchRecommandMutationResponse,
  SearchRecommandResponse,
  SlotAssignRequest,
  SlotRegisterRequest,
} from "../model/types";

// legacy search_recommand.php — 슬롯 4칸 + 하단 목록(is_del='N', 20/page).
export const fetchSearchRecommands = (query: SearchRecommandListQuery) => {
  const searchParams: Record<string, string> = {};
  if (query.page) {
    searchParams.page = String(query.page);
  }
  if (query.search_keyword) {
    searchParams.search_keyword = query.search_keyword;
  }
  return apiClient.get<SearchRecommandResponse>("/admin/site/search-recommands", { searchParams });
};

// legacy mode=slot_register — 슬롯에 새 검색어 등록(기존 슬롯 비노출 + INSERT).
export const registerSearchRecommandSlot = (payload: SlotRegisterRequest) =>
  apiClient.post<SearchRecommandMutationResponse>("/admin/site/search-recommands", payload);

// legacy mode=modify — 검색어 내용 수정.
export const modifySearchRecommand = (idx: number, payload: SearchRecommandModifyRequest) =>
  apiClient.put<SearchRecommandMutationResponse>(`/admin/site/search-recommands/${idx}`, payload);

// legacy mode=slot_assign — 보관 검색어를 슬롯에 노출.
export const assignSearchRecommandSlot = (idx: number, payload: SlotAssignRequest) =>
  apiClient.post<SearchRecommandMutationResponse>(
    `/admin/site/search-recommands/${idx}/assign`,
    payload,
  );

// legacy mode=slot_clear — 슬롯 비우기(is_view='N').
export const clearSearchRecommandSlot = (idx: number) =>
  apiClient.post<SearchRecommandMutationResponse>(`/admin/site/search-recommands/${idx}/clear`);

// legacy mode=delete — 완전삭제(is_del='Y').
export const deleteSearchRecommand = (idx: number) =>
  apiClient.del<SearchRecommandMutationResponse>(`/admin/site/search-recommands/${idx}`);
