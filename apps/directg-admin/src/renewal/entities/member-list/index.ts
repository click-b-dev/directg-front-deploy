import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiClient } from "@shared/api/client";
import type { MemberListResponse, MemberListSearch } from "@entities/member";

// 리뉴얼 회원 내역 목록 — 기존 `GET /admin/member/list`에 `per_page`(페이지당 개수)를 더한 요청이다.
// legacy 목록은 30개 고정이었다 — docs/renewal/AD-Member-List-01.md 참조.
// 응답의 pagination은 서버가 확정한 값(current_page, total_results, total_pages)이다.
export type MemberListQuery = MemberListSearch & { per_page: number };

export const fetchMemberListPaged = (query: MemberListQuery) => {
  const searchParams: Record<string, string> = {
    page: String(query.page),
    per_page: String(query.per_page),
  };
  const setStr = (key: string, value: string) => {
    if (value !== "") searchParams[key] = value;
  };
  setStr("search_type", query.search_type);
  setStr("search_value", query.search_value);
  if (query.member_level > 0) searchParams.member_level = String(query.member_level);
  setStr("old_login", query.old_login);
  setStr("mailling", query.mailling);
  setStr("is_auth", query.is_auth);
  setStr("mem_type", query.mem_type);
  setStr("start_reg_date", query.start_reg_date);
  setStr("end_reg_date", query.end_reg_date);
  setStr("start_log_date", query.start_log_date);
  setStr("end_log_date", query.end_log_date);
  setStr("sort", query.sort);
  setStr("dir", query.dir);
  return apiClient.get<MemberListResponse>("/admin/member/list", { searchParams });
};

// 페이지·개수를 바꾸는 동안 이전 목록을 유지해 화면이 깜빡이지 않게 한다.
export const useMemberListPaged = (query: MemberListQuery) =>
  useQuery({
    queryKey: ["admin", "member", "list", "paged", query] as const,
    queryFn: () => fetchMemberListPaged(query),
    placeholderData: keepPreviousData,
  });
