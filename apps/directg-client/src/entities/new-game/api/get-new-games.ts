import { apiClient } from "@shared/api/client";
import type { ProductThumb } from "@entities/product-thumb";

/** 신규게임 목록(기본 8). `GET /api/main/new-games` (백엔드 부재 시 MSW mock). */
export async function getNewGames(limit = 8): Promise<ProductThumb[]> {
  const { games } = await apiClient.get<{ games: ProductThumb[] }>(`main/new-games?limit=${limit}`);
  return games;
}
