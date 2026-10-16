import { http, HttpResponse } from "msw";
import { env } from "@shared/config/env";
import type {
  StatOrderDayItem,
  StatOrderMonthItem,
  StatOrderTitleItem,
  StatGoodsPriceRow,
  StatGoodsDayRow,
  StatGoodsPromotionRow,
  StatPublisherRow,
  StatGoodsPublisherRow,
  StatSalesDayRow,
  StatTitleRankingRow,
  StatMetacriticRow,
  StatAssetDayRow,
  StatZtormDayRow,
  StatGenbaDayRow,
  StatGenbaPublisherRow,
  StatVaultnDayRow,
  StatVaultnMonthCompareRow,
  StatHolomodelsRow,
  StatSalesDayCountRow,
  StatSalesMonthCountRow,
  StatSalesPgCountRow,
  StatPromotionReportRow,
  StatPromotionReportSupplier,
} from "@entities/statistics";

const api = (path: string) => `${env.apiBaseUrl}${path}`;

const pad2 = (n: number) => String(n).padStart(2, "0");

// legacy statistics/order/order_day_count.php — tbl_sales group by ord_ymd/is_preorder/is_promotion
// + tbl_sales_log batch_date. sparse: 판매 있는 일자만. 아래 fixture는 요청 연·월 기준으로 몇 개 일자만 채운다.
const buildDayItem = (
  ordYmd: string,
  preorder: [number, number],
  normal: [number, number],
  promotion: [number, number],
  batchDate: string,
): StatOrderDayItem => {
  const totalCount = preorder[0] + normal[0] + promotion[0];
  const totalPrice = preorder[1] + normal[1] + promotion[1];
  return {
    ord_ymd: ordYmd,
    preorder: { total_count: preorder[0], total_price: preorder[1] },
    normal: { total_count: normal[0], total_price: normal[1] },
    promotion: { total_count: promotion[0], total_price: promotion[1] },
    total_count: totalCount,
    total_price: totalPrice,
    batch_date: batchDate,
  };
};

