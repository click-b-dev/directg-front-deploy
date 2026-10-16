import { http, HttpResponse } from "msw";
import { env } from "@shared/config/env";

const api = (path: string) => `${env.apiBaseUrl}${path}`;

// legacy vaultn_connection.php — runConnections() 연결 컬렉션.
const VAULTN_CONNECTION_LIST = [
  {
    guid: "c1f2a3b4-0001-4a5b-8c9d-100000000001",
    created: "2026-03-14 10:22:31",
    catalogSharingEnabled: true,
    connectedOwner: {
      imageUrl: "https://cdn.vaultn.com/owners/nordisk.png",
      name: "Nordisk Games",
      companyName: "Nordisk Games ApS",
      guid: "o1a2b3c4-0001-4d5e-9f00-200000000001",
      country: "DK",
      timezone: "Europe/Copenhagen",
      defaultCurrencyCode: "EUR",
    },
  },
  {
    guid: "c1f2a3b4-0002-4a5b-8c9d-100000000002",
    created: "2026-05-02 08:05:17",
    catalogSharingEnabled: false,
    connectedOwner: {
      imageUrl: "https://cdn.vaultn.com/owners/plaion.png",
      name: "Plaion",
      companyName: "Plaion GmbH",
      guid: "o1a2b3c4-0002-4d5e-9f00-200000000002",
      country: "AT",
      timezone: "Europe/Vienna",
      defaultCurrencyCode: "EUR",
    },
  },
];

// legacy vaultn_catalogue.php — vaultn_catalogue(sku not null, currencyCode='KRW').
const VAULTN_PRODUCT_LIST = [
  {
    publisher: "Nordisk Games",
    productGUID: "p1a2b3c4-0001-4d5e-9f00-300000000001",
    sku: "FUNC-GA-STE-VAMPIRE2-STA",
    title: "Vampire: The Masquerade - Bloodlines 2",
    provider: "Steam",
    regionCode: "EU",
    srp: 62000,
    purchasePrice: 43400.5,
    reservedUnits: 0,
    networkUnits: 120,
    batch_date: "2026-07-24 04:15:00",
    update_date: "2026-07-24 04:15:00",
  },
  {
    publisher: "Plaion",
    productGUID: "p1a2b3c4-0002-4d5e-9f00-300000000002",
    sku: "FUNC-GA-STE-GOTHIC1R-STA",
    title: "Gothic 1 Remake",
    provider: "Steam",
    regionCode: "WW",
    srp: 55000,
    purchasePrice: 38500.0,
    reservedUnits: 5,
    networkUnits: 60,
    batch_date: "2026-07-23 04:15:00",
    update_date: "2026-07-24 04:15:00",
  },
];
const PER_PAGE_PRODUCT = 30;

// legacy vaultn_promotion.php — vaultn_promotion a join vaultn_catalogue b (currencyCode='KRW', srp>0).
const PER_PAGE_PROMOTION = 50;
const VAULTN_PROMOTION_ROWS = [
  {
    title: "Summer Sale 2026",
    validFrom: "2026-07-20 00:00:00",
    validTo: "2026-08-03 23:59:59",
    product_name: "Vampire: The Masquerade - Bloodlines 2",
    sku: "FUNC-GA-STE-VAMPIRE2-STA",
    discountPercentage: 30,
    srp: 62000,
    purchasePrice: 43400.5,
    reg_date: "2026-07-19 09:00:00",
    update_date: "2026-07-20 04:15:00",
  },
  {
    title: "Publisher Weekend",
    validFrom: "2026-09-05 00:00:00",
    validTo: "2026-09-08 23:59:59",
    product_name: "Gothic 1 Remake",
    sku: "FUNC-GA-STE-GOTHIC1R-STA",
    discountPercentage: 25,
    srp: 55000,
    purchasePrice: 38500.0,
    reg_date: "2026-09-04 09:00:00",
    update_date: "2026-09-05 04:15:00",
  },
];

