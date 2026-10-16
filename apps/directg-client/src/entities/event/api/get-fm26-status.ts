import { cookies } from "next/headers";

import { apiClient } from "@shared/api/client";
import type { Fm26Status } from "../model/fm26-types";

/**
 * 풋볼 매니저 26 이벤트 상태조회 (server-only, 세션 쿠키 전달). `GET /api/events/fm26/status` —
 * legacy `PurchaseEvent::chkEventOrderGoods_v2(38)` + `chkEventMemberLog(38)`. 하드코딩 m_no는 백엔드 verbatim.
 * 로그인 회원 전용(미로그인이면 호출하지 않음).
 */
export async function getFm26Status(): Promise<Fm26Status> {
  const cookieHeader = (await cookies()).toString();
  return apiClient.get<Fm26Status>("events/fm26/status", {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}
