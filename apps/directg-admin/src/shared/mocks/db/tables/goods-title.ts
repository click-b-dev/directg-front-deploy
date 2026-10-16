import { createTable } from "../table";

// legacy tbl_goods(title_code='33') + enrichment을 mock에서는 행에 직접 보관(실제 6테이블 조인은 백엔드).
// docs/migration/admin/goods/title-list.md 계약 기준.
type Counts = {
  game_9: number;
  game_0: number;
  game_3: number;
  edition_9: number;
  edition_0: number;
  edition_3: number;
  dlc_9: number;
  dlc_0: number;
  dlc_3: number;
  holo_9: number;
  holo_0: number;
  holo_3: number;
  holo_edition_9: number;
  holo_edition_0: number;
  holo_edition_3: number;
  holo_dlc_9: number;
  holo_dlc_0: number;
  holo_dlc_3: number;
};

export type GoodsTitleRow = {
  title_id: number;
  title_code: string; // '33' 디지털
  title_name: string;
  title_name_en: string;
  sku: string;
  publisher: string;
  developer: string;
  release_date: string;
  interface_korean: "Y" | "N";
  subtitle_korean: "Y" | "N";
  spoken_korean: "Y" | "N";
  exclusive_korean: "Y" | "N";
  is_view: "Y" | "N";
  sales_status: "C" | "S" | "E" | "";
  coming_soon: "Y" | "N";
  coming_soon_date: string;
  model_name: string;
  steam_appid: number;
  steam_synced: boolean;
  franchise_idx: number;
  franchise_name: string;
  drm_notice: string;
  ext_user_account_notice: string;
  hit: number;
  rateno: number;
  age_limit: string;
  game_rate: string; // 내용정보표시 7자리 2진(선정성64…사행성1)
  counts: Counts;
  grac: {
    orgname: string;
    entname: string;
    rateddate: string;
    givenrate: string;
    descriptors: string;
  } | null;
  genres: { code: string; name: string }[];
  categories: { code: string; name: string }[];
};

const zeroCounts = (over: Partial<Counts> = {}): Counts => ({
  game_9: 0,
  game_0: 0,
  game_3: 0,
  edition_9: 0,
  edition_0: 0,
  edition_3: 0,
  dlc_9: 0,
  dlc_0: 0,
  dlc_3: 0,
  holo_9: 0,
  holo_0: 0,
  holo_3: 0,
  holo_edition_9: 0,
  holo_edition_0: 0,
  holo_edition_3: 0,
  holo_dlc_9: 0,
  holo_dlc_0: 0,
  holo_dlc_3: 0,
  ...over,
});

const makeRow = (titleId: number, over: Partial<GoodsTitleRow>): GoodsTitleRow => ({
  title_id: titleId,
  title_code: "33",
  title_name: `디지털 게임 ${titleId}`,
  title_name_en: `Digital Game ${titleId}`,
  sku: `SKU${10000 + titleId}`,
  publisher: "H2 Interactive",
  developer: "H2 Studio",
  release_date: "2026-06-01",
  interface_korean: "Y",
  subtitle_korean: "N",
  spoken_korean: "N",
  exclusive_korean: "N",
  is_view: "Y",
  sales_status: "S",
  coming_soon: "N",
  coming_soon_date: "",
  model_name: "",
  steam_appid: 0,
  steam_synced: true,
  franchise_idx: 0,
  franchise_name: "",
  drm_notice: "",
  ext_user_account_notice: "",
  hit: (titleId * 137) % 9000,
  rateno: 0,
  age_limit: "15",
  game_rate: "0000000",
  counts: zeroCounts(),
  grac: null,
  genres: [],
  categories: [],
  ...over,
});

const seed: readonly GoodsTitleRow[] = [
  makeRow(1001, {
    title_name: "젤다의 전설 왕국의 눈물",
    title_name_en: "Zelda TotK",
    publisher: "닌텐도",
    developer: "Nintendo EPD",
    sales_status: "S",
    age_limit: "12",
    interface_korean: "Y",
    subtitle_korean: "Y",
    spoken_korean: "Y",
    steam_appid: 0,
    rateno: 5001,
    game_rate: "0100000", // 폭력성(32)
    franchise_idx: 1,
    franchise_name: "젤다의 전설",
    hit: 15234,
    counts: zeroCounts({ game_0: 1, edition_0: 2, dlc_9: 1 }),
    grac: {
      orgname: "게임물관리위원회",
      entname: "닌텐도",
      rateddate: "2023-05-01",
      givenrate: "12세이용가",
      descriptors: "폭력성",
    },
    genres: [
      { code: "10", name: "액션" },
      { code: "11", name: "어드벤처" },
    ],
    categories: [{ code: "50", name: "싱글 플레이어" }],
  }),
  makeRow(1002, {
    title_name: "발더스 게이트 3",
    title_name_en: "Baldur's Gate 3",
    publisher: "라리안",
    developer: "Larian Studios",
    sales_status: "S",
    age_limit: "19",
    interface_korean: "Y",
    subtitle_korean: "Y",
    exclusive_korean: "Y",
    steam_appid: 1086940,
    steam_synced: false,
    rateno: 5002,
    game_rate: "1100000", // 선정성(64)+폭력성(32)
    hit: 22110,
    counts: zeroCounts({ game_0: 1, dlc_0: 3 }),
    grac: {
      orgname: "게임물관리위원회",
      entname: "라리안",
      rateddate: "2023-08-01",
      givenrate: "청소년이용불가",
      descriptors: "선정성, 폭력성",
    },
    genres: [{ code: "12", name: "RPG" }],
    categories: [
      { code: "50", name: "싱글 플레이어" },
      { code: "51", name: "멀티플레이어" },
    ],
  }),
  makeRow(1003, {
    title_name: "판매예정 신작",
    sales_status: "C",
    age_limit: "15",
    is_view: "N",
    coming_soon: "Y",
    coming_soon_date: "2026년 겨울",
    steam_appid: 999999,
    steam_synced: false,
    hit: 300,
    counts: zeroCounts({ game_9: 1, edition_9: 1 }),
  }),
  makeRow(1004, {
    title_name: "판매종료 구작",
    sales_status: "E",
    age_limit: "10",
    is_view: "N",
    hit: 8800,
    counts: zeroCounts({ game_3: 2, dlc_3: 5 }),
  }),
  // 비디지털(title_code!='33') — 목록에서 제외되어야 함
  makeRow(1005, { title_name: "실물상품(제외대상)", title_code: "10" }),
  // filler 1006~1014 (2쪽 확보)
  ...Array.from({ length: 9 }, (_, i) => {
    const id = 1006 + i;
    return makeRow(id, {
      title_name: `디지털 게임 ${id}`,
      sales_status: (["C", "S", "E"] as const)[i % 3],
      age_limit: (["10", "12", "15", "19"] as const)[i % 4],
      is_view: i % 2 === 0 ? "Y" : "N",
      interface_korean: i % 2 === 0 ? "Y" : "N",
      counts: zeroCounts({ game_0: (i % 3) + 1 }),
      genres: [{ code: "10", name: "액션" }],
    });
  }),
];

export const goodsTitleTable = createTable(seed);
