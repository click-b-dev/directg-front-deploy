import { http, HttpResponse } from "msw";
import { env } from "@shared/config/env";

const api = (path: string) => `${env.apiBaseUrl}${path}`;

// legacy genba_publisher.php — getGenbaPublisherList(): select publisher,status.
// cc(sku수)는 SELECT되지 않음 → 응답에 미포함(프론트도 빈칸/합계 0).
const GENBA_PUBLISHER_LIST = [
  { publisher: "Bandai Namco", status: "Y" },
  { publisher: "Capcom", status: "Y" },
  { publisher: "Koei Tecmo", status: "N" },
  { publisher: "Sega", status: "Y" },
  { publisher: "Square Enix", status: "N" },
];

// legacy genba_title.php — genba_title(is_krw='N'). ReleaseDate는 +9h 적용된 표시 문자열.
const GENBA_TITLE_LIST = [
  {
    ProductID: "GEN-100234",
    Name: "Elden Ring: Nightreign",
    Publisher: "Bandai Namco",
    ReleaseDate: "2026-05-30 09:00:00",
    EtailerSplitPercentage: "12.5",
    is_krw: "N",
    batch_date: "2026-07-23 04:10:00",
  },
  {
    ProductID: "GEN-100511",
    Name: "Monster Hunter Wilds",
    Publisher: "Capcom",
    ReleaseDate: "2026-02-28 09:00:00",
    EtailerSplitPercentage: "15.0",
    is_krw: "N",
    batch_date: "2026-07-23 04:10:00",
  },
  {
    ProductID: "GEN-100777",
    Name: "Like a Dragon: Pirate Yakuza in Hawaii",
    Publisher: "Sega",
    ReleaseDate: "2026-02-21 09:00:00",
    EtailerSplitPercentage: "13.0",
    is_krw: "N",
    batch_date: "2026-07-22 04:10:00",
  },
];
const PER_PAGE_TITLE = 50;

// getGenbaTitlePublisher() — distinct Publisher(select 옵션, publisher asc).
const GENBA_TITLE_PUBLISHERS = [
  { Publisher: "Bandai Namco" },
  { Publisher: "Capcom" },
  { Publisher: "Sega" },
];

// legacy genba_product_sync.php — genba_catalogue + genba_price. 날짜는 +9h 표시 문자열.
const GENBA_PRODUCT_LIST = [
  {
    ProductID: "GEN-100234",
    Sku: "SKU-EN-0001",
    Name: "Elden Ring: Nightreign",
    IsBundle: "",
    Publisher: "Bandai Namco",
    RegionCode: "eu",
    ReleaseDate: "2026-05-30 09:00:00",
    DigitalReleaseDate: "2026-05-30 09:00:00",
    EndDate: "2026-01-01 09:00:00",
    PreReleaseDate: "2026-05-23 09:00:00",
    is_presale_available: false,
    row_danger: true,
    Srp: 59000,
    Wsp: 41300.5,
    EtailerSplitPercentage: "12.5",
    PreLiveState: "0",
    StockStatus: "1",
  },
  {
    ProductID: "GEN-100511",
    Sku: "SKU-MH-0002",
    Name: "Monster Hunter Wilds",
    IsBundle: "",
    Publisher: "Capcom",
    RegionCode: "ww",
    ReleaseDate: "2026-02-28 09:00:00",
    DigitalReleaseDate: "2026-02-28 09:00:00",
    EndDate: "1970-01-01 09:00:00",
    PreReleaseDate: "1970-01-01 09:00:00",
    is_presale_available: false,
    row_danger: false,
    Srp: 72000,
    Wsp: 50400.0,
    EtailerSplitPercentage: "15.0",
    PreLiveState: "1",
    StockStatus: "0",
  },
  {
    ProductID: "GEN-100777",
    Sku: "SKU-LD-0003",
    Name: "Like a Dragon: Pirate Yakuza in Hawaii",
    IsBundle: "",
    Publisher: "Sega",
    RegionCode: "eu",
    ReleaseDate: "2026-09-21 09:00:00",
    DigitalReleaseDate: "2026-09-21 09:00:00",
    EndDate: "1970-01-01 09:00:00",
    PreReleaseDate: "2026-07-01 09:00:00",
    is_presale_available: true,
    row_danger: false,
    Srp: 66000,
    Wsp: 46200.0,
    EtailerSplitPercentage: "13.0",
    PreLiveState: "2",
    StockStatus: "1",
  },
];
const PER_PAGE_PRODUCT = 50;

// legacy genba_promotion_sync.php — genba_promotion(group by PromotionId). 날짜는 +9h 표시 문자열.
const GENBA_PROMOTION_LIST = [
  {
    PromotionId: "GP-2026-0801",
    Name: "Summer Publisher Sale",
    fromDate: "2026-08-01 09:00:00",
    toDate: "2026-08-14 09:00:00",
    cc: 42,
  },
  {
    PromotionId: "GP-2026-0810",
    Name: "Capcom Weekend Deal",
    fromDate: "2026-08-10 09:00:00",
    toDate: "2026-08-17 09:00:00",
    cc: 12,
  },
];

