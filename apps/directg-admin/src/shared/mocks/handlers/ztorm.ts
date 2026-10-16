import { http, HttpResponse } from "msw";
import { env } from "@shared/config/env";

const api = (path: string) => `${env.apiBaseUrl}${path}`;

// legacy ztorm_publisher_list.php — Ztorm 퍼블리셔(getZtormPublisher).
const ZTORM_PUBLISHER_LIST = [
  { publisher_id: "ZP-1001", publisher_name: "Paradox Interactive", cc: 42 },
  { publisher_id: "ZP-1002", publisher_name: "Focus Entertainment", cc: 18 },
  { publisher_id: "ZP-1003", publisher_name: "THQ Nordic", cc: 27 },
  { publisher_id: "ZP-1004", publisher_name: "Kalypso Media", cc: 9 },
];

// legacy ztorm_catalogue.php — Ztorm 카탈로그(ztorm_catalogue). 날짜는 unix초.
const ZTORM_CATALOGUE_LIST = [
  {
    ProductID: "ZT-500123",
    RegionTag: "EU",
    name: "Cities: Skylines II",
    publisher_id: "ZP-1001",
    publisher_name: "Paradox Interactive",
    status: "OnSale",
    OrderDate: 1782864000,
    download_date: 1782864000,
    release_date: 1782864000,
    rrp: 59000,
  },
  {
    ProductID: "ZT-500456",
    RegionTag: "WW",
    name: "A Plague Tale: Requiem",
    publisher_id: "ZP-1002",
    publisher_name: "Focus Entertainment",
    status: "OnSale",
    download_date: 1780000000,
    OrderDate: 1780000000,
    release_date: 1780000000,
    rrp: 49000,
  },
  {
    ProductID: "ZT-500789",
    RegionTag: "EU",
    name: "Titan Quest II",
    publisher_id: "ZP-1003",
    publisher_name: "THQ Nordic",
    status: "ComingSoon",
    OrderDate: 1788307200,
    download_date: 0,
    release_date: 1788307200,
    rrp: 45000,
  },
];
const PER_PAGE_CATALOGUE = 50;

// legacy ztorm_promotion.php — Ztorm 프로모션(getZtormPromotion).
const ZTORM_PROMOTION_LIST = [
  {
    product_code: "DG-G-1006",
    product_name: "발더스 게이트 3",
    item_id: "ZT-500123",
    item_name: "Baldur's Gate 3",
    item_publisher: "Larian Studios",
    product_srp: 66000,
    percent: 20,
    promotion_start: "2026-08-01",
    promotion_end: "2026-08-14",
  },
  {
    product_code: "DG-G-3010",
    product_name: "시티즈 스카이라인 II",
    item_id: "ZT-500789",
    item_name: "Cities: Skylines II",
    item_publisher: "Paradox Interactive",
    product_srp: 59000,
    percent: 35,
    promotion_start: "2026-07-25",
    promotion_end: "2026-08-05",
  },
];
const PER_PAGE_PROMOTION = 50;

export const ztormHandlers = [
  // legacy ztorm_ping.php — Ztorm 연결 확인(runPing 원시 결과).
  http.get(api("/admin/ztorm/ping"), () =>
    HttpResponse.json({
      success: true,
      status: "OK",
      message: "pong",
      endpoint: "https://api.ztorm.com/v1/ping",
      server_time: "2026-07-23 03:00:00",
      latency_ms: 42,
    }),
  ),

  // legacy ztorm_publisher_list.php — Ztorm 퍼블리셔 현황.
  http.get(api("/admin/ztorm/publishers"), () =>
    HttpResponse.json({ items: ZTORM_PUBLISHER_LIST }),
  ),

  // legacy ztorm_catalogue.php — Ztorm 카탈로그 현황.
  http.get(api("/admin/ztorm/catalogue"), ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
    const rows = [...ZTORM_CATALOGUE_LIST].sort((a, b) => b.release_date - a.release_date);
    const totalResults = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE_CATALOGUE));
    const start = (page - 1) * PER_PAGE_CATALOGUE;
    return HttpResponse.json({
      items: rows.slice(start, start + PER_PAGE_CATALOGUE),
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE_CATALOGUE,
        total_results: totalResults,
        total_pages: totalPages,
      },
    });
  }),

  // legacy ztorm_api.php rrp_search — RRP 조회.
  http.post(api("/admin/ztorm/rrp-search"), async ({ request }) => {
    const b = (await request.json().catch(() => ({}))) as { zt_item_id?: string };
    return HttpResponse.json({ success: true, message: `RRP 조회 완료 (${b?.zt_item_id ?? ""})` });
  }),

  // legacy ztorm_api.php product_add — Ztorm 상품 등록.
  http.post(api("/admin/ztorm/products"), async ({ request }) => {
    const b = (await request.json().catch(() => ({}))) as { zt_item_id?: string };
    return HttpResponse.json({
      success: true,
      message: `Ztorm 상품 등록 완료 (${b?.zt_item_id ?? ""})`,
    });
  }),

  // legacy ztorm_promotion.php — Ztorm 프로모션 현황.
  http.get(api("/admin/ztorm/promotions"), ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
    const rows = ZTORM_PROMOTION_LIST;
    const totalResults = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE_PROMOTION));
    const start = (page - 1) * PER_PAGE_PROMOTION;
    return HttpResponse.json({
      items: rows.slice(start, start + PER_PAGE_PROMOTION),
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE_PROMOTION,
        total_results: totalResults,
        total_pages: totalPages,
      },
    });
  }),

  // legacy ztorm_api.php promotion — 캠페인 동기화.
  http.post(api("/admin/ztorm/promotion-sync"), () =>
    HttpResponse.json({ success: true, message: "Ztorm 캠페인 동기화 완료" }),
  ),
];
