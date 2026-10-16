import { http, HttpResponse } from "msw";
import { env } from "@shared/config/env";

const api = (path: string) => `${env.apiBaseUrl}${path}`;

// legacy goods/group/group_list.php — 그룹 현황(getGroupList). start/end는 unix(초).
// 색상 시연: 진행중(start<now<end)/종료(now>end)/예정(now<start) — 기준 2026-07 전후.
const GROUP_LIST = [
  {
    idx: 12,
    type: "1",
    subject: "여름 프로모션",
    start_date: 1782864000, // 2026-07-01
    end_date: 1788134400, // 2026-08-31
    use_flag: "Y",
    pc_banner_url: "https://image.directg.net/banner/summer_pc.jpg",
    banner_url: "https://image.directg.net/banner/summer_mo.jpg",
  },
  {
    idx: 11,
    type: "2",
    subject: "5월 타임딜 특가",
    start_date: 1777680000, // 2026-05-01
    end_date: 1782777600, // 2026-06-30
    use_flag: "Y",
    pc_banner_url: "https://image.directg.net/banner/may_pc.jpg",
    banner_url: "",
  },
  {
    idx: 10,
    type: "3",
    subject: "젤다 프랜차이즈",
    start_date: 1788307200, // 2026-09-01
    end_date: 1791763200, // 2026-10-11
    use_flag: "N",
    pc_banner_url: "",
    banner_url: "",
  },
];

export const goodsGroupHandlers = [
  // legacy goods/group/group_list.php — 그룹 목록.
  http.get(api("/admin/goods/groups"), () => HttpResponse.json({ items: GROUP_LIST })),
];
