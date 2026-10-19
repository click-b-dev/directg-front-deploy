import { http, HttpResponse } from "msw";
import { env } from "@shared/config/env";

// 계정 잠금 mock — 새로고침 전까지 회원별 잠금 상태를 메모리에 유지한다(흐름 확인용).
const lockedByMember = new Map<string, boolean>();

export const memberLockHandlers = [
  http.get(`${env.apiBaseUrl}/admin/member/lock`, ({ request }) => {
    const m_no = new URL(request.url).searchParams.get("m_no") ?? "";
    return HttpResponse.json({ locked: lockedByMember.get(m_no) ?? false });
  }),
  http.post(`${env.apiBaseUrl}/admin/member/lock`, async ({ request }) => {
    const { m_no, locked } = (await request.json()) as { m_no: string; locked: boolean };
    lockedByMember.set(String(m_no), locked);
    return HttpResponse.json({ locked });
  }),
];
