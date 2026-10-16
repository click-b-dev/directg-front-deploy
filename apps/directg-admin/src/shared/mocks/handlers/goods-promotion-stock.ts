import { http, HttpResponse } from "msw";
import { env } from "@shared/config/env";
import type { AssetCodeOption, GoodsPromotionStockItem } from "@entities/goods-promotion-stock";

const api = (path: string) => `${env.apiBaseUrl}${path}`;

const PER_PAGE = 30;

const PUBLISHER: AssetCodeOption[] = [
  { code_id: "PUBL001", name: "Bandai Namco" },
  { code_id: "PUBL002", name: "Capcom" },
  { code_id: "PUBL003", name: "Nintendo" },
];
const PRODUCT_TYPE: AssetCodeOption[] = [
  { code_id: "PDTP001", name: "DLC" },
  { code_id: "PDTP002", name: "Game" },
];

// legacy: 진행중 할인 프로모션 상품(promotion_schedule 조인). status=0 고정. order stock asc, item_name asc.
const ITEMS: GoodsPromotionStockItem[] = [
  {
    product_code: "DG30100",
    product_name: "스트리트 파이터 6 DLC (할인중)",
    soldout: "N",
    status: "0",
    item_id: "A5100",
    item_name: "Street Fighter 6 DLC Pack",
    item_type: "확장(디지털)",
    item_platform: "Steam",
    item_publisher: "Capcom",
    stock: 12,
    update_date: "2026-07-27 09:05:00",
  },
  {
    product_code: "DG30200",
    product_name: "엘든 링 (여름 세일)",
    soldout: "Y",
    status: "0",
    item_id: "A5200",
    item_name: "Elden Ring Deluxe",
    item_type: "일반(디지털)",
    item_platform: "Steam",
    item_publisher: "Bandai Namco",
    stock: 0,
    update_date: "2026-07-26 14:22:00",
  },
];

const codeName = (options: AssetCodeOption[], codeId: string) =>
  options.find((o) => o.code_id === codeId)?.name ?? "";

export const goodsPromotionStockHandlers = [
  http.get(api("/admin/goods/stock/goods-promotion"), ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page")) || 1;
    const searchKey = url.searchParams.get("search_key") || "search_name";
    const searchValue = url.searchParams.get("search_value") ?? "";
    const publisher = codeName(PUBLISHER, url.searchParams.get("publisherCd") ?? "");

    const filtered = ITEMS.filter((it) => {
      if (searchValue) {
        if (searchKey === "search_name" && !it.product_name.includes(searchValue)) return false;
        if (searchKey === "search_product_code" && it.product_code !== searchValue) return false;
        if (searchKey === "search_asset_id" && it.item_id !== searchValue) return false;
        if (searchKey === "search_asset_name" && !it.item_name.includes(searchValue)) return false;
      }
      if (publisher && it.item_publisher !== publisher) return false;
      return true;
    });

    const totalResults = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE));
    const items = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    return HttpResponse.json({
      items,
      pagination: { total_results: totalResults, total_pages: totalPages },
      codes: { publisher: PUBLISHER, product_type: PRODUCT_TYPE },
    });
  }),
  // 재고 동기화는 #154/#155와 동일 엔드포인트(asset_stock_ps.php 공유) → asset-stock 핸들러가 처리.
];
