import { http, HttpResponse } from "msw";
import { env } from "@shared/config/env";
import type { AssetCodeOption, AssetStockItem } from "@entities/asset-stock";

const api = (path: string) => `${env.apiBaseUrl}${path}`;

const PER_PAGE = 30;

// legacy tbl_asset_code (code_id/name) — 필터 드롭다운. name asc.
const PUBLISHER: AssetCodeOption[] = [
  { code_id: "PUBL001", name: "Bandai Namco" },
  { code_id: "PUBL002", name: "Capcom" },
  { code_id: "PUBL003", name: "Nintendo" },
];
const PRODUCT_TYPE: AssetCodeOption[] = [
  { code_id: "PDTP001", name: "DLC" },
  { code_id: "PDTP002", name: "Game" },
];
const ASSET_TYPE: AssetCodeOption[] = [
  { code_id: "ASTP001", name: "Key" },
  { code_id: "ASTP002", name: "Keyless" },
];
const PLATFORM: AssetCodeOption[] = [
  { code_id: "PLFM001", name: "Steam" },
  { code_id: "PLFM002", name: "Switch" },
];

// legacy tbl_asset(동기화 미러). publisher<>'EA' AND is_view='Y'. order stock asc, update_dt desc.
const ASSETS: AssetStockItem[] = [
  {
    asset_id: "A5001",
    asset_name: "Zelda TOTK Standard",
    productType: "Game",
    assetType: "Key",
    platform: "Switch",
    publisher: "Nintendo",
    stock: 0,
    update_dt: "2026-07-27 10:12:00",
  },
  {
    asset_id: "A5003",
    asset_name: "Metroid Prime Remastered",
    productType: "Game",
    assetType: "Key",
    platform: "Switch",
    publisher: "Nintendo",
    stock: 5,
    update_dt: "2026-07-26 18:40:00",
  },
  {
    asset_id: "A5100",
    asset_name: "Street Fighter 6 DLC Pack",
    productType: "DLC",
    assetType: "Keyless",
    platform: "Steam",
    publisher: "Capcom",
    stock: 24,
    update_dt: "2026-07-25 09:05:00",
  },
  {
    asset_id: "A5200",
    asset_name: "Elden Ring Deluxe",
    productType: "Game",
    assetType: "Key",
    platform: "Steam",
    publisher: "Bandai Namco",
    stock: 132,
    update_dt: "2026-07-20 14:22:00",
  },
];

// Cd(code_id) → name (getAssetCodeInfo). 매칭 없으면 "".
const codeName = (options: AssetCodeOption[], codeId: string) =>
  options.find((o) => o.code_id === codeId)?.name ?? "";

export const assetStockHandlers = [
  http.get(api("/admin/goods/stock/asset"), ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page")) || 1;
    const assetId = url.searchParams.get("asset_id") ?? "";
    const assetName = url.searchParams.get("asset_name") ?? "";
    const publisher = codeName(PUBLISHER, url.searchParams.get("publisherCd") ?? "");
    const assetType = codeName(ASSET_TYPE, url.searchParams.get("assetTypeCd") ?? "");
    const productType = codeName(PRODUCT_TYPE, url.searchParams.get("productTypeCd") ?? "");
    const platform = codeName(PLATFORM, url.searchParams.get("platformCd") ?? "");

    const filtered = ASSETS.filter((a) => {
      if (assetId && a.asset_id !== assetId) return false;
      if (assetName && !a.asset_name.includes(assetName)) return false;
      if (publisher && a.publisher !== publisher) return false;
      if (assetType && a.assetType !== assetType) return false;
      if (productType && a.productType !== productType) return false;
      if (platform && a.platform !== platform) return false;
      return true;
    });

    const totalResults = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE));
    const items = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    return HttpResponse.json({
      items,
      pagination: { total_results: totalResults, total_pages: totalPages },
      codes: {
        publisher: PUBLISHER,
        product_type: PRODUCT_TYPE,
        asset_type: ASSET_TYPE,
        platform: PLATFORM,
      },
    });
  }),
  // 개별/저재고 동기화: mock은 정적 목록 — 성공 응답만(실제 Asset API 갱신은 백엔드).
  http.post(api("/admin/goods/stock/asset/check"), () => HttpResponse.json({ success: true })),
  http.post(api("/admin/goods/stock/asset/check-batch"), () =>
    HttpResponse.json({ success: true }),
  ),
];
