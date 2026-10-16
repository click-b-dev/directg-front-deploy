import { apiClient } from "@shared/api/client";
import type {
  CreateMainRecommandRequest,
  MainRecommandDetail,
  MainRecommandListQuery,
  MainRecommandListResponse,
  RecommandMutationResponse,
  RecommandSortDirection,
  UpdateMainRecommandRequest,
} from "../model/types";

// legacy AdminSite::getMainRecommandList — is_del='N', order recommand_sort asc, page당 20.
// 검색: recommand_name LIKE(개발자 지시로 legacy 파라미터 불일치 버그 수정).
export const fetchMainRecommandList = (query: MainRecommandListQuery) => {
  const searchParams: Record<string, string> = {};
  if (query.page) {
    searchParams.page = String(query.page);
  }
  if (query.search_recommand_name) {
    searchParams.search_recommand_name = query.search_recommand_name;
  }
  return apiClient.get<MainRecommandListResponse>("/admin/site/main-recommands", { searchParams });
};

// legacy main_recommand_ps.php recommand_sort_up/down — recommand_sort만 ±1(swap 아님).
export const sortMainRecommand = (idx: number, direction: RecommandSortDirection) =>
  apiClient.post<RecommandMutationResponse>(`/admin/site/main-recommands/${idx}/sort`, {
    direction,
  });

// legacy main_recommand_ps.php delete — 소프트 삭제(is_del='Y').
export const deleteMainRecommand = (idx: number) =>
  apiClient.del<RecommandMutationResponse>(`/admin/site/main-recommands/${idx}`);

// legacy main_recommand_ps.php register — INSERT tbl_main_recommand.
export const createMainRecommand = (payload: CreateMainRecommandRequest) =>
  apiClient.post<RecommandMutationResponse>("/admin/site/main-recommands", payload);

// legacy main_recommand_modify.php: select * where idx — 폼 프리필용 단건.
export const fetchMainRecommand = (idx: number) =>
  apiClient.get<MainRecommandDetail>(`/admin/site/main-recommands/${idx}`);

// legacy main_recommand_ps.php modify — UPDATE tbl_main_recommand WHERE idx.
export const updateMainRecommand = (idx: number, payload: UpdateMainRecommandRequest) =>
  apiClient.put<RecommandMutationResponse>(`/admin/site/main-recommands/${idx}`, payload);
