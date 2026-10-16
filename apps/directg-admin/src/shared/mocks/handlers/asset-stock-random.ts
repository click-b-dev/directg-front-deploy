import { http, HttpResponse } from "msw";
import { env } from "@shared/config/env";
import type { AssetCodeOption, AssetStockRandomItem } from "@entities/asset-stock-random";

const api = (path: string) => `${env.apiBaseUrl}${path}`;

const PER_PAGE = 30;

const PUBLISHER: AssetCodeOption[] = [
  { code_id: "PUBL003", name: "Nintendo" },
  { code_id: "PUBL004", name: "Gugenka" },
];
const PRODUCT_TYPE: AssetCodeOption[] = [
  { code_id: "PDTP002", name: "Game" },
  { code_id: "PDTP003", name: "홀로 모델 본체" },
];
const PLATFORM: AssetCodeOption[] = [
  { code_id: "PLFM001", name: "Steam" },
  { code_id: "PLFM003", name: "HoloModels" },
];

// legacy tbl_asset(assetType='랜덤박스' 고정). order stock asc, asset_id asc.
const ASSETS: AssetStockRandomItem[] = [
  {
    asset_id: "A7001",
    asset_name: "홀로모델 랜덤박스 Vol.1",
    productType: "홀로 모델 본체",
    assetType: "랜덤박스",
    platform: "HoloModels",
    publisher: "Gugenka",
    stock: 0,
    update_dt: "2026-07-27 10:05:00",
  },
  {
    asset_id: "A7002",
    asset_name: "홀로모델 랜덤박스 Vol.2",
    productType: "홀로 모델 본체",
    assetType: "랜덤박스",
    platform: "HoloModels",
    publisher: "Gugenka",
    stock: 48,
    update_dt: "2026-07-26 18:40:00",
  },
];

const codeName = (options: AssetCodeOption[], codeId: string) =>
  options.find((o) => o.code_id === codeId)?.name ?? "";

export const assetStockRandomHandlers = [
  http.get(api("/admin/goods/stock/asset-random"), ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page")) || 1;
    const assetId = url.searchParams.get("asset_id") ?? "";
    const assetName = url.searchParams.get("asset_name") ?? "";
    const publisher = codeName(PUBLISHER, url.searchParams.get("publisherCd") ?? "");
    const productType = codeName(PRODUCT_TYPE, url.searchParams.get("productTypeCd") ?? "");
    const platform = codeName(PLATFORM, url.searchParams.get("platformCd") ?? "");

    const filtered = ASSETS.filter((a) => {
      if (assetId && a.asset_id !== assetId) return false;
      if (assetName && !a.asset_name.includes(assetName)) return false;
      if (publisher && a.publisher !== publisher) return false;
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
      codes: { publisher: PUBLISHER, product_type: PRODUCT_TYPE, platform: PLATFORM },
    });
  }),
  // 재고확인은 #154와 동일 엔드포인트(asset_stock_ps.php 공유) → asset-stock 핸들러가 처리.
];
