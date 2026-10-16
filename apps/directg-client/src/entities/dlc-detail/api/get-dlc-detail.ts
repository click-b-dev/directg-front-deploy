import { cookies } from "next/headers";

import { apiClient } from "@shared/api/client";
import type { DlcDetailResponse } from "../model/types";

/**
 * DLC 상세 조회 (server-only, 세션 쿠키 전달 — wishlist_chk용).
 * `GET /api/game/dlc-detail?sku={goods_sku}` — legacy `pc/game/dlc_view.html`.
 */
export async function getDlcDetail(sku: string): Promise<DlcDetailResponse> {
  const cookieHeader = (await cookies()).toString();
  return apiClient.get<DlcDetailResponse>(`game/dlc-detail?sku=${encodeURIComponent(sku)}`, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}

/**
 * 홀로모델 DLC 상세 조회 (legacy `pc/game/holomodelsdlc_view.html`).
 * 데이터 계약은 dlc-detail과 동일(getGoodsItemDetailSku 계열) — 화면만 홀로모델 특화.
 */
export async function getHolomodelsDlcDetail(sku: string): Promise<DlcDetailResponse> {
  const cookieHeader = (await cookies()).toString();
  return apiClient.get<DlcDetailResponse>(
    `game/holomodelsdlc-detail?sku=${encodeURIComponent(sku)}`,
    { headers: cookieHeader ? { cookie: cookieHeader } : undefined },
  );
}
