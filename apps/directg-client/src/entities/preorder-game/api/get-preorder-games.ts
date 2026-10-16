import { apiClient } from "@shared/api/client";
import type { ProductThumb } from "@entities/product-thumb";

/** 예약구매 목록(기본 30). `GET /api/main/preorder-games` (백엔드 부재 시 MSW mock). */
export async function getPreorderGames(limit = 30): Promise<ProductThumb[]> {
  const { games } = await apiClient.get<{ games: ProductThumb[] }>(
    `main/preorder-games?limit=${limit}`,
  );
  return games;
}
