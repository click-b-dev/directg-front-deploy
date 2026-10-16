import { http, HttpResponse } from "msw";
import { env } from "@shared/config/env";
import type { MemberDashboard } from "@entities/member-dashboard";

const api = (path: string) => `${env.apiBaseUrl}${path}`;

// legacy member/dashboard_crm.php — read-only 집계 스냅샷. 실제 크로스DB SQL·세션 캐시는 백엔드.
// mock은 고정 지표(CRUD 아님). cached_at은 응답 시각(refresh 시 갱신 재현).
const buildDashboard = (): MemberDashboard => ({
  cached_at: Math.floor(Date.now() / 1000),
  summary: {
    total: 1234567,
    active_all: 1180000,
    pending: 340,
    leave_cnt: 54227,
    type_r: 4500,
    type_p: 1175067,
    type_s: 55000,
    lv1: 1150000,
    lv2: 78000,
    lv3: 6567,
    join_today: 142,
    join_week: 980,
    join_month: 4120,
    pending_today: 18,
    pending_week: 110,
    pending_month: 402,
    login_7: 52000,
    login_30: 210000,
    login_90: 430000,
    login_1y: 520000,
    login_never: 180000,
  },
  sns_rows: [
    { sns_type: "KAKAO", cnt: 96000 },
    { sns_type: "NAVER", cnt: 61000 },
    { sns_type: "PAYCO", cnt: 12500 },
  ],
  sns_total: 155000,
  mail_rows: [
    { gubun: "join", cnt: 320, fail: 4 },
    { gubun: "password", cnt: 88, fail: 1 },
    { gubun: "qna", cnt: 15, fail: 0 },
    { gubun: "event", cnt: 6, fail: 2 },
  ],
});

export const memberDashboardHandlers = [
  http.get(api("/admin/member/dashboard"), () => HttpResponse.json(buildDashboard())),
];