export const statisticsHandlers = [
  // GET /admin/statistics/order/day-count?search_year=&search_month=
  http.get(api("/admin/statistics/order/day-count"), ({ request }) => {
    const url = new URL(request.url);
    const now = new Date();
    const year = url.searchParams.get("search_year") || String(now.getFullYear());
    const month = url.searchParams.get("search_month") || pad2(now.getMonth() + 1);
    const d = (dd: number) => `${year}-${month}-${pad2(dd)}`;

    const days: StatOrderDayItem[] = [
      buildDayItem(d(1), [2, 118000], [15, 892000], [4, 156000], `${year}-${month}-02 03:10:22`),
      buildDayItem(d(5), [0, 0], [23, 1340500], [8, 412000], `${year}-${month}-06 03:11:05`),
      buildDayItem(d(15), [5, 295000], [31, 1875000], [0, 0], `${year}-${month}-16 03:09:48`),
      buildDayItem(d(20), [1, 62000], [9, 528000], [12, 634000], ""),
    ];

    return HttpResponse.json({ search_year: year, search_month: month, days });
  }),

  // POST /admin/statistics/order/day-count/batch — legacy order_count_batch.php mode=batch_day.
  http.post(api("/admin/statistics/order/day-count/batch"), () =>
    HttpResponse.json({ success: true }),
  ),

  // GET /admin/statistics/order/month-count?search_year= — legacy order_month_count.php(선택 연도 12개월).
  http.get(api("/admin/statistics/order/month-count"), ({ request }) => {
    const url = new URL(request.url);
    const now = new Date();
    const year = url.searchParams.get("search_year") || String(now.getFullYear());
    const m = (mm: number) => `${year}-${pad2(mm)}`;

    const buildMonth = (
      mm: number,
      preorder: [number, number],
      normal: [number, number],
      promotion: [number, number],
    ): StatOrderMonthItem => ({
      order_month: m(mm),
      preorder: { total_count: preorder[0], total_price: preorder[1] },
      normal: { total_count: normal[0], total_price: normal[1] },
      promotion: { total_count: promotion[0], total_price: promotion[1] },
      total_count: preorder[0] + normal[0] + promotion[0],
      total_price: preorder[1] + normal[1] + promotion[1],
    });

    const months: StatOrderMonthItem[] = [
      buildMonth(1, [12, 720000], [480, 28800000], [95, 4180000]),
      buildMonth(2, [8, 496000], [512, 30720000], [110, 4620000]),
      buildMonth(3, [0, 0], [603, 37386000], [88, 3872000]),
      buildMonth(6, [21, 1281000], [745, 46190000], [132, 6072000]),
      buildMonth(8, [5, 310000], [389, 23340000], [61, 2745000]),
    ];

    return HttpResponse.json({ search_year: year, months });
  }),

  // GET /admin/statistics/order/title-count?search_year=&search_month= — legacy order_title_count.php.
  http.get(api("/admin/statistics/order/title-count"), ({ request }) => {
    const url = new URL(request.url);
    const now = new Date();
    const year = url.searchParams.get("search_year") || String(now.getFullYear());
    const month = url.searchParams.get("search_month") ?? "";

    const buildTitle = (
      titleId: string,
      titleName: string,
      game: [number, number],
      edition: [number, number],
      dlc: [number, number],
    ): StatOrderTitleItem => ({
      title_id: titleId,
      title_name: titleName,
      game: { total_count: game[0], total_price: game[1] },
      edition: { total_count: edition[0], total_price: edition[1] },
      dlc: { total_count: dlc[0], total_price: dlc[1] },
      sales_count: game[0] + edition[0] + dlc[0],
      sales_price: game[1] + edition[1] + dlc[1],
    });

    // 백엔드 정렬(sales_price DESC, sales_count DESC) 재현된 fixture.
    const titles: StatOrderTitleItem[] = [
      buildTitle("100234", "엘든 링", [820, 49200000], [120, 9600000], [340, 6800000]),
      buildTitle("100118", "발더스 게이트 3", [610, 42700000], [0, 0], [95, 1900000]),
      buildTitle("100452", "몬스터 헌터 와일즈", [540, 37800000], [88, 7040000], [12, 240000]),
      buildTitle("100077", "사이버펑크 2077", [430, 21500000], [0, 0], [210, 8400000]),
    ];

    return HttpResponse.json({ search_year: year, search_month: month, titles });
  }),

  // POST /admin/statistics/order/title-count/best-save — legacy title_order_ps.php best_game_save.
  http.post(api("/admin/statistics/order/title-count/best-save"), () =>
    HttpResponse.json({ success: true }),
  ),

  // GET /admin/statistics/order/goods-count/suppliers — legacy getSalesSupplierList.
  http.get(api("/admin/statistics/order/goods-count/suppliers"), () =>
    HttpResponse.json({
      suppliers: [
        { publisher_code: "1001", publisher_name: "Electronic Arts" },
        { publisher_code: "1002", publisher_name: "Ubisoft" },
        { publisher_code: "1003", publisher_name: "반다이남코 (예전DB)" },
        { publisher_code: "1004", publisher_name: "Capcom" },
      ],
    }),
  ),

  // GET /admin/statistics/order/goods-count/products?q=&supplier_code= — legacy ajax_sales_product.php.
  http.get(api("/admin/statistics/order/goods-count/products"), ({ request }) => {
    const url = new URL(request.url);
    const q = (url.searchParams.get("q") ?? "").trim();
    const all = [
      { id: "DG10001", text: "[DG10001] 엘든 링 (Steam)" },
      { id: "DG10002", text: "[DG10002] 몬스터 헌터 와일즈 (Steam)" },
      { id: "DG10003", text: "[DG10003] 스트리트 파이터 6 (Steam)" },
      { id: "DG99001", text: "[DG99001] (구)레지던트 이블 (미등록)" },
    ];
    const results = q === "" ? all : all.filter((r) => r.text.includes(q) || r.id.includes(q));
    return HttpResponse.json({ results });
  }),

  // GET /admin/statistics/order/goods-count/product-suppliers?product_code=&supplier_code= — ajax_product_supplier.php.
  http.get(api("/admin/statistics/order/goods-count/product-suppliers"), ({ request }) => {
    const url = new URL(request.url);
    const keep = url.searchParams.get("supplier_code") ?? "";
    const suppliers = [
      { supplier_code: "1001", label: "Electronic Arts", selected: keep === "1001" },
      { supplier_code: "1004", label: "Capcom", selected: keep === "1004" },
      { supplier_code: "1003", label: "반다이남코 (예전DB)", selected: keep === "1003" },
    ];
    return HttpResponse.json({ suppliers });
  }),

  // GET /admin/statistics/order/goods-count?search_year=&search_product_code=&search_supplier_code= — order_goods_count.php.
  http.get(api("/admin/statistics/order/goods-count"), ({ request }) => {
    const url = new URL(request.url);
    const searchYear = url.searchParams.get("search_year") || String(new Date().getFullYear());
    const productCode = url.searchParams.get("search_product_code") ?? "";
    const supplierCode = url.searchParams.get("search_supplier_code") ?? "";
    const showSupplier = supplierCode === "";
    const yearLabel = searchYear === "all" ? "전체" : `${searchYear}년`;
    const isRegistered = !productCode.startsWith("DG99");

    const priceStats: StatGoodsPriceRow[] = [
      {
        supplier_code: "1001",
        publisher_name: "Electronic Arts",
        old_publisher_name: "",
        unit_price: 66000,
        total_count: 320,
      },
      {
        supplier_code: "1003",
        publisher_name: "",
        old_publisher_name: "반다이남코",
        unit_price: 59000,
        total_count: 145,
      },
    ];
    const dayStats: StatGoodsDayRow[] = [
      {
        supplier_code: "1001",
        publisher_name: "Electronic Arts",
        old_publisher_name: "",
        ord_ymd: `${searchYear === "all" ? "2026" : searchYear}-03-14`,
        unit_price: 66000,
        total_count: 40,
      },
      {
        supplier_code: "1001",
        publisher_name: "Electronic Arts",
        old_publisher_name: "",
        ord_ymd: `${searchYear === "all" ? "2026" : searchYear}-03-15`,
        unit_price: 66000,
        total_count: 55,
      },
    ];
    const promotionHistory: StatGoodsPromotionRow[] = [
      {
        promotion_start: `${searchYear === "all" ? "2026" : searchYear}-05-01`,
        promotion_end: `${searchYear === "all" ? "2026" : searchYear}-05-14`,
        p_discount_rate: "20",
        discount_rate: "5",
        sale_price: 49800,
        order_count: 210,
      },
    ];

    return HttpResponse.json({
      search_year: searchYear,
      search_product_code: productCode,
      search_supplier_code: supplierCode,
      year_label: yearLabel,
      show_supplier: showSupplier,
      goods_item: isRegistered
        ? {
            product_code: productCode,
            product_name: "엘든 링",
            display_type: "game",
            platform_name: "Steam",
            release_date: "2022-02-25",
            consumer_price: 66000,
            price: 59400,
            status: "0",
          }
        : null,
      selected_product_name: "(구)레지던트 이블",
      price_stats: priceStats,
      day_stats: dayStats,
      promotion_history: promotionHistory,
    });
  }),

  // GET /admin/statistics/order/publisher-count?search_year= — legacy order_publisher_count.php.
  http.get(api("/admin/statistics/order/publisher-count"), ({ request }) => {
    const url = new URL(request.url);
    const searchYear = url.searchParams.get("search_year") || String(new Date().getFullYear());

    const buildRow = (
      supplierCode: string,
      publisherName: string,
      oldPublisherName: string,
      normal: [number, number],
      promotion: [number, number],
    ): StatPublisherRow => ({
      supplier_code: supplierCode,
      publisher_name: publisherName,
      old_publisher_name: oldPublisherName,
      normal: { total_count: normal[0], total_price: normal[1] },
      promotion: { total_count: promotion[0], total_price: promotion[1] },
      total_count: normal[0] + promotion[0],
      total_price: normal[1] + promotion[1],
    });

    // 백엔드 정렬(total_price desc) 재현된 fixture.
    const rows: StatPublisherRow[] = [
      buildRow("1001", "Electronic Arts", "", [1200, 72000000], [430, 17200000]),
      buildRow("1002", "Ubisoft", "", [860, 51600000], [210, 8400000]),
      buildRow("1004", "Capcom", "", [540, 32400000], [0, 0]),
      buildRow("1003", "", "반다이남코", [120, 7080000], [55, 2200000]),
    ];
    const grandTotalCount = rows.reduce((s, r) => s + r.total_count, 0);
    const grandTotalPrice = rows.reduce((s, r) => s + r.total_price, 0);

    return HttpResponse.json({
      search_year: searchYear,
      rows,
      grand_total_count: grandTotalCount,
      grand_total_price: grandTotalPrice,
    });
  }),

  // GET /admin/statistics/order/goods-publisher-count — legacy order_goods_publisher_count.php.
  http.get(api("/admin/statistics/order/goods-publisher-count"), ({ request }) => {
    const url = new URL(request.url);
    const start = url.searchParams.get("search_start_date") ?? "";
    const end = url.searchParams.get("search_end_date") ?? "";
    const gameType = url.searchParams.get("search_game_type") ?? "";

    const buildRow = (
      productCode: string,
      productName: string,
      rowGameType: string,
      releaseDate: string,
      publisherName: string,
      oldPublisherName: string,
      totalCount: number,
      totalPrice: number,
    ): StatGoodsPublisherRow => ({
      supplier_code: "1001",
      publisher_name: publisherName,
      old_publisher_name: oldPublisherName,
      game_type: rowGameType,
      release_date: releaseDate,
      product_code: productCode,
      product_name: productName,
      total_count: totalCount,
      total_price: totalPrice,
    });

    // 정렬(total_count desc, total_price desc) 재현.
    let rows: StatGoodsPublisherRow[] = [
      buildRow(
        "DG10001",
        "엘든 링",
        "game",
        "2022-02-25 00:00:00",
        "Electronic Arts",
        "",
        320,
        19008000,
      ),
      buildRow(
        "DG10002",
        "엘든 링 DLC",
        "dlc",
        "2024-06-21 00:00:00",
        "Electronic Arts",
        "",
        145,
        4205000,
      ),
      buildRow(
        "DG10003",
        "엘든 링 OST",
        "music",
        "2022-03-01 00:00:00",
        "",
        "반다이남코",
        60,
        720000,
      ),
    ];
    if (gameType !== "" && gameType !== "all") {
      rows = rows.filter((r) => r.game_type === gameType);
    }

    return HttpResponse.json({ search_start_date: start, search_end_date: end, rows });
  }),

  // GET /admin/statistics/order/sales-goods-day — legacy sales_goods_day.php.
  http.get(api("/admin/statistics/order/sales-goods-day"), ({ request }) => {
    const url = new URL(request.url);
    const start = url.searchParams.get("search_start_date") ?? "";
    const end = url.searchParams.get("search_end_date") ?? "";

    const buildRow = (
      productCode: string,
      productName: string,
      publisherName: string,
      oldPublisherName: string,
      totalCount: number,
      totalPrice: number,
    ): StatSalesDayRow => ({
      supplier_code: "1001",
      publisher_name: publisherName,
      old_publisher_name: oldPublisherName,
      product_code: productCode,
      product_name: productName,
      total_count: totalCount,
      total_price: totalPrice,
    });

    // 정렬(total_count desc, total_price desc) 재현.
    const rows: StatSalesDayRow[] = [
      buildRow("DG10001", "엘든 링", "Electronic Arts", "", 320, 19008000),
      buildRow("DG10002", "몬스터 헌터 와일즈", "Capcom", "", 210, 13230000),
      buildRow("DG10003", "(구)철권 7", "", "반다이남코", 44, 1320000),
    ];

    return HttpResponse.json({ search_start_date: start, search_end_date: end, rows });
  }),

  // GET /admin/statistics/goods/title-ranking — legacy title_ranking.php(tbl_sales_ranking, 50/page).
  http.get(api("/admin/statistics/goods/title-ranking"), ({ request }) => {
    const url = new URL(request.url);
    const searchYear = url.searchParams.get("search_year") ?? "";
    const searchMonth = url.searchParams.get("search_month") ?? "";
    const page = Number(url.searchParams.get("page")) || 1;

    const buildRow = (
      titleId: string,
      titleName: string,
      publisher: string,
      releaseDate: string,
      total: [number, number],
      dlc: [number, number],
    ): StatTitleRankingRow => ({
      title_id: titleId,
      title_name: titleName,
      publisher,
      release_date: releaseDate,
      total_count: total[0],
      total_price: total[1],
      dlc_count: dlc[0],
      dlc_price: dlc[1],
    });

    // 정렬((총금액+dlc금액) desc) 재현된 fixture.
    const items: StatTitleRankingRow[] = [
      buildRow("100234", "엘든 링", "반다이남코", "2022-02-25", [820, 49200000], [340, 6800000]),
      buildRow(
        "100118",
        "발더스 게이트 3",
        "라리안 스튜디오",
        "2023-08-03",
        [610, 42700000],
        [95, 1900000],
      ),
      buildRow(
        "100452",
        "몬스터 헌터 와일즈",
        "Capcom",
        "2025-02-28",
        [540, 37800000],
        [12, 240000],
      ),
    ];

    return HttpResponse.json({
      search_year: searchYear,
      search_month: searchMonth,
      items,
      pagination: { current_page: page, total_pages: 1, total_results: items.length },
    });
  }),

  // GET /admin/statistics/goods/metacritic-score — legacy metacritic_score.php(steam_app_list, 100/page).
  http.get(api("/admin/statistics/goods/metacritic-score"), ({ request }) => {
    const url = new URL(request.url);
    const searchYear = url.searchParams.get("search_year") ?? "";
    const page = Number(url.searchParams.get("page")) || 1;

    const buildRow = (
      appid: string,
      name: string,
      appType: string,
      publisher: string,
      releaseDate: string,
      recommendations: number,
      score: number,
    ): StatMetacriticRow => ({
      appid,
      name,
      app_type: appType,
      publisher,
      release_date: releaseDate,
      recommendations,
      metacritic_score: score,
      metacritic_url: `https://www.metacritic.com/game/${name.toLowerCase().replace(/\s+/g, "-")}/`,
    });

    // 정렬(metacritic_score desc, release_date desc) 재현.
    const items: StatMetacriticRow[] = [
      buildRow("1245620", "ELDEN RING", "Game", "반다이남코", "2022-02-25", 720000, 96),
      buildRow("1086940", "Baldur's Gate 3", "Game", "라리안 스튜디오", "2023-08-03", 610000, 96),
      buildRow("2050650", "Resident Evil 4", "Game", "Capcom", "2023-03-24", 210000, 93),
    ];

    return HttpResponse.json({
      search_year: searchYear,
      items,
      pagination: { current_page: page, total_pages: 1, total_results: items.length },
    });
  }),

  // GET /admin/statistics/order/asset-day-count — legacy order_asset_day_count.php(tbl_asset⋈order_item_asset, 50/page).
  http.get(api("/admin/statistics/order/asset-day-count"), ({ request }) => {
    const url = new URL(request.url);
    const now = new Date();
    const searchYear = url.searchParams.get("search_year") || String(now.getFullYear());
    const searchMonth = url.searchParams.get("search_month") || pad2(now.getMonth() + 1);
    const searchDay = url.searchParams.get("search_day") || pad2(now.getDate());
    const page = Number(url.searchParams.get("page")) || 1;

    const buildRow = (
      assetId: string,
      assetName: string,
      publisher: string,
      productType: string,
      assetType: string,
      platform: string,
      totalCount: number,
    ): StatAssetDayRow => ({
      asset_id: assetId,
      asset_name: assetName,
      publisher,
      productType,
      assetType,
      platform,
      total_count: totalCount,
    });

    // total_count desc 재현.
    const items: StatAssetDayRow[] = [
      buildRow("AST10021", "엘든 링 (Steam KR)", "반다이남코", "game", "일반", "Steam", 42),
      buildRow("AST10088", "몬스터 헌터 와일즈 (Steam KR)", "Capcom", "game", "일반", "Steam", 31),
      buildRow("AST10133", "스트리트 파이터 6 DLC", "Capcom", "dlc", "일반", "Steam", 12),
    ];

    return HttpResponse.json({
      search_year: searchYear,
      search_month: searchMonth,
      search_day: searchDay,
      items,
      pagination: { current_page: page, total_pages: 1, total_results: items.length },
    });
  }),

  // GET /admin/statistics/order/asset-month-count — legacy order_asset_month_count.php(월 범위, 50/page).
  http.get(api("/admin/statistics/order/asset-month-count"), ({ request }) => {
    const url = new URL(request.url);
    const now = new Date();
    const searchYear = url.searchParams.get("search_year") || String(now.getFullYear());
    const searchMonth = url.searchParams.get("search_month") || pad2(now.getMonth() + 1);
    const page = Number(url.searchParams.get("page")) || 1;

    const buildRow = (
      assetId: string,
      assetName: string,
      publisher: string,
      productType: string,
      assetType: string,
      platform: string,
      totalCount: number,
    ): StatAssetDayRow => ({
      asset_id: assetId,
      asset_name: assetName,
      publisher,
      productType,
      assetType,
      platform,
      total_count: totalCount,
    });

    // total_count desc 재현.
    const items: StatAssetDayRow[] = [
      buildRow("AST10021", "엘든 링 (Steam KR)", "반다이남코", "game", "일반", "Steam", 640),
      buildRow("AST10088", "몬스터 헌터 와일즈 (Steam KR)", "Capcom", "game", "일반", "Steam", 512),
      buildRow("AST10133", "스트리트 파이터 6 DLC", "Capcom", "dlc", "일반", "Steam", 188),
    ];

    return HttpResponse.json({
      search_year: searchYear,
      search_month: searchMonth,
      items,
      pagination: { current_page: page, total_pages: 1, total_results: items.length },
    });
  }),

  // GET /admin/statistics/order/ztorm-day-count — legacy order_ztorm_day_count.php(tbl_order_item_ztorm).
  // 금액 3필드는 legacy 쿼리가 SUM 미포함 → 0(현행 재현).
  http.get(api("/admin/statistics/order/ztorm-day-count"), ({ request }) => {
    const url = new URL(request.url);
    const now = new Date();
    const searchYear = url.searchParams.get("search_year") || String(now.getFullYear());
    const searchMonth = url.searchParams.get("search_month") || pad2(now.getMonth() + 1);
    const searchDay = url.searchParams.get("search_day") || pad2(now.getDate());

    const buildRow = (
      itemId: string,
      itemName: string,
      publisher: string,
      totalCount: number,
    ): StatZtormDayRow => ({
      ztorm_publisher: publisher,
      ztorm_item_id: itemId,
      ztorm_item_name: itemName,
      total_count: totalCount,
      total_gross_amount: 0,
      total_net_amount: 0,
      total_actual_buying_price: 0,
    });

    // count desc 재현.
    const items: StatZtormDayRow[] = [
      buildRow("ZT-77012", "Cyberpunk 2077 (Global)", "CD PROJEKT RED", 18),
      buildRow("ZT-51230", "The Witcher 3 GOTY (Global)", "CD PROJEKT RED", 9),
      buildRow("ZT-99881", "Dying Light 2 (Global)", "Techland", 4),
    ];

    return HttpResponse.json({
      search_year: searchYear,
      search_month: searchMonth,
      search_day: searchDay,
      items,
    });
  }),

  // GET /admin/statistics/order/ztorm-month-count — legacy order_ztorm_month_count.php(월 범위). 금액 0 재현.
  http.get(api("/admin/statistics/order/ztorm-month-count"), ({ request }) => {
    const url = new URL(request.url);
    const now = new Date();
    const searchYear = url.searchParams.get("search_year") || String(now.getFullYear());
    const searchMonth = url.searchParams.get("search_month") || pad2(now.getMonth() + 1);

    const buildRow = (
      itemId: string,
      itemName: string,
      publisher: string,
      totalCount: number,
    ): StatZtormDayRow => ({
      ztorm_publisher: publisher,
      ztorm_item_id: itemId,
      ztorm_item_name: itemName,
      total_count: totalCount,
      total_gross_amount: 0,
      total_net_amount: 0,
      total_actual_buying_price: 0,
    });

    const items: StatZtormDayRow[] = [
      buildRow("ZT-77012", "Cyberpunk 2077 (Global)", "CD PROJEKT RED", 246),
      buildRow("ZT-51230", "The Witcher 3 GOTY (Global)", "CD PROJEKT RED", 132),
      buildRow("ZT-99881", "Dying Light 2 (Global)", "Techland", 58),
    ];

    return HttpResponse.json({ search_year: searchYear, search_month: searchMonth, items });
  }),

  // GET /admin/statistics/order/genba-day-count — legacy order_genba_day_count.php(실금액, GrossAmount desc).
  http.get(api("/admin/statistics/order/genba-day-count"), ({ request }) => {
    const url = new URL(request.url);
    const now = new Date();
    const searchYear = url.searchParams.get("search_year") || String(now.getFullYear());
    const searchMonth = url.searchParams.get("search_month") || pad2(now.getMonth() + 1);
    const searchDay = url.searchParams.get("search_day") || pad2(now.getDate());

    const buildRow = (
      sku: string,
      name: string,
      publisher: string,
      totalCount: number,
      net: number,
      gross: number,
      actual: number,
    ): StatGenbaDayRow => ({
      sku,
      name,
      publisher,
      total_count: totalCount,
      total_net_amount: net,
      total_gross_amount: gross,
      total_actual_buying_price: actual,
    });

    // GrossAmount desc 재현. 3번째 행은 actual<300(환산 대상), 4번째는 Name 빈값(동기화 버튼).
    const items: StatGenbaDayRow[] = [
      buildRow("GB-4402", "FIFA 24 (EU)", "EA", 22, 1320000, 1540000, 880000),
      buildRow("GB-7781", "Hogwarts Legacy (EU)", "WB Games", 14, 910000, 1050000, 640000),
      buildRow("GB-9920", "Sea of Thieves (EU)", "Xbox", 6, 240000, 300000, 180),
      buildRow("GB-1188", "", "Unknown", 3, 90000, 120000, 60),
    ];

    return HttpResponse.json({
      search_year: searchYear,
      search_month: searchMonth,
      search_day: searchDay,
      items,
    });
  }),

  // POST /admin/statistics/order/genba-day-count/sync — legacy genba_catalogue_sync.php.
  http.post(api("/admin/statistics/order/genba-day-count/sync"), () =>
    HttpResponse.json({ success: true }),
  ),

  // GET /admin/statistics/order/genba-month-count — legacy order_genba_month_count.php(월 범위, 동기화 없음).
  http.get(api("/admin/statistics/order/genba-month-count"), ({ request }) => {
    const url = new URL(request.url);
    const now = new Date();
    const searchYear = url.searchParams.get("search_year") || String(now.getFullYear());
    const searchMonth = url.searchParams.get("search_month") || pad2(now.getMonth() + 1);

    const buildRow = (
      sku: string,
      name: string,
      publisher: string,
      totalCount: number,
      net: number,
      gross: number,
      actual: number,
    ): StatGenbaDayRow => ({
      sku,
      name,
      publisher,
      total_count: totalCount,
      total_net_amount: net,
      total_gross_amount: gross,
      total_actual_buying_price: actual,
    });

    // GrossAmount desc 재현. 3번째 행 actual<500(환산 대상).
    const items: StatGenbaDayRow[] = [
      buildRow("GB-4402", "FIFA 24 (EU)", "EA", 420, 25200000, 29400000, 16800000),
      buildRow("GB-7781", "Hogwarts Legacy (EU)", "WB Games", 260, 16900000, 19500000, 11900000),
      buildRow("GB-9920", "Sea of Thieves (EU)", "Xbox", 88, 3520000, 4400000, 320),
    ];

    return HttpResponse.json({ search_year: searchYear, search_month: searchMonth, items });
  }),

  // GET /admin/statistics/order/genba-publisher-count — legacy genba_publisher_count.php(필터 없음).
  http.get(api("/admin/statistics/order/genba-publisher-count"), ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") || "1") || 1;

    const buildRow = (
      publisher: string,
      totalCount: number,
      net: number,
      gross: number,
      actual: number,
    ): StatGenbaPublisherRow => ({
      publisher,
      total_count: totalCount,
      total_net_amount: net,
      total_gross_amount: gross,
      total_actual_buying_price: actual,
    });

    // GrossAmount desc 재현. 3번째 행은 음수 DGKR 이익(text-danger) 확인용.
    const items: StatGenbaPublisherRow[] = [
      buildRow("EA", 1260, 75600000, 88200000, 50400000),
      buildRow("WB Games", 780, 50700000, 58500000, 35700000),
      buildRow("Indie.io", 42, 1260000, 1680000, 2100000),
    ];

    return HttpResponse.json({ page, items });
  }),

  // GET /admin/statistics/order/genba-total-count — legacy genba_total_count.php(30/page).
  http.get(api("/admin/statistics/order/genba-total-count"), ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") || "1") || 1;

    const buildRow = (
      sku: string,
      name: string,
      publisher: string,
      totalCount: number,
      net: number,
      gross: number,
      actual: number,
    ): StatGenbaDayRow => ({
      sku,
      name,
      publisher,
      total_count: totalCount,
      total_net_amount: net,
      total_gross_amount: gross,
      total_actual_buying_price: actual,
    });

    // legacy 정렬: (NetAmount - ActualBuyingPrice) desc.
    const all: StatGenbaDayRow[] = [
      buildRow("GB-4402", "FIFA 24 (EU)", "EA", 1260, 75600000, 88200000, 50400000),
      buildRow("GB-7781", "Hogwarts Legacy (EU)", "WB Games", 780, 50700000, 58500000, 35700000),
      buildRow("GB-9920", "Sea of Thieves (EU)", "Xbox", 214, 8560000, 10700000, 4200000),
      buildRow("GB-1188", "Unknown Genba SKU", "Unknown", 96, 2880000, 3600000, 4100000),
    ];
    const perPage = 30;
    const totalResults = all.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / perPage));
    const start = (page - 1) * perPage;
    const items = all.slice(start, start + perPage);

    return HttpResponse.json({
      page,
      items,
      pagination: { current_page: page, total_pages: totalPages, total_results: totalResults },
    });
  }),

  // GET /admin/statistics/order/vaultn-day-count — legacy order_vaultn_day_count.php(실금액, GrossAmount desc).
  http.get(api("/admin/statistics/order/vaultn-day-count"), ({ request }) => {
    const url = new URL(request.url);
    const now = new Date();
    const searchYear = url.searchParams.get("search_year") || String(now.getFullYear());
    const searchMonth = url.searchParams.get("search_month") || pad2(now.getMonth() + 1);
    const searchDay = url.searchParams.get("search_day") || pad2(now.getDate());

    const buildRow = (
      sku: string,
      name: string,
      publisherName: string,
      totalCount: number,
      gross: number,
      net: number,
      actual: number,
    ): StatVaultnDayRow => ({
      sku,
      name,
      publisher_name: publisherName,
      total_count: totalCount,
      total_gross_amount: gross,
      total_net_amount: net,
      total_actual_buying_price: actual,
    });

    // GrossAmount desc 재현. 3번째 행은 음수 DGKR 이익, 4번째는 Name 빈값(동기화 버튼).
    const items: StatVaultnDayRow[] = [
      buildRow(
        "VL-90021",
        "Helldivers 2 (Vaultn)",
        "Sony Interactive Entertainment",
        19,
        1330000,
        1209090,
        820000,
      ),
      buildRow("VL-12004", "Tekken 8 (Vaultn)", "Bandai Namco", 11, 792000, 720000, 510000),
      buildRow("VL-44018", "Small Indie Pack", "Indie.io", 4, 176000, 160000, 210000),
      buildRow("VL-EMPTY-7", "", "Unknown", 2, 88000, 80000, 44000),
    ];

    return HttpResponse.json({
      search_year: searchYear,
      search_month: searchMonth,
      search_day: searchDay,
      items,
    });
  }),

  // POST /admin/statistics/order/vaultn-day-count/sync — legacy vaultn_catalogue_sync.php.
  http.post(api("/admin/statistics/order/vaultn-day-count/sync"), () =>
    HttpResponse.json({ success: true }),
  ),

  // GET /admin/statistics/order/vaultn-month-count — legacy order_vaultn_month_count.php(count desc).
  http.get(api("/admin/statistics/order/vaultn-month-count"), ({ request }) => {
    const url = new URL(request.url);
    const now = new Date();
    const searchYear = url.searchParams.get("search_year") || String(now.getFullYear());
    const searchMonth = url.searchParams.get("search_month") || pad2(now.getMonth() + 1);

    const buildRow = (
      sku: string,
      name: string,
      publisherName: string,
      totalCount: number,
      gross: number,
      net: number,
      actual: number,
    ): StatVaultnDayRow => ({
      sku,
      name,
      publisher_name: publisherName,
      total_count: totalCount,
      total_gross_amount: gross,
      total_net_amount: net,
      total_actual_buying_price: actual,
    });

    // count desc 재현. 3번째 행은 음수 DGKR 이익 확인용.
    const items: StatVaultnDayRow[] = [
      buildRow(
        "VL-90021",
        "Helldivers 2 (Vaultn)",
        "Sony Interactive Entertainment",
        428,
        29960000,
        27236363,
        18480000,
      ),
      buildRow("VL-12004", "Tekken 8 (Vaultn)", "Bandai Namco", 260, 18720000, 17018181, 13260000),
      buildRow("VL-44018", "Small Indie Pack", "Indie.io", 88, 3872000, 3520000, 4620000),
    ];

    return HttpResponse.json({ search_year: searchYear, search_month: searchMonth, items });
  }),

  // GET /admin/statistics/order/vaultn-total-count — legacy vaultn_total_count.php(100/page).
  http.get(api("/admin/statistics/order/vaultn-total-count"), ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") || "1") || 1;

    const buildRow = (
      sku: string,
      name: string,
      publisherName: string,
      totalCount: number,
      gross: number,
      net: number,
      actual: number,
    ): StatVaultnDayRow => ({
      sku,
      name,
      publisher_name: publisherName,
      total_count: totalCount,
      total_gross_amount: gross,
      total_net_amount: net,
      total_actual_buying_price: actual,
    });

    // legacy 정렬: sum(salesPriceGross-netPurchasePrice) desc.
    const all: StatVaultnDayRow[] = [
      buildRow(
        "VL-90021",
        "Helldivers 2 (Vaultn)",
        "Sony Interactive Entertainment",
        1510,
        105700000,
        96090909,
        65200000,
      ),
      buildRow("VL-12004", "Tekken 8 (Vaultn)", "Bandai Namco", 940, 67680000, 61527272, 47840000),
      buildRow("VL-44018", "Small Indie Pack", "Indie.io", 214, 9416000, 8560000, 11235000),
      buildRow("VL-77701", "Unknown Vaultn SKU", "Unknown", 86, 3784000, 3440000, 1820000),
    ];
    const perPage = 100;
    const totalResults = all.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / perPage));
    const start = (page - 1) * perPage;
    const items = all.slice(start, start + perPage);

    return HttpResponse.json({
      page,
      items,
      pagination: { current_page: page, total_pages: totalPages, total_results: totalResults },
    });
  }),

  // GET /admin/statistics/order/vaultn-month-count-compare — legacy order_vaultn_month_count_compare.php.
  http.get(api("/admin/statistics/order/vaultn-month-count-compare"), ({ request }) => {
    const url = new URL(request.url);
    const now = new Date();
    const searchPublisher = url.searchParams.get("search_publisher") || "38";
    const searchYear = url.searchParams.get("search_year") || String(now.getFullYear());
    const searchMonth = url.searchParams.get("search_month") || pad2(now.getMonth() + 1);

    const buildRow = (
      ordno: string,
      productCode: string,
      productName: string,
      status: string,
      sku: string,
      vaultnStatus: string,
      orderDate: string,
      regDate: string,
    ): StatVaultnMonthCompareRow => ({
      ordno,
      product_code: productCode,
      product_name: productName,
      status,
      publisher_code: searchPublisher,
      order_date: orderDate,
      sku,
      vaultn_status: vaultnStatus,
      reg_date: regDate,
    });

    // order_date ASC 재현. status!=2(text-danger), vaultn_status!=Completed(bg-warning) 확인용 fixture.
    const items: StatVaultnMonthCompareRow[] = [
      buildRow(
        "DG202608040001",
        "P-BETH-001",
        "Starfield Digital Premium Edition",
        "2",
        "VL-BETH-001",
        "Completed",
        `${searchYear}-${searchMonth}-01 09:32:11`,
        `${searchYear}-${searchMonth}-01 00:34:02`,
      ),
      buildRow(
        "DG202608040018",
        "P-BETH-002",
        "The Elder Scrolls Online Collection",
        "9",
        "VL-BETH-002",
        "Refunded",
        `${searchYear}-${searchMonth}-08 14:20:04`,
        `${searchYear}-${searchMonth}-08 05:22:18`,
      ),
      buildRow(
        "DG202608040027",
        "P-BETH-003",
        "DOOM Eternal Standard",
        "3",
        "",
        "",
        `${searchYear}-${searchMonth}-15 19:41:55`,
        "",
      ),
    ];

    return HttpResponse.json({
      search_publisher: searchPublisher,
      search_year: searchYear,
      search_month: searchMonth,
      items,
    });
  }),

  // GET /admin/statistics/order/holomodels-count — legacy order_holomodels_count.php.
  http.get(api("/admin/statistics/order/holomodels-count"), ({ request }) => {
    const url = new URL(request.url);
    const now = new Date();
    const searchYear = url.searchParams.get("search_year") || String(now.getFullYear());
    const searchMonth = url.searchParams.get("search_month") || pad2(now.getMonth() + 1);

    const buildRow = (
      productCode: string,
      productName: string,
      salesCount: number,
      salesAmount: number,
    ): StatHolomodelsRow => ({
      product_code: productCode,
      product_name: productName,
      sales_count: salesCount,
      sales_amount: salesAmount,
    });

    // sales_count DESC 재현.
    const items: StatHolomodelsRow[] = [
      buildRow("HM-AKANE-001", "신죠 아카네 홀로 모델 본체", 42, 3780000),
      buildRow("HM-MIKU-2026", "하츠네 미쿠 - SNOW MIKU 2026 홀로 모델 본체", 31, 3410000),
      buildRow("HM-AKANE-DLC", "신죠 아카네 수영복 홀로 모델 DLC", 18, 900000),
    ];

    return HttpResponse.json({ search_year: searchYear, search_month: searchMonth, items });
  }),

  // GET /admin/statistics/sales/day — legacy sales_day.php(tbl_sales_day sparse snapshot).
  http.get(api("/admin/statistics/sales/day"), ({ request }) => {
    const url = new URL(request.url);
    const now = new Date();
    const searchYear = url.searchParams.get("search_year") || String(now.getFullYear());
    const searchMonth = url.searchParams.get("search_month") || pad2(now.getMonth() + 1);

    const buildRow = (
      day: number,
      orderPrice: number,
      checkoutPrice: number,
      checkoutCount: number,
      emoney: number,
      batchDate: string,
    ): StatSalesDayCountRow => ({
      order_day: `${searchYear}-${searchMonth}-${pad2(day)}`,
      order_price: orderPrice,
      checkout_price: checkoutPrice,
      checkout_count: checkoutCount,
      emoney,
      batch_date: batchDate,
    });

    const days: StatSalesDayCountRow[] = [
      buildRow(1, 1248000, 1196000, 18, 52000, `${searchYear}-${searchMonth}-02 03:10:22`),
      buildRow(5, 2160000, 2075000, 32, 85000, `${searchYear}-${searchMonth}-06 03:11:05`),
      buildRow(15, 980000, 950000, 14, 30000, `${searchYear}-${searchMonth}-16 03:09:48`),
      buildRow(20, 0, 0, 0, 0, ""),
    ];

    return HttpResponse.json({ search_year: searchYear, search_month: searchMonth, days });
  }),

  // GET /admin/statistics/sales/month — legacy sales_month.php(tbl_sales_day monthly rollup).
  http.get(api("/admin/statistics/sales/month"), ({ request }) => {
    const url = new URL(request.url);
    const now = new Date();
    const searchYear = url.searchParams.get("search_year") || String(now.getFullYear());

    const buildRow = (
      month: number,
      orderPrice: number,
      checkoutPrice: number,
      checkoutCount: number,
      emoney: number,
    ): StatSalesMonthCountRow => ({
      order_month: `${searchYear}-${pad2(month)}`,
      order_price: orderPrice,
      checkout_price: checkoutPrice,
      checkout_count: checkoutCount,
      emoney,
    });

    const months: StatSalesMonthCountRow[] = [
      buildRow(1, 4688000, 4511000, 64, 177000),
      buildRow(2, 0, 0, 0, 0),
      buildRow(3, 7320000, 7075000, 105, 245000),
      buildRow(8, 5390000, 5195000, 77, 195000),
      buildRow(12, 8980000, 8640000, 126, 340000),
    ];

    return HttpResponse.json({ search_year: searchYear, months });
  }),

  // GET /admin/statistics/sales/pg — legacy sales_pg.php.
  // tbl_order step='2' group by ord_ymd, pg_provider 의 raw 그룹 행(가공 없음).
  http.get(api("/admin/statistics/sales/pg"), ({ request }) => {
    const url = new URL(request.url);
    const now = new Date();
    const searchYear = url.searchParams.get("search_year") || String(now.getFullYear());
    const searchMonth = url.searchParams.get("search_month") || pad2(now.getMonth() + 1);

    const buildRow = (
      day: number,
      pgProvider: string,
      checkoutCount: number,
      checkoutPrice: number,
    ): StatSalesPgCountRow => ({
      ord_ymd: `${searchYear}-${searchMonth}-${pad2(day)}`,
      pg_provider: pgProvider,
      checkout_count: checkoutCount,
      checkout_price: checkoutPrice,
    });

    // 01일: 표시 PG만. 05일: kakao(표시 외) 포함 → 일별 비율 분모(전체)와 tfoot 분모(5 PG) 불일치 확인용.
    const rows: StatSalesPgCountRow[] = [
      buildRow(1, "kcp", 10, 1000000),
      buildRow(1, "naverpay", 5, 500000),
      buildRow(1, "toss", 3, 300000),
      buildRow(5, "kcp", 20, 2000000),
      buildRow(5, "payco", 4, 400000),
      buildRow(5, "toss_pay", 6, 600000),
      buildRow(5, "kakao", 2, 200000),
      buildRow(15, "toss", 8, 800000),
    ];

    return HttpResponse.json({ search_year: searchYear, search_month: searchMonth, rows });
  }),

  // GET /admin/statistics/promotion/report — legacy promotion_report.php.
  // tbl_promotion_schedule a ⋈ tbl_goods_item b, discount_rate>0 + promotion_end<now, 50/page.
  http.get(api("/admin/statistics/promotion/report"), ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page")) || 1;

    // order_count: null=미집계(집계 버튼), 0=집계됨(판매0), 양수=집계됨.
    const items: StatPromotionReportRow[] = [
      {
        publisher_code: "101",
        publisher_name: "Electronic Arts",
        product_code: "G0001",
        product_name: "Battlefield 2042",
        promotion_start: "2024-05-01 00:00:00",
        promotion_end: "2024-05-14 23:59:59",
        sale_price: 19800,
        discount_rate: "60",
        order_count: 132,
        order_price: 2613600,
      },
      {
        publisher_code: "202",
        publisher_name: "Ubisoft",
        product_code: "G0002",
        product_name: "Assassin's Creed Mirage",
        promotion_start: "2024-04-10 00:00:00",
        promotion_end: "2024-04-20 23:59:59",
        sale_price: 33000,
        discount_rate: "45.5",
        order_count: null,
        order_price: 0,
      },
      {
        publisher_code: "303",
        publisher_name: "Bethesda",
        product_code: "G0003",
        product_name: "Starfield DLC",
        promotion_start: "2024-03-01 00:00:00",
        promotion_end: "2024-03-07 23:59:59",
        sale_price: 12000,
        discount_rate: "30",
        order_count: 0,
        order_price: 0,
      },
    ];

    return HttpResponse.json({
      items,
      pagination: { current_page: page, total_pages: 1, total_results: items.length },
    });
  }),

  // GET /admin/statistics/promotion/report/suppliers — legacy Admin::getSupplierList.
  http.get(api("/admin/statistics/promotion/report/suppliers"), () => {
    const suppliers: StatPromotionReportSupplier[] = [
      { publisher_code: "303", publisher_name: "Bethesda" },
      { publisher_code: "101", publisher_name: "Electronic Arts" },
      { publisher_code: "202", publisher_name: "Ubisoft" },
    ];
    return HttpResponse.json({ suppliers });
  }),

  // POST /admin/statistics/promotion/report/batch — legacy promotion_sales_batch.php(promotion_all_batch).
  http.post(api("/admin/statistics/promotion/report/batch"), () =>
    HttpResponse.json({ success: true }),
  ),
];
