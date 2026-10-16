import { apiClient } from "@shared/api/client";
import type { SearchRecommendation } from "../model/types";

/** 추천 검색어 슬롯(최대 4). `GET /api/search/recommendations` (백엔드 부재 시 MSW mock). header 검색바 하단. */
export async function getSearchRecommendations(): Promise<SearchRecommendation[]> {
  const { keywords } = await apiClient.get<{ keywords: SearchRecommendation[] }>(
    "search/recommendations",
  );
  return keywords;
}
