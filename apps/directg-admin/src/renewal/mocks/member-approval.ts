import { http, HttpResponse } from "msw";
import { env } from "@shared/config/env";

// 가입 승인 mock — legacy `status`(5=승인대기)를 흉내 낸다. 시드는 기존 회원 mock에서 is_auth가 "N"인 3명이다.
// 수동 승인(POST /admin/member/apply)하면 새로고침 전까지 승인 상태(0)를 유지한다(흐름 확인용).
const pending = new Set<string>(["100229", "100228", "100225"]);

export const memberApprovalHandlers = [
  http.get(`${env.apiBaseUrl}/admin/member/status`, ({ request }) => {
    const ids = (new URL(request.url).searchParams.get("m_no") ?? "").split(",").filter(Boolean);
    return HttpResponse.json({
      statuses: Object.fromEntries(ids.map((id) => [id, pending.has(id) ? 5 : 0])),
    });
  }),
  // 기존 legacy apply mock(항상 success)보다 먼저 등록해 승인 상태를 반영한다.
  http.post(`${env.apiBaseUrl}/admin/member/apply`, async ({ request }) => {
    const { m_no } = (await request.json()) as { m_no: number };
    pending.delete(String(m_no));
    return HttpResponse.json({ success: true });
  }),
];
