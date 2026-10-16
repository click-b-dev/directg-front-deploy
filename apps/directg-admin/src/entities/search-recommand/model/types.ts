// legacy tbl_search_recommand (docs/migration/admin/site/search-recommand.md).

// 노출 슬롯(recommand_sort 1~4, is_view='Y') 매핑 항목.
export type SearchRecommandSlot = {
  idx: number;
  keyword: string;
  link_url: string;
  click_count: number;
};

// 하단 보관/관리 목록 항목(슬롯 제외 나머지).
export type SearchRecommandListItem = {
  idx: number;
  keyword: string;
  link_url: string;
  click_count: number;
};

export type SearchRecommandPagination = {
  current_page: number;
  results_per_page: number;
  total_results: number;
  total_pages: number;
};

// GET 응답: 슬롯 4칸 + 하단 목록(페이징).
export type SearchRecommandResponse = {
  slots: (SearchRecommandSlot | null)[];
  list: {
    items: SearchRecommandListItem[];
    pagination: SearchRecommandPagination;
  };
};

export type SearchRecommandListQuery = {
  page?: number;
  search_keyword?: string;
};

// legacy mode=slot_register: 슬롯에 새 검색어 등록(기존 슬롯 교체).
export type SlotRegisterRequest = { slot: number; keyword: string; link_url: string };
// legacy mode=modify: 검색어 내용 수정.
export type SearchRecommandModifyRequest = { keyword: string; link_url: string };
// legacy mode=slot_assign: 보관 검색어를 슬롯에 노출.
export type SlotAssignRequest = { slot: number };

export type SearchRecommandMutationResponse = { success: boolean };
