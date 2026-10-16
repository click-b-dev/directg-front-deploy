// legacy tbl_main_banner (docs/migration/admin/site/banner-list.md).
// banner_start/banner_end는 legacy처럼 unix epoch 초(int) 유지 — 표시 포맷은 프론트 담당.

export type BannerFlag = "Y" | "N";

export type MainBannerListItem = {
  idx: number;
  banner_sort: number;
  banner_pc: string;
  banner_mobile: string;
  banner_link: string;
  banner_target: string;
  banner_title: string;
  product_code: string;
  banner_publisher: string;
  banner_start: number;
  banner_end: number;
  flag: BannerFlag;
  bannerPeriodOutputFl: BannerFlag;
};

// legacy Pagination.php(results_per_page=20) 메타.
export type MainBannerPagination = {
  current_page: number;
  results_per_page: number;
  total_results: number;
  total_pages: number;
};

export type MainBannerListResponse = {
  items: MainBannerListItem[];
  pagination: MainBannerPagination;
};

// legacy GET 파라미터(banner_list.php): page/search_banner_title/search_flag.
export type MainBannerListQuery = {
  page?: number;
  search_banner_title?: string;
  search_flag?: BannerFlag | "";
};

// legacy banner_proc.php: banner_sort_up(=-1) / banner_sort_down(=+1).
export type BannerSortDirection = "up" | "down";

export type BannerMutationResponse = { success: boolean };

// legacy banner_proc.php register — 폼 필드 그대로. 날짜는 "YYYY-MM-DD HH:MM:SS" 문자열(서버가 strtotime).
export type CreateMainBannerRequest = {
  banner_title: string;
  banner_pc: string;
  banner_mobile: string;
  product_code: string;
  banner_publisher: string;
  banner_link: string;
  banner_target: string;
  banner_start: string;
  banner_end: string;
  banner_sort: string;
  flag: BannerFlag;
  bannerPeriodOutputFl: BannerFlag;
  show_prod_info: string;
  show_sale_info: string;
};

// legacy banner_proc.php banner_link_search — product_code로 상세 링크 조립(미존재 시 "").
export type BannerLinkResponse = { banner_link: string };

// legacy banner_modify.php: select * from tbl_main_banner where idx — 폼 프리필용 단건.
export type MainBannerDetail = MainBannerListItem & {
  show_prod_info: string;
  show_sale_info: string;
};

// legacy banner_proc.php modify — register와 동일 필드 UPDATE(WHERE idx).
export type UpdateMainBannerRequest = CreateMainBannerRequest;
