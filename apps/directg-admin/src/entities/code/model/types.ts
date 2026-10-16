// legacy code/* — 코드 관리(플랫폼/공급처/배송방법).

// platform_list.php — getPlatformList
export type PlatformCodeItem = {
  idx: number;
  platform: string;
  flag: string; // 사용여부(raw)
};
export type PlatformListResponse = {
  items: PlatformCodeItem[];
};

// publisher_list.php — getPublisherList (base is_view='Y', publisher_name ASC, 30/page)
export type PublisherSearch = {
  page: number;
  search_type: string; // publisher_name
  search_value: string;
};
export type PublisherItem = {
  publisher_code: string;
  publisher_name: string;
  is_view: string;
  publisher_site: string;
  publisher_image: string;
  goods_count: number; // getPublisherGoodsItemCount
};
export type PublisherPagination = {
  current_page: number;
  results_per_page: number;
  total_results: number;
  total_pages: number;
};
export type PublisherListResponse = {
  items: PublisherItem[];
  pagination: PublisherPagination;
};
// publisher_ps.php mode=register (admin_level==99)
export type RegisterPublisherRequest = {
  publisher_name: string;
  publisher_link: string;
  publisher_logo: string;
};
export type RegisterPublisherResponse = { success: boolean; message: string };

// delivery_method.php — getDeliveryMethodList (컬럼명 대문자 그대로)
export type DeliveryMethodItem = {
  DELIVERY_METHOD_ID: string;
  METHOD_NAME: string;
  DELIVERY_TYPE: string;
  BASE_FEE: number;
  FREE_THRESHOLD: number;
  IS_TRACKABLE: string;
  EXPECTED_DAYS: number;
  CUT_OFF_TIME: string;
  AREA_SURCHARGE_YN: string;
  RETURN_FEE: number;
  USE_YN: string;
};
export type DeliveryMethodListResponse = {
  items: DeliveryMethodItem[];
};
