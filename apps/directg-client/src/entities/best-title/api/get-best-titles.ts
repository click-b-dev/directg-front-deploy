import { apiClient } from "@shared/api/client";
import type { BestTitle } from "../model/types";

/** 인기게임 타이틀 목록(기본 12). `GET /api/main/best-titles` (백엔드 부재 시 MSW mock). */
export async function getBestTitles(limit = 12): Promise<BestTitle[]> {
  const { titles } = await apiClient.get<{ titles: BestTitle[] }>(
    `main/best-titles?limit=${limit}`,
  );
  return titles;
}
