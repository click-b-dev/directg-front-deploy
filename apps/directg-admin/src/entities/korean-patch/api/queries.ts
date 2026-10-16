import { useQuery } from "@tanstack/react-query";
import { fetchKoreanPatchList, fetchKoreanPatchAuth } from "./fetcher";
import type { KoreanPatchAuthSearch } from "../model/types";

const KOREAN_PATCH_KEY = ["admin", "goods", "korean-patches"] as const;

export const koreanPatchListQueryKey = () => [...KOREAN_PATCH_KEY, "list"] as const;

// legacy korean_patch.php — 한글패치 현황.
export const useKoreanPatchList = () =>
  useQuery({
    queryKey: koreanPatchListQueryKey(),
    queryFn: () => fetchKoreanPatchList(),
  });

export const koreanPatchAuthQueryKey = (query: KoreanPatchAuthSearch) =>
  [...KOREAN_PATCH_KEY, "auth", query] as const;

// legacy korean_patch_auth.php — 인증정보(비밀번호). search_m_id 있을 때만 조회.
export const useKoreanPatchAuth = (query: KoreanPatchAuthSearch) =>
  useQuery({
    queryKey: koreanPatchAuthQueryKey(query),
    queryFn: () => fetchKoreanPatchAuth(query),
    enabled: query.search_m_id !== "",
  });
