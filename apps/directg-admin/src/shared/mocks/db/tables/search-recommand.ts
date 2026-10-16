import { createTable } from "../table";

// legacy tbl_search_recommand 도출 — docs/migration/admin/site/search-recommand.md.
export type SearchRecommandRow = {
  idx: number;
  keyword: string;
  link_url: string;
  click_count: number;
  recommand_sort: number; // 노출 슬롯 번호(1~4). 비노출/보관은 0.
  is_view: "Y" | "N";
  is_del: "Y" | "N";
};

const makeRow = (idx: number, over: Partial<SearchRecommandRow>): SearchRecommandRow => ({
  idx,
  keyword: `검색어 ${idx}`,
  link_url: "",
  click_count: 0,
  recommand_sort: 0,
  is_view: "N",
  is_del: "N",
  ...over,
});

// 슬롯 1~3 채움(4는 빈칸) + 보관 목록(2쪽). link_url 있음/없음 혼재로 자동링크 표시 확인.
const seed: readonly SearchRecommandRow[] = [
  makeRow(1, {
    keyword: "닌텐도",
    click_count: 15234,
    recommand_sort: 1,
    is_view: "Y",
    link_url: "",
  }),
  makeRow(2, {
    keyword: "포켓몬",
    click_count: 9821,
    recommand_sort: 2,
    is_view: "Y",
    link_url: "/game/game_view.html?product_id=3001",
  }),
  makeRow(3, { keyword: "젤다", click_count: 7654, recommand_sort: 3, is_view: "Y", link_url: "" }),
  // 슬롯 4는 비어있음(is_view Y & sort=4 없음)
  // 보관 목록(is_view N) idx 4~25
  ...Array.from({ length: 22 }, (_, i) => {
    const idx = i + 4;
    return makeRow(idx, {
      keyword: `보관검색어 ${idx}`,
      click_count: (idx * 37) % 500,
      is_view: "N",
      recommand_sort: 0,
      link_url: idx % 3 === 0 ? `/game/game_view.html?product_id=${3000 + idx}` : "",
    });
  }),
];

export const searchRecommandTable = createTable(seed);
