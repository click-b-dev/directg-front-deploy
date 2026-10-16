import { http, HttpResponse } from "msw";
import { env } from "@shared/config/env";

const api = (path: string) => `${env.apiBaseUrl}${path}`;

// legacy code/platform_list.php — 플랫폼 목록(getPlatformList).
const PLATFORM_LIST = [
  { idx: 1, platform: "Steam", flag: "Y" },
  { idx: 3, platform: "Origin", flag: "Y" },
  { idx: 30, platform: "Ubisoft Connect", flag: "Y" },
  { idx: 32, platform: "기타", flag: "Y" },
  { idx: 33, platform: "Bethesda", flag: "Y" },
  { idx: 34, platform: "Epic", flag: "Y" },
  { idx: 35, platform: "Rockstar Games Launcher", flag: "N" },
];

// legacy code/publisher_list.php — 공급처 목록(is_view='Y', publisher_name ASC).
const PUBLISHER_LIST = [
  {
    publisher_code: "NT",
    publisher_name: "Nintendo",
    is_view: "Y",
    publisher_site: "https://www.nintendo.com",
    publisher_image: "https://image.directg.net/publisher/nintendo.png",
    goods_count: 12,
  },
  {
    publisher_code: "LR",
    publisher_name: "Larian Studios",
    is_view: "Y",
    publisher_site: "https://larian.com",
    publisher_image: "",
    goods_count: 3,
  },
  {
    publisher_code: "SG",
    publisher_name: "SEGA",
    is_view: "Y",
    publisher_site: "https://www.sega.com",
    publisher_image: "https://image.directg.net/publisher/sega.png",
    goods_count: 27,
  },
  {
    publisher_code: "H2",
    publisher_name: "H2 Interactive",
    is_view: "N",
    publisher_site: "https://www.h2interactive.co.kr",
    publisher_image: "",
    goods_count: 8,
  },
];
const PER_PAGE_PUBLISHER = 30;

export const codeHandlers = [
  // legacy code/platform_list.php — 플랫폼 목록.
  http.get(api("/admin/code/platforms"), () => HttpResponse.json({ items: PLATFORM_LIST })),

  // legacy code/publisher_list.php — 공급처 목록.
  http.get(api("/admin/code/publishers"), ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
    const value = url.searchParams.get("search_value") ?? "";

    // base is_view='Y' + publisher_name LIKE, publisher_name ASC.
    let rows = PUBLISHER_LIST.filter((r) => r.is_view === "Y");
    if (value) {
      rows = rows.filter((r) => r.publisher_name.toLowerCase().includes(value.toLowerCase()));
    }
    rows = [...rows].sort((a, b) => a.publisher_name.localeCompare(b.publisher_name));

    const totalResults = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE_PUBLISHER));
    const start = (page - 1) * PER_PAGE_PUBLISHER;
    return HttpResponse.json({
      items: rows.slice(start, start + PER_PAGE_PUBLISHER),
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE_PUBLISHER,
        total_results: totalResults,
        total_pages: totalPages,
      },
    });
  }),

  // legacy publisher_ps.php mode=register — 공급처 등록(admin_level==99).
  http.post(api("/admin/code/publishers"), async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as { publisher_name?: string };
    return HttpResponse.json({
      success: true,
      message: `공급처가 등록되었습니다. (${body?.publisher_name ?? ""})`,
    });
  }),

  // legacy code/delivery_method.php — 배송방법 목록.
  http.get(api("/admin/code/delivery-methods"), () =>
    HttpResponse.json({ items: DELIVERY_METHOD_LIST }),
  ),
];

// legacy code/delivery_method.php — 배송방법(getDeliveryMethodList).
const DELIVERY_METHOD_LIST = [
  {
    DELIVERY_METHOD_ID: "STD",
    METHOD_NAME: "일반택배",
    DELIVERY_TYPE: "택배",
    BASE_FEE: 3000,
    FREE_THRESHOLD: 50000,
    IS_TRACKABLE: "Y",
    EXPECTED_DAYS: 2,
    CUT_OFF_TIME: "14:00",
    AREA_SURCHARGE_YN: "Y",
    RETURN_FEE: 3000,
    USE_YN: "Y",
  },
  {
    DELIVERY_METHOD_ID: "EXP",
    METHOD_NAME: "특급배송",
    DELIVERY_TYPE: "택배",
    BASE_FEE: 5000,
    FREE_THRESHOLD: 100000,
    IS_TRACKABLE: "Y",
    EXPECTED_DAYS: 1,
    CUT_OFF_TIME: "12:00",
    AREA_SURCHARGE_YN: "Y",
    RETURN_FEE: 5000,
    USE_YN: "Y",
  },
  {
    DELIVERY_METHOD_ID: "CODE",
    METHOD_NAME: "디지털코드",
    DELIVERY_TYPE: "이메일",
    BASE_FEE: 0,
    FREE_THRESHOLD: 0,
    IS_TRACKABLE: "N",
    EXPECTED_DAYS: 0,
    CUT_OFF_TIME: "-",
    AREA_SURCHARGE_YN: "N",
    RETURN_FEE: 0,
    USE_YN: "Y",
  },
];
