// legacy goods/stock/genba_avaliability.php — Genba availability webhook log(read-only).
// docs/migration/admin/stock/genba-avaliability.md.

export type GenbaAvailabilityLogSearch = {
  page: number;
  search_key: string; // search_sku | search_name
  search_value: string;
};

// genba_webhook_log(a) ⋈ tbl_goods_item_delivery(b) 로그 행.
export type GenbaAvailabilityLogItem = {
  transactionid: string;
  sku: string;
  item_name: string; // name 컬럼
  status: string;
  message: string;
  reg_date: string;
};

export type GenbaAvailabilityLogListResponse = {
  items: GenbaAvailabilityLogItem[];
  pagination: { total_results: number; total_pages: number };
};
