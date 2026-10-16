import { cookies } from "next/headers";

import { apiClient } from "@shared/api/client";
import type { ProductFilterParams } from "@entities/promotion-ing";
import type { GroupResponse } from "../model/types";

/**
 * 번들/그룹 목록 조회 (server-only, 세션 쿠키 전달 — 관리자 미리보기·wishlist_chk 판정).
 * `GET /api/game/group?idx=X&page=N&{필터}` — legacy `tbl_group`(use_flag/기간/관리자 세션 판정) +
 * `Goods::getGoodsGroupList`(tbl_group_item b.group_idx=idx), 60/page. 접근 판정/필터/정렬은 백엔드.
 */
export async function getGameGroupList(
  idx: string,
  page: number,
  filters: ProductFilterParams = {},
): Promise<GroupResponse> {
  const params = new URLSearchParams({ idx, page: String(page) });
  for (const [key, value] of Object.entries(filters)) {
    if (value) {
      params.set(key, value);
    }
  }
  const cookieHeader = (await cookies()).toString();
  return apiClient.get<GroupResponse>(`game/group?${params.toString()}`, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}
