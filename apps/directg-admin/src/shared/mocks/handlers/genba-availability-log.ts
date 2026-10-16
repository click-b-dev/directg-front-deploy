import { http, HttpResponse } from "msw";
import { env } from "@shared/config/env";
import type { GenbaAvailabilityLogItem } from "@entities/genba-availability-log";

const api = (path: string) => `${env.apiBaseUrl}${path}`;

const PER_PAGE = 20; // legacy 메서드 하드코딩(페이지가 넘긴 '30' 무시)

// legacy genba_webhook_log ⋈ tbl_goods_item_delivery. webhook_type='avaliability'. reg_date desc.
const LOGS: GenbaAvailabilityLogItem[] = [
  {
    transactionid: "TXN-20260727-0002",
    sku: "GENBA-SKU-0002",
    item_name: "Metaphor: ReFantazio",
    status: "AVAILABLE",
    message: "stock available",
    reg_date: "2026-07-27 11:20:31",
  },
  {
    transactionid: "TXN-20260727-0001",
    sku: "GENBA-SKU-0001",
    item_name: "Persona 3 Reload",
    status: "OUT_OF_STOCK",
    message: "no stock",
    reg_date: "2026-07-27 09:02:10",
  },
];

export const genbaAvailabilityLogHandlers = [
  http.get(api("/admin/goods/stock/genba-availability"), ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page")) || 1;
    const searchKey = url.searchParams.get("search_key") || "search_sku";
    const searchValue = url.searchParams.get("search_value") ?? "";

    const filtered = LOGS.filter((log) => {
      if (!searchValue) return true;
      if (searchKey === "search_sku") return log.sku === searchValue;
      if (searchKey === "search_name") return log.item_name.includes(searchValue);
      return true;
    });

    const totalResults = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE));
    const items = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    return HttpResponse.json({
      items,
      pagination: { total_results: totalResults, total_pages: totalPages },
    });
  }),
];
