import { apiClient } from "@shared/api/client";
import type { PromotionGroup } from "../model/types";

/** 활성 그룹 프로모션 목록. `GET /api/promotion/groups` (백엔드 부재 시 MSW mock). header 할인프로모션 드롭다운. */
export async function getPromotionGroups(): Promise<PromotionGroup[]> {
  const { groups } = await apiClient.get<{ groups: PromotionGroup[] }>("promotion/groups");
  return groups;
}
