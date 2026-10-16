import { cookies } from "next/headers";

import { apiClient } from "@shared/api/client";
import type { SettleInit } from "../model/types";

/**
 * 결제하기 초기 데이터 (server-only, 세션 쿠키). `GET /api/order/settle-init` —
 * legacy getSettleNo + getOrderItemList(선택) + getMemberEmoney(dgkr) + buyr fallback + 포인트 검증.
 * 항목 0건이면 라우트에서 cart redirect.
 */
export async function getSettleInit(params: {
  settle_kind: string;
  use_emoney: string;
  emoney_chk: string;
}): Promise<SettleInit> {
  const cookieHeader = (await cookies()).toString();
  const qs = new URLSearchParams(params).toString();
  return apiClient.get<SettleInit>(`order/settle-init?${qs}`, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}
