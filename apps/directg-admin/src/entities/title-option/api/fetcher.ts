import { apiClient } from "@shared/api/client";
import type {
  AddOptionRequest,
  OptionCandidate,
  OptionMutationResponse,
  OptionSearchQuery,
  TitleOptions,
} from "../model/types";

// legacy title_option_register.php 로드 — 7개 카테고리 attached 옵션.
export const fetchTitleOptions = (titleId: number) =>
  apiClient.get<TitleOptions>(`/admin/goods/titles/${titleId}/options`);

// legacy title_ps.php option_{cat}_search — 옵션 후보(attached 제외).
export const searchOptions = (titleId: number, query: OptionSearchQuery) =>
  apiClient.get<OptionCandidate[]>(`/admin/goods/titles/${titleId}/option-search`, {
    searchParams: { category: query.category, value: query.value },
  });

// legacy title_ps.php option_{cat}_add — tbl_title_option INSERT.
export const addOption = (titleId: number, payload: AddOptionRequest) =>
  apiClient.post<OptionMutationResponse>(`/admin/goods/titles/${titleId}/options`, payload);

// legacy title_ps.php option_{cat}_delete — tbl_title_option DELETE.
export const deleteOption = (titleId: number, category: string, productCode: string) =>
  apiClient.del<OptionMutationResponse>(
    `/admin/goods/titles/${titleId}/options/${category}/${productCode}`,
  );
