import { http, HttpResponse } from "msw";
import { env } from "@shared/config/env";

const api = (path: string) => `${env.apiBaseUrl}${path}`;

export const pointnexusHandlers = [
  // legacy pointnexus_ping.php — PointNexus 인증 상태(runTest).
  http.get(api("/admin/pointnexus/ping"), ({ request }) => {
    const url = new URL(request.url);
    const mode = url.searchParams.get("mode") === "test" ? "test" : "prod";
    const isSandbox = mode === "test";
    return HttpResponse.json({
      success: true,
      data: [
        {
          isSandbox,
          authenticatedProvider: {
            name: "Click-B",
            persona: "Retailer",
            id: "prov_01H8X7A9K2M3N4P5Q6R7S8T9",
          },
          credentials: {
            name: isSandbox ? "clickb-sandbox" : "clickb-production",
            clientID: isSandbox ? "cid_sandbox_9f3a1b2c4d5e6f70" : "cid_prod_1a2b3c4d5e6f7080",
          },
        },
      ],
    });
  }),

  // legacy pointnexus_product_type.php — 상품 타입 목록(runProductType, 가변 스키마).
  http.get(api("/admin/pointnexus/product-types"), () => {
    const data = [
      {
        id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
        code: "GAME",
        name: "Game",
        isDigital: true,
        metadata: { platform: "Steam", drm: "Steam" },
      },
      {
        id: "b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e",
        code: "DLC",
        name: "Downloadable Content",
        isDigital: true,
        metadata: { platform: "Steam", drm: "Steam" },
      },
      {
        id: "c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f",
        code: "GIFTCARD",
        name: "Gift Card",
        isDigital: false,
        metadata: null,
      },
    ];
    return HttpResponse.json({ success: true, data, count: data.length });
  }),

  // legacy pointnexus_partner.php — 파트너 목록(runPartner, persona 필터).
  http.get(api("/admin/pointnexus/partners"), ({ request }) => {
    const url = new URL(request.url);
    const persona = url.searchParams.get("persona") || "";
    const all = [
      {
        id: "d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f80",
        name: "Bandai Namco Europe",
        persona: "publisher",
        useAPI: true,
        contracts: [{ id: "ct1" }, { id: "ct2" }],
      },
      {
        id: "e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8091",
        name: "GamesPlanet",
        persona: "store",
        useAPI: false,
        contracts: [{ id: "ct3" }],
      },
      {
        id: "f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8091a2",
        name: "Nexus Distribution",
        persona: "distributor",
        useAPI: true,
        contracts: [],
      },
    ];
    const data = persona ? all.filter((p) => p.persona === persona) : all;
    return HttpResponse.json({ success: true, data, count: data.length });
  }),

  // legacy pointnexus_product_view.php — 상품 상세(runProductRetrieve).
  http.get(api("/admin/pointnexus/product-retrieve"), ({ request }) => {
    const url = new URL(request.url);
    const id = url.searchParams.get("id") || "";
    return HttpResponse.json({
      success: true,
      data: {
        id,
        genericName: "A Plague Tale: Requiem",
        platform: "Steam",
        publisher: "Focus Entertainment",
        type: "sale",
        edition: "Standard",
        copyright: "© Focus Entertainment",
        isPreOrder: false,
        genres: ["Adventure", "Action"],
        prices: [
          {
            currency: "KRW",
            promo: "Summer Sale",
            initialFormatted: "49,000₩",
            priceFormatted: "34,300₩",
            allowedCountries: ["KR", "WW", "US"],
          },
          {
            currency: "JPY",
            promo: false,
            priceFormatted: "4,900円",
            allowedCountries: ["JP"],
          },
          {
            currency: "EUR",
            promo: false,
            priceFormatted: "39,99€",
            allowedCountries: ["DE", "FR"],
          },
        ],
        allowedCurrencies: ["KRW", "JPY", "USD", "EUR", "GBP"],
        allowedCountries: ["KR", "JP", "US", "DE", "FR"],
        releaseDate: "2026-05-30T09:00:00Z",
        lastUpdatedAt: "2026-07-24T04:00:00Z",
        platformSKU: "STEAM-1234560",
        publisherSKU: "FOCUS-PLAGUE2",
        steamAppID: "1799620",
        shortDescription: { "ko-KR": "잔혹한 중세를 배경으로 한 어드벤처." },
        longDescription: {
          "ko-KR":
            "<h3>A Plague Tale: Requiem</h3><p>남매의 여정을 그린 <strong>액션 어드벤처</strong>입니다.</p>",
        },
      },
    });
  }),

  // legacy pointnexus_catalogue_map.php — 매핑 관리 정보.
  http.get(api("/admin/pointnexus/catalogue-map"), ({ request }) => {
    const url = new URL(request.url);
    const productID = url.searchParams.get("productID") || "";
    const mode = url.searchParams.get("mode") === "test" ? "test" : "prod";
    return HttpResponse.json({
      pn_info: {
        productID: productID || "pnp-cat-0001",
        genericName: "A Plague Tale: Requiem",
        edition: "Standard",
        platform: "Steam",
        publisher: "Focus Entertainment",
        type: "sale",
        isPreOrder: false,
        releaseDate: "2026-05-30T09:00:00Z",
        mode,
        update_date: "20260724",
      },
      is_discontinued: false,
      max_update: "20260724",
      mapped_list: [
        {
          product_code: "DG-G-1006",
          product_name: "발더스 게이트 3",
          product_platform_label: "Steam",
        },
      ],
    });
  }),

  // legacy _ps.php action=search — 자사 상품 검색.
  http.post(api("/admin/pointnexus/catalogue-map/search"), async ({ request }) => {
    const b = (await request.json().catch(() => ({}))) as { keyword?: string };
    const kw = (b?.keyword || "").toLowerCase();
    const ALL = [
      {
        product_code: "DG-G-1006",
        product_name: "발더스 게이트 3",
        product_platform_label: "Steam",
        option_type: "steam",
        status: "0",
        already: true,
      },
      {
        product_code: "DG-G-3010",
        product_name: "시티즈 스카이라인 II",
        product_platform_label: "Steam",
        option_type: "steam",
        status: "0",
        already: false,
      },
      {
        product_code: "DG-G-9001",
        product_name: "타이탄 퀘스트 II",
        product_platform_label: "Steam",
        option_type: "steam",
        status: "1",
        already: false,
      },
    ];
    const items = kw
      ? ALL.filter(
          (r) =>
            r.product_code.toLowerCase().includes(kw) || r.product_name.toLowerCase().includes(kw),
        )
      : ALL;
    return HttpResponse.json({ items });
  }),

  // legacy _ps.php action=map/unmap — 매핑 등록/해제.
  http.post(api("/admin/pointnexus/catalogue-map/action"), async ({ request }) => {
    const b = (await request.json().catch(() => ({}))) as {
      action?: string;
      product_code?: string;
      productID?: string;
    };
    if (b?.action === "map") {
      return HttpResponse.json({
        success: true,
        message: `매핑 완료: ${b?.product_code ?? ""} ↔ ${b?.productID ?? ""}`,
        flash_type: "success",
      });
    }
    if (b?.action === "unmap") {
      return HttpResponse.json({
        success: true,
        message: `매핑 해제: ${b?.product_code ?? ""}`,
        flash_type: "success",
      });
    }
    return HttpResponse.json({
      success: false,
      message: "알 수 없는 action",
      flash_type: "danger",
    });
  }),

  // legacy pointnexus_activity_log_view.php — 활동 로그 상세(runActivityLogRetrieve).
  http.get(api("/admin/pointnexus/activity-log-retrieve"), ({ request }) => {
    const url = new URL(request.url);
    const id = url.searchParams.get("id") || "";
    return HttpResponse.json({
      success: true,
      data: {
        id: id || "log-0001-a2b3-c4d5-e6f7-0001",
        type: "sale",
        createdAt: "2026-07-24T02:11:03Z",
        operationID: "op-1001-a2b3-c4d5-e6f7-0001",
        fromOperationID: "op-0900-a2b3-c4d5-e6f7-0900",
        product: {
          id: "pnp-0001-a2b3-c4d5-e6f7-0001",
          genericName: "A Plague Tale: Requiem",
          platform: "Steam",
        },
        amount: 34300,
        currency: "KRW",
      },
    });
  }),

  // legacy pointnexus_partner_view.php — 파트너 상세(runPartnerRetrieve).
  http.get(api("/admin/pointnexus/partner-retrieve"), ({ request }) => {
    const url = new URL(request.url);
    const partnerID = url.searchParams.get("partnerID") || "";
    return HttpResponse.json({
      success: true,
      data: {
        id: partnerID || "d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f80",
        name: "Bandai Namco Europe",
        persona: "publisher",
        useAPI: true,
        contracts: [
          {
            id: "ct1a2b3c-4d5e-6f70-8091-a2b3c4d5e6f7",
            type: "distribution",
            active: true,
            terms: { revShare: 70, region: "EU" },
          },
          {
            id: "ct2b3c4d-5e6f-7081-92a3-b4c5d6e7f809",
            type: "promotion",
            active: false,
            terms: { revShare: 60, region: "WW" },
          },
        ],
      },
    });
  }),

  // legacy pointnexus_promo_view.php — 프로모션 캠페인 상세(runPromoRetrieve).
  http.get(api("/admin/pointnexus/promo-retrieve"), ({ request }) => {
    const url = new URL(request.url);
    const id = url.searchParams.get("id") || "";
    return HttpResponse.json({
      success: true,
      data: {
        id,
        name: "여름 스팀 세일 캠페인",
        state: "running",
        issuer: { name: "Bandai Namco Europe", id: "iss-0001-aaaa-bbbb-cccc" },
        startDate: "2026-07-20T00:00:00Z",
        endDate: "2026-08-03T23:59:59Z",
        productIDs: ["pnp-0001-a2b3-c4d5-e6f7-0001", "pnp-0002-a2b3-c4d5-e6f7-0002"],
        products: [
          {
            id: "pnp-0001-a2b3-c4d5-e6f7-0001",
            name: "A Plague Tale: Requiem",
            defaultDiscountPercent: 30,
            prices: [
              {
                currency: { name: "KRW" },
                initialPrice: { formatted: "49,000₩" },
                discountedPrice: { formatted: "34,300₩" },
                discount: { percent: 30 },
              },
              {
                currency: { name: "JPY" },
                initialPrice: { formatted: "4,900円" },
                discountedPrice: { formatted: "4,900円" },
                discount: { percent: 0 },
              },
              {
                currency: { name: "EUR" },
                initialPrice: { formatted: "39,99€" },
                discountedPrice: { formatted: "27,99€" },
                discount: { percent: 30 },
              },
            ],
          },
          {
            id: "pnp-0002-a2b3-c4d5-e6f7-0002",
            name: "Titan Quest II",
            defaultDiscountPercent: 0,
            prices: [
              {
                currency: { name: "KRW" },
                initialPrice: { formatted: "45,000₩" },
                discountedPrice: { formatted: "45,000₩" },
                discount: { percent: 0 },
              },
            ],
          },
        ],
      },
    });
  }),

  // legacy pointnexus_cancel_verify.php — 검증 대기 통계.
  http.get(api("/admin/pointnexus/cancel-verify-stats"), ({ request }) => {
    const url = new URL(request.url);
    const mode = url.searchParams.get("mode") === "test" ? "test" : "prod";
    return HttpResponse.json({
      target_cnt: mode === "test" ? 1 : 2,
      now: "2026-07-24 12:45:00",
    });
  }),

  // legacy pointnexus_cancel_verify_batch.php — 대기 조회(dry_run) / 검증 실행.
  http.post(api("/admin/pointnexus/cancel-verify-batch"), async ({ request }) => {
    const b = (await request.json().catch(() => ({}))) as { mode?: string; dry_run?: number };
    const mode = b?.mode === "test" ? "test" : "prod";
    const dryRun = Number(b?.dry_run) === 1;

    const BASE = [
      {
        idx: 20301,
        ordno: "P1755300000_1",
        settle_no: "S20260720-0011",
        productID: "pnp-cv-0001",
        name: "A Plague Tale: Requiem",
        operationID: "op-cv-0001",
      },
      {
        idx: 20305,
        ordno: "P1755290000_2",
        settle_no: "S20260720-0015",
        productID: "pnp-cv-0002",
        name: "Titan Quest II",
        operationID: "op-cv-0002",
      },
    ];
    const base = mode === "test" ? BASE.slice(0, 1) : BASE;

    if (dryRun) {
      const items = base.map((r) => ({
        ...r,
        state: "",
        result: "preview",
        message: "GET /operation 예정",
      }));
      return HttpResponse.json({
        success: true,
        mode,
        limit: 1000,
        dry_run: 1,
        count: items.length,
        has_more: false,
        resolved_ok: 0,
        resolved_fail: 0,
        still_pending: 0,
        items,
        error: null,
      });
    }

    // 검증 실행 — 1배치로 확정(done→canceled / error→cancel_failed)
    const items = base.map((r, i) =>
      i === 0
        ? { ...r, state: "done", result: "ok", message: "canceled 확정" }
        : { ...r, state: "error", result: "fail", message: "cancel_failed (수동확인)" },
    );
    const resolvedOk = items.filter((it) => it.result === "ok").length;
    const resolvedFail = items.filter((it) => it.result === "fail").length;
    return HttpResponse.json({
      success: true,
      mode,
      limit: 50,
      dry_run: 0,
      count: items.length,
      has_more: false,
      resolved_ok: resolvedOk,
      resolved_fail: resolvedFail,
      still_pending: 0,
      items,
      error: null,
    });
  }),

  // legacy pointnexus_vcnt_cancel.php — 취소 대상 통계.
  http.get(api("/admin/pointnexus/vcnt-cancel-stats"), ({ request }) => {
    const url = new URL(request.url);
    const mode = url.searchParams.get("mode") === "test" ? "test" : "prod";
    return HttpResponse.json({
      target_cnt: mode === "test" ? 1 : 2,
      now: "2026-07-24 12:30:00",
    });
  }),

  // legacy pointnexus_vcnt_cancel_batch.php — 취소 대상 조회(dry_run).
  http.post(api("/admin/pointnexus/vcnt-cancel-batch"), async ({ request }) => {
    const b = (await request.json().catch(() => ({}))) as { mode?: string };
    const mode = b?.mode === "test" ? "test" : "prod";
    const ALL = [
      {
        ordno: "P1755500000_1",
        settle_no: "S20260722-0007",
        reg_date: "2026-07-22 10:15:00",
        m_id: "buyer10",
        name: "A Plague Tale: Requiem",
        total_price: 34300,
        va_date: "2026-07-23 23:59:59",
        productID: "pnp-vcnt-0001",
        operationID: "op-vcnt-0001",
        status: "booked",
        action: "bookCancel",
        result: "preview",
        message: "runBookCancel 예정",
      },
      {
        ordno: "P1755400000_2",
        settle_no: "S20260721-0003",
        reg_date: "2026-07-21 14:02:00",
        m_id: "buyer11",
        name: "Titan Quest II",
        total_price: 45000,
        va_date: "2026-07-22 23:59:59",
        productID: "pnp-vcnt-0002",
        operationID: "op-vcnt-0002",
        status: "sold",
        action: "cancel",
        result: "preview",
        message: "runOperationCancel 예정",
      },
    ];
    const items = mode === "test" ? ALL.slice(0, 1) : ALL;
    return HttpResponse.json({
      success: true,
      mode,
      limit: 1000,
      dry_run: 1,
      count: items.length,
      has_more: false,
      canceled_ok: 0,
      canceled_fail: 0,
      items,
      error: null,
    });
  }),

  // legacy pointnexus_book_confirm.php — booked 상태 목록.
  http.get(api("/admin/pointnexus/book-confirm"), ({ request }) => {
    const url = new URL(request.url);
    const mode = url.searchParams.get("mode") || "";
    const ordno = (url.searchParams.get("ordno") || "").toLowerCase();
    const mId = (url.searchParams.get("m_id") || "").toLowerCase();

    const ALL = [
      {
        idx: 10241,
        m_no: 121876,
        m_id: "buyer01",
        ordno: "P1755595481_1",
        productID: "pnp-book-0001",
        operationID: "op-book-0001-aaaa-bbbb-cccc",
        license_platform: "Steam",
        currency: "KRW",
        countryCode: "KR",
        price: 45800,
        vat: 4163,
        clientRequestID: "req-0001",
        status: "booked",
        mode: "prod",
        reg_date: "2026-07-23 21:04:41",
        update_date: "2026-07-23 21:04:41",
        settle_no: "S20260723-0001",
      },
      {
        idx: 10238,
        m_no: 118002,
        m_id: "buyer02",
        ordno: "P1755590000_2",
        productID: "pnp-book-0002",
        operationID: "op-book-0002-dddd-eeee-ffff",
        license_platform: "",
        currency: "KRW",
        countryCode: "KR",
        price: 62000,
        vat: 5636,
        clientRequestID: "",
        status: "booked",
        mode: "test",
        reg_date: "2026-07-23 18:12:03",
        update_date: "2026-07-23 18:12:03",
        settle_no: "",
      },
    ];

    let rows = ALL;
    if (mode === "test" || mode === "prod") {
      rows = rows.filter((r) => r.mode === mode);
    }
    if (ordno) {
      rows = rows.filter((r) => r.ordno.toLowerCase().includes(ordno));
    }
    if (mId) {
      rows = rows.filter((r) => r.m_id.toLowerCase().includes(mId));
    }
    return HttpResponse.json({ items: rows, total: rows.length });
  }),

  // legacy pointnexus_book_confirm_ps.php — confirm/cancel 처리.
  http.post(api("/admin/pointnexus/book-confirm/action"), async ({ request }) => {
    const b = (await request.json().catch(() => ({}))) as { action?: string; idx?: number };
    if (b?.action === "confirm") {
      return HttpResponse.json({
        success: true,
        message: `Confirm 완료: idx=${b?.idx ?? ""}, license_key=XXXXX-YYYYY-ZZZZZ`,
        flash_type: "success",
      });
    }
    if (b?.action === "cancel") {
      return HttpResponse.json({
        success: true,
        message: `Cancel 완료: idx=${b?.idx ?? ""}`,
        flash_type: "success",
      });
    }
    return HttpResponse.json({
      success: false,
      message: "잘못된 접근입니다. (action 누락)",
      flash_type: "danger",
    });
  }),

  // legacy pointnexus_catalogue_sync.php — 동기화 통계.
  http.get(api("/admin/pointnexus/catalogue-sync-stats"), ({ request }) => {
    const url = new URL(request.url);
    const mode = url.searchParams.get("mode") === "test" ? "test" : "prod";
    return HttpResponse.json({
      db_count_total: 1287,
      db_count_mode: mode === "test" ? 342 : 945,
      last_batch_at: "2026-07-24 04:00:12",
    });
  }),

  // legacy pointnexus_catalogue_sync_batch.php — 동기화 배치 1회.
  http.post(api("/admin/pointnexus/catalogue-sync-batch"), async ({ request }) => {
    const b = (await request.json().catch(() => ({}))) as {
      mode?: string;
      offset?: number;
      limit?: number;
    };
    const mode = b?.mode === "test" ? "test" : "prod";
    const offset = Number(b?.offset) || 0;
    let limit = Number(b?.limit) || 100;
    if (limit < 10 || limit > 100) {
      limit = 100;
    }
    // 총 2배치만 진행하는 mock: offset 0 → limit개(다음 있음), offset limit → 소량(마지막)
    const TOTAL = limit + 3;
    const remaining = Math.max(0, TOTAL - offset);
    const count = Math.min(limit, remaining);
    const items = Array.from({ length: count }, (_, i) => ({
      id: `pnp-sync-${mode}-${offset + i}`,
      name: `PointNexus Product ${offset + i}`,
    }));
    return HttpResponse.json({
      success: true,
      mode,
      offset,
      limit,
      count,
      has_more: count >= limit,
      synced_ok: count,
      synced_fail: 0,
      items,
      error: null,
    });
  }),

  // legacy pointnexus_catalogue.php — DB 카탈로그 조회.
  http.get(api("/admin/pointnexus/catalogue"), ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
    let limit = Number.parseInt(url.searchParams.get("limit") || "50", 10) || 50;
    if (limit < 10) {
      limit = 50;
    }
    if (limit > 200) {
      limit = 200;
    }
    const keyword = (url.searchParams.get("keyword") || "").toLowerCase();
    const publisher = url.searchParams.get("publisher") || "";
    const platform = url.searchParams.get("platform") || "";
    const preorder = url.searchParams.get("preorder") || "";
    const mapping = url.searchParams.get("mapping") || "";
    const stale = url.searchParams.get("stale") || "";

    const ALL = [
      {
        productID: "pnp-cat-0001",
        genericName: "A Plague Tale: Requiem",
        edition: "Standard",
        platform: "Steam",
        publisher: "Focus Entertainment",
        type: "sale",
        isPreOrder: false,
        releaseDate: "2026-05-30T09:00:00Z",
        prices: [
          { currency: "KRW", promo: true, initialFormatted: "49,000₩", priceFormatted: "34,300₩" },
        ],
        lastUpdatedAt: "2026-07-24T04:00:00Z",
        update_date: "20260724",
        mappedCodes: ["DG-G-1006"],
        mappedNames: ["발더스 게이트 3"],
        isDiscontinued: false,
      },
      {
        productID: "pnp-cat-0002",
        genericName: "Titan Quest II",
        edition: "Standard",
        platform: "Steam",
        publisher: "THQ Nordic",
        type: "build",
        isPreOrder: true,
        releaseDate: "2026-08-21T09:00:00Z",
        prices: [{ currency: "KRW", promo: false, initialFormatted: "45,000₩" }],
        lastUpdatedAt: "2026-07-20T04:00:00Z",
        update_date: "20260720",
        mappedCodes: [],
        mappedNames: [],
        isDiscontinued: true,
      },
    ];

    let rows = ALL;
    if (keyword) {
      rows = rows.filter(
        (r) =>
          r.genericName.toLowerCase().includes(keyword) ||
          r.productID.toLowerCase().includes(keyword) ||
          r.publisher.toLowerCase().includes(keyword),
      );
    }
    if (publisher) {
      rows = rows.filter((r) => r.publisher === publisher);
    }
    if (platform) {
      rows = rows.filter((r) => r.platform === platform);
    }
    if (preorder === "Y") {
      rows = rows.filter((r) => r.isPreOrder);
    } else if (preorder === "N") {
      rows = rows.filter((r) => !r.isPreOrder);
    }
    if (mapping === "Y") {
      rows = rows.filter((r) => r.mappedCodes.length > 0);
    } else if (mapping === "N") {
      rows = rows.filter((r) => r.mappedCodes.length === 0);
    }
    if (stale === "Y") {
      rows = rows.filter((r) => r.isDiscontinued);
    } else if (stale === "N") {
      rows = rows.filter((r) => !r.isDiscontinued);
    }

    const total = rows.length;
    const start = (page - 1) * limit;
    return HttpResponse.json({
      items: rows.slice(start, start + limit),
      total,
      publisher_list: ["Focus Entertainment", "THQ Nordic"],
      platform_list: ["Steam"],
    });
  }),

  // legacy pointnexus_catalogue.php action=delete — 삭제(매핑 시 차단).
  http.post(api("/admin/pointnexus/catalogue/delete"), async ({ request }) => {
    const b = (await request.json().catch(() => ({}))) as { productID?: string };
    // pnp-cat-0001은 매핑됨 → 차단 예시
    if (b?.productID === "pnp-cat-0001") {
      return HttpResponse.json({
        success: false,
        message: "매핑된 상품은 삭제할 수 없습니다. 먼저 매핑을 해제하세요.",
        flash_type: "warning",
      });
    }
    return HttpResponse.json({
      success: true,
      message: `삭제되었습니다: ${b?.productID ?? ""}`,
      flash_type: "success",
    });
  }),

  // legacy pointnexus_operation.php — 오퍼레이션 단건 조회(runOperation).
  http.get(api("/admin/pointnexus/operation"), ({ request }) => {
    const url = new URL(request.url);
    const id = url.searchParams.get("id") || "";
    return HttpResponse.json({
      success: true,
      data: {
        state: "done",
        type: "sale",
        qtyToProcess: 1,
        qtyProcessed: 1,
        qtyInError: 0,
        createdAt: "2026-07-24T02:11:03Z",
        lastUpdatedAt: "2026-07-24T02:11:07Z",
        buildID: "pnp-0001-a2b3-c4d5-e6f7-0001",
        productVariant: { countryCodes: "KR" },
        capsule: {
          id: "cap-01H8X7A9K2M3N4P5Q6R7S8T9U0",
          item: { key: "XXXXX-YYYYY-ZZZZZ", platform: "Steam" },
        },
        details: {
          sellPrice: 34300,
          sellCurrencyCode: "KRW",
          VAT: 1000,
          convertedCurrencyCode: "USD",
          sellPriceConverted: 2500,
          conversionRate: "0.00073",
          SRPBeforePromo: 4900,
          SRP: 3430,
          promoName: "Summer Sale",
          promoDiscountPct: 30,
          revSharePct: 70,
          publisherShareAmount: 1750,
          publisherCurrencyCode: "USD",
          sellerShareAmount: 750,
          sellerCurrencyCode: "USD",
        },
        operationID: id,
      },
    });
  }),

  // legacy pointnexus_activity_log.php — 활동 로그 목록(runActivityLog, offset/limit/sort).
  http.get(api("/admin/pointnexus/activity-logs"), ({ request }) => {
    const url = new URL(request.url);
    const offset = Math.max(0, Number.parseInt(url.searchParams.get("offset") || "0", 10) || 0);
    let limit = Number.parseInt(url.searchParams.get("limit") || "50", 10) || 50;
    if (limit < 10) {
      limit = 50;
    }
    if (limit > 100) {
      limit = 100;
    }

    const ALL = [
      {
        id: "log-0001-a2b3-c4d5-e6f7-0001",
        type: "sale",
        createdAt: "2026-07-24T02:11:03Z",
        operationID: "op-1001-a2b3-c4d5-e6f7-0001",
        product: { id: "pnp-0001-a2b3-c4d5-e6f7-0001", genericName: "A Plague Tale: Requiem" },
      },
      {
        id: "log-0002-a2b3-c4d5-e6f7-0002",
        type: "cancel",
        createdAt: "2026-07-24T01:47:55Z",
        operationID: "op-1002-a2b3-c4d5-e6f7-0002",
        product: { id: "pnp-0002-a2b3-c4d5-e6f7-0002", genericName: "Titan Quest II" },
      },
      {
        id: "log-0003-a2b3-c4d5-e6f7-0003",
        type: "reveal",
        createdAt: "2026-07-23T23:30:10Z",
        operationID: "",
        product: null,
      },
    ];

    const total = ALL.length;
    const data = ALL.slice(offset, offset + limit);
    return HttpResponse.json({ success: true, data, count: total });
  }),

  // legacy pointnexus_capsule.php — 캡슐 단건 조회(runCapsule).
  http.get(api("/admin/pointnexus/capsule"), ({ request }) => {
    const url = new URL(request.url);
    const id = url.searchParams.get("id") || "";
    return HttpResponse.json({
      success: true,
      data: [
        {
          id,
          status: "success",
          poolName: "steam-key-pool",
          createdAt: "2026-07-20T04:12:30Z",
          lastUpdatedAt: "2026-07-20T04:13:02Z",
          flowCodename: "steam-activation",
          flowVersion: 3,
          flowID: "f10a2b3c-4d5e-6f70-8091-a2b3c4d5e6f7",
          productID: "pnp-0001-a2b3-c4d5-e6f7-0001",
          metadata: { region: "KR", source: "directg" },
          productVariant: { edition: "Standard" },
          productSnapshot: {},
          fulfilledKey: "XXXXX-YYYYY-ZZZZZ",
        },
      ],
    });
  }),

  // legacy pointnexus_product.php — 판매 가능 상품 목록(runProduct, offset/limit).
  http.get(api("/admin/pointnexus/products-sale"), ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
    let limit = Number.parseInt(url.searchParams.get("limit") || "50", 10) || 50;
    if (limit < 10) {
      limit = 50;
    }
    if (limit > 100) {
      limit = 100;
    }
    const offset = (page - 1) * limit;

    const ALL = [
      {
        id: "pnp-0001-a2b3-c4d5-e6f7-0001",
        genericName: "A Plague Tale: Requiem",
        platform: "Steam",
        publisher: "Focus Entertainment",
        type: "sale",
        isPreOrder: false,
        genres: ["Adventure", "Action"],
        prices: [
          { currency: "KRW", promo: true, initialFormatted: "49,000₩", priceFormatted: "34,300₩" },
          { currency: "JPY", promo: false, priceFormatted: "4,900円" },
          { currency: "EUR", promo: false, priceFormatted: "39,99€" },
        ],
        allowedCurrencies: ["KRW", "JPY", "USD", "EUR", "GBP"],
        allowedCountries: ["KR", "JP", "US", "DE", "FR"],
        releaseDate: "2026-05-30T09:00:00Z",
      },
      {
        id: "pnp-0002-a2b3-c4d5-e6f7-0002",
        genericName: "Titan Quest II",
        platform: "Steam",
        publisher: "THQ Nordic",
        type: "build",
        isPreOrder: true,
        genres: ["RPG"],
        prices: [{ currency: "KRW", promo: false, priceFormatted: "45,000₩" }],
        allowedCurrencies: ["KRW", "USD"],
        allowedCountries: ["KR", "US"],
        releaseDate: "2026-08-21T09:00:00Z",
      },
    ];

    const data = ALL.slice(offset, offset + limit);
    return HttpResponse.json({ success: true, data, count: data.length });
  }),

  // legacy pointnexus_promo.php — 프로모션 캠페인 목록(runPromo).
  http.get(api("/admin/pointnexus/promos"), () => {
    const data = [
      {
        id: "a7b8c9d0-e1f2-4a3b-4c5d-6e7f8091a2b3",
        name: "여름 스팀 세일 캠페인",
        state: "running",
        issuer: { name: "Bandai Namco Europe" },
        productIDs: ["p1", "p2", "p3"],
        startDate: "2026-07-20T00:00:00Z",
        endDate: "2026-08-03T23:59:59Z",
      },
      {
        id: "b8c9d0e1-f2a3-4b4c-5d6e-7f8091a2b3c4",
        name: "가을 신작 예약 캠페인",
        state: "scheduled",
        issuer: { name: "Nexus Distribution" },
        productIDs: ["p4"],
        startDate: "2026-09-01T00:00:00Z",
        endDate: "2026-09-30T23:59:59Z",
      },
      {
        id: "c9d0e1f2-a3b4-4c5d-6e7f-8091a2b3c4d5",
        name: "봄 프로모션(종료)",
        state: "ended",
        issuer: { name: "GamesPlanet" },
        productIDs: [],
        startDate: "2026-03-01T00:00:00Z",
        endDate: "2026-03-31T23:59:59Z",
      },
    ];
    return HttpResponse.json({ success: true, data, count: data.length });
  }),
];
