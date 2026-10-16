import { apiClient } from "@shared/api/client";
import type {
  KoreanPatchListResponse,
  KoreanPatchAuthSearch,
  KoreanPatchAuthResult,
} from "../model/types";

// legacy korean_patch.php — 한글패치 현황 전체 목록.
export const fetchKoreanPatchList = () =>
  apiClient.get<KoreanPatchListResponse>("/admin/goods/korean-patches");

// legacy korean_patch_auth.php — 인증 비밀번호 계산(patchEncDataAdmin).
export const fetchKoreanPatchAuth = (query: KoreanPatchAuthSearch) => {
  const searchParams: Record<string, string> = {};
  if (query.search_m_id) {
    searchParams.search_m_id = query.search_m_id;
  }
  if (query.prefix_text) {
    searchParams.prefix_text = query.prefix_text;
  }
  if (query.encode_type) {
    searchParams.encode_type = query.encode_type;
  }
  return apiClient.get<KoreanPatchAuthResult>("/admin/goods/korean-patches/auth", { searchParams });
};
