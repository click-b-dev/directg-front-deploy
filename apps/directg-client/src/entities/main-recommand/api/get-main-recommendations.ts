import { apiClient } from "@shared/api/client";
import type { MainRecommand } from "../model/types";

/** 추천·특집 목록. `GET /api/main/recommendations` (백엔드 부재 시 MSW mock). */
export async function getMainRecommendations(): Promise<MainRecommand[]> {
  const { recommendations } = await apiClient.get<{ recommendations: MainRecommand[] }>(
    "main/recommendations",
  );
  return recommendations;
}
