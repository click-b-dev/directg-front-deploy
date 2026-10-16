import { http, HttpResponse } from "msw";
import { env } from "@shared/config/env";
import type { AssetCodeOption, GoodsOptionStockItem } from "@entities/goods-option-stock";

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

// legacy tbl_goods_item ⋈ tbl_goods_item_delivery. status=0 고정. order stock asc, item_name asc.
const ITEMS: GoodsOptionStockItem[] = [
  {
    product_code: "DG30001",
    product_name: "젤다의 전설 티어스 오브 더 킹덤",
    soldout: "N",
    status: "0",
    item_id: "A5001",
    item_name: "Zelda TOTK Standard",
    item_type: "일반(디지털)",
    item_platform: "Switch",
    item_publisher: "Nintendo",
    stock: 0,
    update_date: "2026-07-27 10:12:00",
  },
  {
    product_code: "DG30003",
    product_name: "메트로이드 프라임 리마스터드",
    soldout: "Y",
    status: "0",
    item_id: "A5003",
    item_name: "Metroid Prime Remastered",
    item_type: "일반(디지털)",
    item_platform: "Switch",
    item_publisher: "Nintendo",
    stock: 0,
    update_date: "2026-07-26 18:40:00",
  },
  {
    product_code: "DG30100",
    product_name: "스트리트 파이터 6 DLC",
    soldout: "N",
    status: "0",
    item_id: "A5100",
    item_name: "Street Fighter 6 DLC Pack",
    item_type: "확장(디지털)",
    item_platform: "Steam",
    item_publisher: "Capcom",
    stock: 24,
    update_date: "2026-07-25 09:05:00",
  },
];

const codeName = (options: AssetCodeOption[], codeId: string) =>
  options.find((o) => o.code_id === codeId)?.name ?? "";

export const goodsOptionStockHandlers = [
  http.get(api("/admin/goods/stock/goods-option"), ({ request }) => {
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
  // 재고 동기화는 #154와 동일 엔드포인트(asset_stock_ps.php 공유) → asset-stock 핸들러가 처리.
];