// legacy vaultn_stock.php — runVaultnStock() stockLevelInformation(중첩 connections).
const VAULTN_STOCK_ROWS = [
  {
    sku: "FUNC-GA-STE-VAMPIRE2-STA",
    isKeyless: "N",
    title: "Vampire: The Masquerade - Bloodlines 2",
    ownedUnits: 120,
    totalAvailableUnits: 120,
    connections: [
      {
        connectionGuid: "c1f2a3b4-0001-4a5b-8c9d-100000000001",
        connectionName: "Nordisk Games",
        reservedUnits: 0,
        networkUnits: 120,
        totalAvailableUnits: 120,
      },
    ],
  },
  {
    sku: "FUNC-GA-STE-GOTHIC1R-STA",
    isKeyless: "Y",
    title: "Gothic 1 Remake",
    ownedUnits: 60,
    totalAvailableUnits: 65,
    connections: [
      {
        connectionGuid: "c1f2a3b4-0002-4a5b-8c9d-100000000002",
        connectionName: "Plaion",
        reservedUnits: 5,
        networkUnits: 60,
        totalAvailableUnits: 65,
      },
    ],
  },
];

// legacy stock/vaultn_stock.php — 전량 + sku_map 옵션 매핑. options 있는 행/없는 행/재고0+판매중(강조) 혼합.
const VAULTN_STOCK_ALL_ROWS = [
  {
    // 재고 0 + 판매중 옵션 존재 → 위험(강조)
    sku: "FUNC-GA-STE-VAMPIRE2-STA",
    title: "Vampire: The Masquerade - Bloodlines 2",
    ownedUnits: 0,
    totalAvailableUnits: 0,
    connections: [
      {
        connectionGuid: "c1f2a3b4-0001-4a5b-8c9d-100000000001",
        connectionName: "Nordisk Games",
        reservedUnits: 0,
        networkUnits: 0,
        totalAvailableUnits: 0,
      },
    ],
    options: [
      { product_code: "DG40001", product_name: "뱀파이어 블러드라인2", soldout: "N", status: "0" },
    ],
  },
  {
    // 품절 옵션 존재 → 정렬 최우선
    sku: "FUNC-GA-STE-GOTHIC1R-STA",
    title: "Gothic 1 Remake",
    ownedUnits: 60,
    totalAvailableUnits: 65,
    connections: [
      {
        connectionGuid: "c1f2a3b4-0002-4a5b-8c9d-100000000002",
        connectionName: "Plaion",
        reservedUnits: 5,
        networkUnits: 60,
        totalAvailableUnits: 65,
      },
    ],
    options: [
      { product_code: "DG40010", product_name: "고딕1 리메이크", soldout: "Y", status: "0" },
    ],
  },
  {
    // 미매핑(옵션 없음) — 구분 필터 unmapped 대상
    sku: "FUNC-GA-STE-UNMAPPED-STA",
    title: "Unmapped Sample Title",
    ownedUnits: 200,
    totalAvailableUnits: 200,
    connections: [],
    options: [],
  },
];

