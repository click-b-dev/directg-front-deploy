// legacy supply_content.php — 제공컨텐츠 현황(getSupplyContentList + getSupplyContentGoodsList).

export type SupplyContentSearch = {
  page: number;
  search_value: string;
  search_supply_content_type: string; // P(한글패치) | C(컨텐츠)
  search_is_encode: string; // Y | N
};

// 제공 상품정보 서브목록 항목.
export type SupplyContentGoods = {
  goods_code: string;
  goods_nm: string;
  asset_id: string;
  is_free: "Y" | "N";
};

export type SupplyContentItem = {
  idx: number;
  supply_content_type: "P" | "C";
  supply_content: string;
  supply_content_url: string;
  is_encode: "Y" | "N";
  encode_type: string; // is_encode=Y일 때만 표시
  goods: SupplyContentGoods[];
};

export type SupplyContentPagination = {
  current_page: number;
  results_per_page: number;
  total_results: number;
  total_pages: number;
};

export type SupplyContentListResponse = {
  items: SupplyContentItem[];
  pagination: SupplyContentPagination;
};

// legacy supply_content_member.php — 회원별 제공컨텐츠 조회(페이지네이션 없음).
export type SupplyContentMemberSearch = {
  search_key: string; // search_m_id
  search_value: string; // 회원 아이디
};
export type SupplyContentMemberItem = {
  idx: number;
  supply_content_type: "P" | "C";
  supply_content: string;
  supply_content_url: string;
  is_encode: "Y" | "N";
  encode_type: string;
  patch_password: string; // is_encode=Y일 때 patchEncDataAdmin 결과(백엔드 계산)
};
export type SupplyContentMemberResponse = {
  member_id: string; // 조회된 회원 아이디(에코)
  items: SupplyContentMemberItem[];
};

// legacy supply_content_download.php — 제공컨텐츠 다운로드 현황(getKoreanPatchDownloadLog, 50/page).
export type PatchDownloadSearch = {
  page: number;
  search_key: string; // search_m_id
  search_value: string; // 회원 아이디(등호)
};
export type PatchDownloadItem = {
  idx: number;
  m_id: string;
  patch_name: string;
  count: number;
  ip: string;
  reg_date: string;
  last_download: string;
};
export type PatchDownloadResponse = {
  items: PatchDownloadItem[];
  pagination: SupplyContentPagination;
};