export const genbaHandlers = [
  // legacy genba_ping.php — Genba 연결 확인(runGenbaPingAsync 원시 결과).
  http.get(api("/admin/genba/ping"), () =>
    HttpResponse.json({
      success: true,
      status: "OK",
      message: "pong",
      endpoint: "https://api.genba.com/v2/ping",
      server_time: "2026-07-23 03:00:00",
      latency_ms: 58,
    }),
  ),

  // legacy genba_publisher.php — Genba 퍼블리셔 현황(publisher asc).
  http.get(api("/admin/genba/publishers"), () =>
    HttpResponse.json({ items: GENBA_PUBLISHER_LIST }),
  ),

  // legacy genba_ps.php publisher_config — 퍼블리셔 status 토글(print_r 덤프 반환).
  http.post(api("/admin/genba/publisher-config"), async ({ request }) => {
    const b = (await request.json().catch(() => ({}))) as {
      publisher?: string;
      status?: string;
    };
    const message = `Array\n(\n    [:publisher] => ${b?.publisher ?? ""}\n    [:status] => ${b?.status ?? ""}\n)\n`;
    return HttpResponse.json({ message });
  }),

  // legacy genba_title.php — Genba 타이틀 현황(is_krw='N', 50/page).
  http.get(api("/admin/genba/titles"), ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
    const productId = url.searchParams.get("search_product_id") || "";
    const publisher = url.searchParams.get("search_publisher") || "";
    const name = url.searchParams.get("search_name") || "";

    let rows = GENBA_TITLE_LIST;
    if (productId) {
      rows = rows.filter((r) => r.ProductID === productId);
    }
    if (publisher) {
      rows = rows.filter((r) => r.Publisher === publisher);
    }
    if (name) {
      // legacy: a.Name Regexp
      const re = new RegExp(name, "i");
      rows = rows.filter((r) => re.test(r.Name));
    }

    const totalResults = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE_TITLE));
    const start = (page - 1) * PER_PAGE_TITLE;
    return HttpResponse.json({
      items: rows.slice(start, start + PER_PAGE_TITLE),
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE_TITLE,
        total_results: totalResults,
        total_pages: totalPages,
      },
    });
  }),

  // legacy getGenbaTitlePublisher() — Publisher select 옵션.
  http.get(api("/admin/genba/title-publishers"), () =>
    HttpResponse.json({ items: GENBA_TITLE_PUBLISHERS }),
  ),

  // legacy genba_api.php api_type=price — 개별 가격 동기화.
  http.post(api("/admin/genba/price-sync"), async ({ request }) => {
    const b = (await request.json().catch(() => ({}))) as { productid?: string };
    return HttpResponse.json({ message: `가격 동기화 완료 (${b?.productid ?? ""})` });
  }),

  // legacy genba_api.php api_type=product — 전체 상품 동기화.
  http.post(api("/admin/genba/product-sync"), () =>
    HttpResponse.json({ message: "Genba 상품 동기화 완료" }),
  ),

  // legacy genba_product_sync.php — Genba 상품 관리(50/page).
  http.get(api("/admin/genba/products"), ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
    const productId = url.searchParams.get("search_product_id") || "";
    const sku = url.searchParams.get("search_sku") || "";
    const name = url.searchParams.get("search_name") || "";
    const publisher = url.searchParams.get("search_publisher") || "";
    const preLiveState = url.searchParams.get("PreLiveState") || "";

    let rows = GENBA_PRODUCT_LIST;
    if (productId) {
      rows = rows.filter((r) => r.ProductID === productId);
    }
    if (sku) {
      rows = rows.filter((r) => r.Sku === sku);
    }
    if (name) {
      const re = new RegExp(name, "i");
      rows = rows.filter((r) => re.test(r.Name));
    }
    if (publisher) {
      const re = new RegExp(publisher, "i");
      rows = rows.filter((r) => re.test(r.Publisher));
    }
    if (preLiveState) {
      rows = rows.filter((r) => r.PreLiveState === preLiveState);
    }

    const totalResults = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE_PRODUCT));
    const start = (page - 1) * PER_PAGE_PRODUCT;
    return HttpResponse.json({
      items: rows.slice(start, start + PER_PAGE_PRODUCT),
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE_PRODUCT,
        total_results: totalResults,
        total_pages: totalPages,
      },
    });
  }),

  // legacy genba_api.php api_type=product_sync — 개별 상품 동기화.
  http.post(api("/admin/genba/product-sync-item"), async ({ request }) => {
    const b = (await request.json().catch(() => ({}))) as { sku?: string };
    return HttpResponse.json({ message: `상품 동기화 완료 (${b?.sku ?? ""})` });
  }),

  // legacy genba_api.php api_type=stock — 재고 확인.
  http.post(api("/admin/genba/stock-sync"), async ({ request }) => {
    const b = (await request.json().catch(() => ({}))) as { sku?: string };
    return HttpResponse.json({ message: `재고 확인 완료 (${b?.sku ?? ""})` });
  }),

  // legacy genba_api.php api_type=prelive — pre-live 요청.
  http.post(api("/admin/genba/prelive-request"), async ({ request }) => {
    const b = (await request.json().catch(() => ({}))) as { sku?: string };
    return HttpResponse.json({ message: `pre-live 요청 완료 (${b?.sku ?? ""})` });
  }),

  // legacy genba_promotion_sync.php — Genba 프로모션 조회(상태별 50/20).
  http.get(api("/admin/genba/promotions"), ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
    const status = url.searchParams.get("promotion_status") || "Scheduled";
    // legacy: Completed만 20/page, 그 외 50/page.
    const perPage = status === "Completed" ? 20 : 50;

    const rows = GENBA_PROMOTION_LIST;
    const totalResults = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / perPage));
    const start = (page - 1) * perPage;
    return HttpResponse.json({
      items: rows.slice(start, start + perPage),
      pagination: {
        current_page: page,
        results_per_page: perPage,
        total_results: totalResults,
        total_pages: totalPages,
      },
    });
  }),

  // legacy genba_api.php api_type=promotion — 프로모션 동기화.
  http.post(api("/admin/genba/promotion-sync"), () =>
    HttpResponse.json({ message: "Genba 프로모션 동기화 완료" }),
  ),
];