export const vaultnHandlers = [
  // legacy vaultn_ping.php — Vaultn 연결 확인(runVaultnPingPost 원시 결과).
  http.get(api("/admin/vaultn/ping"), () =>
    HttpResponse.json({
      success: true,
      status: "OK",
      message: "pong",
      endpoint: "https://api.vaultn.com/v1/ping",
      server_time: "2026-07-24 03:00:00",
      latency_ms: 63,
    }),
  ),

  // legacy vaultn_connection.php — Vaultn 퍼블리셔(연결) 현황.
  http.get(api("/admin/vaultn/connections"), () =>
    HttpResponse.json({ items: VAULTN_CONNECTION_LIST }),
  ),

  // legacy vaultn_catalogue.php — Vaultn 카탈로그 현황(30/page).
  http.get(api("/admin/vaultn/products"), ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
    const productId = url.searchParams.get("search_product_id") || "";
    const sku = url.searchParams.get("search_sku") || "";
    const name = url.searchParams.get("search_name") || "";

    let rows = VAULTN_PRODUCT_LIST;
    if (productId) {
      rows = rows.filter((r) => r.productGUID === productId);
    }
    if (sku) {
      rows = rows.filter((r) => r.sku === sku);
    }
    if (name) {
      // legacy: title like '%..%'
      rows = rows.filter((r) => r.title.toLowerCase().includes(name.toLowerCase()));
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

  // legacy vaultn_connection_product.php — connection별 상품 목록(20/page, 중첩).
  http.get(api("/admin/vaultn/connection-products"), ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
    const payload = [
      {
        guid: "vp-0001-a2b3-c4d5-e6f7-0001",
        title: "Cities: Skylines II",
        publisher: "Paradox Interactive",
        edition: "Standard",
        franchise: "Cities: Skylines",
        productType: "Game",
        skus: [
          {
            sku: "VN-SKU-EU-0001",
            provider: "Steam",
            regionCode: "EU",
            prices: [
              {
                priceListGuid: "pl-0001",
                srp: 59000,
                purchasePrice: 41300,
                priceListVAT: 10,
                currencyCode: "KRW",
                pricePoint: "59000",
                isActivePromotion: true,
                promotionDetails: [
                  {
                    promotionGuid: "promo-0001",
                    promotionName: "여름 세일",
                    startDate: "2026-07-20",
                    endDate: "2026-08-03",
                    discountedSrp: 41300,
                    discountedPurchasePrice: 28910,
                    discountType: "percentage",
                    discount: 30,
                    discountCurrencyCode: "KRW",
                  },
                ],
              },
            ],
          },
        ],
      },
    ];
    // page > 1이면 빈 목록(mock은 1페이지만), count는 25건 가정으로 페이징 UI 확인
    return HttpResponse.json({ count: 25, payload: page === 1 ? payload : [] });
  }),

  // legacy vaultn_sync_batch.php — 페이지별 상품 동기화.
  http.post(api("/admin/vaultn/sync-batch"), async ({ request }) => {
    const b = (await request.json().catch(() => ({}))) as {
      connectionGuid?: string;
      page?: number;
    };
    return HttpResponse.json({
      message: `Vaultn 동기화 완료 (page ${b?.page ?? ""} / ${b?.connectionGuid ?? ""})`,
    });
  }),

  // legacy valutn_connection_product_view.php — runConnectionProductRetrieve(connectionGuid, productGUID).
  http.get(api("/admin/vaultn/connection-product-view"), () =>
    HttpResponse.json({
      guid: "vp-0001-a2b3-c4d5-e6f7-0001",
      title: "Cities: Skylines II",
      publisher: "Paradox Interactive",
      edition: "Standard",
      franchise: "Cities: Skylines",
      productType: "Game",
      regions: [
        {
          code: "EU",
          skus: [{ keyProvider: "Steam", sku: "VN-SKU-EU-0001" }],
          prices: [
            { countryCode: "KR", currencyCode: "KRW", amount: 59000, purchasePrice: 41300 },
            { countryCode: "DE", currencyCode: "EUR", amount: 49.99, purchasePrice: 34.99 },
          ],
          agreements: { type: "standard", signed: true },
          regionCountries: [
            { countryCode: "KR", countryName: "South Korea" },
            { countryCode: "DE", countryName: "Germany" },
          ],
          salesCountries: [{ countryCode: "KR", countryName: "South Korea" }],
        },
      ],
    }),
  ),

  // legacy valutn_product_view.php — runProductRetrieveAll(productGUID, page). print_r 덤프 + attributes 테이블.
  http.get(api("/admin/vaultn/product-view"), () =>
    HttpResponse.json({
      totalResults: 1,
      products: [
        {
          productCoreAttributes: {
            guid: "vp-0001-a2b3-c4d5-e6f7-0001",
            title: "Cities: Skylines II",
            publisher: "Paradox Interactive",
          },
          productTypeAttributes: { platform: "PC", drm: "Steam", edition: "Standard" },
          skus: { EU: { sku: "VN-SKU-EU-0001", provider: "Steam" } },
          assets: { header: "https://cdn.vaultn.com/assets/header_0001.jpg" },
        },
      ],
    }),
  ),

  // legacy vaultn_cert.php — ReadCertificate() (validFrom/validTo는 unix timestamp).
  http.get(api("/admin/vaultn/cert"), () =>
    HttpResponse.json({
      validFrom: 1735689600,
      validTo: 1798761600,
      thumbprint: "A1B2C3D4E5F60718293A4B5C6D7E8F9012345678",
    }),
  ),

  // legacy vaultn_connection_promotion.php — runConnectionPromotion(connectionGuid).
  http.get(api("/admin/vaultn/connection-promotions"), () =>
    HttpResponse.json({
      items: [
        {
          guid: "cp-0001-1111-2222-3333-000000000001",
          title: "Summer Sale 2026",
          validFrom: "2026-07-20 00:00:00",
          validTo: "2026-08-03 23:59:59",
        },
        {
          guid: "cp-0001-1111-2222-3333-000000000002",
          title: "Publisher Weekend",
          validFrom: "2026-09-05 00:00:00",
          validTo: "2026-09-08 23:59:59",
        },
      ],
    }),
  ),

  // legacy vaultn_connection_promotion_view.php — runConnectionPromotionRetrieve(connectionGuid, promotionGuid).
  http.get(api("/admin/vaultn/connection-promotion-view"), () =>
    HttpResponse.json({
      items: [
        { sku: "VN-SKU-EU-0001", discountPercentage: 30 },
        { sku: "VN-SKU-WW-0002", discountPercentage: 25 },
      ],
    }),
  ),

  // legacy vaultn_connection_pricelist.php — runConnectionPriceList(connectionGuid) (print_r 원시 덤프).
  http.get(api("/admin/vaultn/connection-pricelist"), () =>
    HttpResponse.json([
      {
        priceListGuid: "pl-0001",
        name: "KRW Retail",
        currencyCode: "KRW",
        validFrom: "2026-01-01T00:00:00Z",
      },
    ]),
  ),

  // legacy vaultn_connection_price.php — runConnectionPriceListPriceRetrieve(connectionGuid, priceListGuid, 1) (print_r 원시 덤프).
  http.get(api("/admin/vaultn/connection-price"), () =>
    HttpResponse.json({
      priceListGuid: "pl-0001",
      pageIndex: 1,
      pageSize: 50,
      recordCount: 1,
      prices: [{ sku: "VN-SKU-EU-0001", srp: 59000, purchasePrice: 41300, currencyCode: "KRW" }],
    }),
  ),

  // legacy vaultn_promotion.php — AdminGoods::getVaultnPromotionList (DB, 50/page).
  http.get(api("/admin/vaultn/promotions"), ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
    const totalResults = VAULTN_PROMOTION_ROWS.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE_PROMOTION));
    const start = (page - 1) * PER_PAGE_PROMOTION;
    return HttpResponse.json({
      items: VAULTN_PROMOTION_ROWS.slice(start, start + PER_PAGE_PROMOTION),
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE_PROMOTION,
        total_results: totalResults,
        total_pages: totalPages,
      },
    });
  }),

  // legacy vaultn_stock.php — runVaultnStock(page).
  http.get(api("/admin/vaultn/stock"), () =>
    HttpResponse.json({
      recordCount: VAULTN_STOCK_ROWS.length,
      stockLevelInformation: VAULTN_STOCK_ROWS,
    }),
  ),

  // legacy stock/vaultn_stock.php — runVaultnStockAll() 전량 + sku_map 옵션 매핑(클라이언트 처리).
  http.get(api("/admin/goods/stock/vaultn"), () =>
    HttpResponse.json({
      recordCount: VAULTN_STOCK_ALL_ROWS.length,
      loadedCount: VAULTN_STOCK_ALL_ROWS.length,
      stockLevelInformation: VAULTN_STOCK_ALL_ROWS,
    }),
  ),
];
