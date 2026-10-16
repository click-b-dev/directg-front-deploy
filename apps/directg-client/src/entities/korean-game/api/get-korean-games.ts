import { apiClient } from "@shared/api/client";
import type { ProductThumb } from "@entities/product-thumb";

/** 음성 한국어지원 목록(기본 5). `GET /api/main/spoken-korean` (백엔드 부재 시 MSW mock). */
export async function getSpokenKoreanGames(limit = 5): Promise<ProductThumb[]> {
  const { games } = await apiClient.get<{ games: ProductThumb[] }>(
    `main/spoken-korean?limit=${limit}`,
  );
  return games;
}

/** 독점 한국어지원 목록(기본 5). `GET /api/main/exclusive-korean` (백엔드 부재 시 MSW mock). */
export async function getExclusiveKoreanGames(limit = 5): Promise<ProductThumb[]> {
  const { games } = await apiClient.get<{ games: ProductThumb[] }>(
    `main/exclusive-korean?limit=${limit}`,
  );
  return games;
}
