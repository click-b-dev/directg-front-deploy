import { http, HttpResponse } from "msw";
import { env } from "@shared/config/env";
import { db } from "../db";
import type { MainRecommandRow } from "../db";

const api = (path: string) => `${env.apiBaseUrl}${path}`;

// 계약 스키마 사본 (shared는 entities를 import할 수 없다 — FSD import 방향)
type RecommandGoods = { product_code: string; product_name: string; game_type: string };
type MainRecommandListItem = {
  idx: number;
  recommand_sort: number;
  recommand_banner: string;
  recommand_banner_link: string;
  recommand_name: string;
  recommand_start: number;
  recommand_end: number;
  is_view: "Y" | "N";
  goods: RecommandGoods[];
};
type MainRecommandListResponse = {
  items: MainRecommandListItem[];
  pagination: {
    current_page: number;
    results_per_page: number;
    total_results: number;
    total_pages: number;
  };
};
type MutationResponse = { success: boolean };
type MainRecommandDetail = Omit<MainRecommandRow, "is_del" | "recommand_sort">;
type CreateRequest = {
  recommand_name: string;
  recommand_start: string;
  recommand_end: string;
  recommand_banner: string;
  recommand_banner_link: string;
  recommand_banner_target: string;
  recommand_goods_1: string;
  recommand_goods_2: string;
  recommand_goods_3: string;
  recommand_goods_4: string;
  is_view: "Y" | "N";
};

const PER_PAGE = 20; // legacy getMainRecommandList results_per_page

// legacy strtotime("YYYY-MM-DD HH:MM:SS") 대응. 빈값/미형식 → 0.
const toEpoch = (value: string): number => {
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/);
  if (!m) {
    return 0;
  }
  const [, y, mo, d, h, mi, s] = m.map(Number);
  return Math.floor(new Date(y, mo - 1, d, h, mi, s).getTime() / 1000);
};

// legacy AdminGoods::getGoodsOptionSearch(product_code) mock — tbl_goods_item 조회 대체.
// 실제는 백엔드 책임. 미존재/빈 코드 → 빈 슬롯(legacy: getGoodsOptionSearch false → 공백).
const productCatalog: Record<string, { product_name: string; game_type: string }> = {
  DG20001: { product_name: "신작 RPG 대작", game_type: "game" },
  DG20002: { product_name: "구작 프로모션", game_type: "game" },
  DG20003: { product_name: "여름 할인 DLC", game_type: "dlc" },
  DG20004: { product_name: "한정판 번들", game_type: "bundle" },
  DG20005: { product_name: "OST 음원", game_type: "music" },
  DG20007: { product_name: "주변기기 세트", game_type: "accessories" },
};

const enrichGoods = (code: string): RecommandGoods => {
  const found = code ? productCatalog[code] : undefined;
  if (!found) {
    return { product_code: "", product_name: "", game_type: "" };
  }
  return { product_code: code, product_name: found.product_name, game_type: found.game_type };
};

// 응답에서 raw goods 코드 → enrich, is_del 제외. goods는 항상 4슬롯.
const toListItem = (row: MainRecommandRow): MainRecommandListItem => ({
  idx: row.idx,
  recommand_sort: row.recommand_sort,
  recommand_banner: row.recommand_banner,
  recommand_banner_link: row.recommand_banner_link,
  recommand_name: row.recommand_name,
  recommand_start: row.recommand_start,
  recommand_end: row.recommand_end,
  is_view: row.is_view,
  goods: [
    enrichGoods(row.recommand_goods_1),
    enrichGoods(row.recommand_goods_2),
    enrichGoods(row.recommand_goods_3),
    enrichGoods(row.recommand_goods_4),
  ],
});

// 상세(프리필): goods는 raw 코드 유지, is_del/recommand_sort 제외.
const toDetail = (row: MainRecommandRow): MainRecommandDetail => ({
  idx: row.idx,
  recommand_name: row.recommand_name,
  recommand_start: row.recommand_start,
  recommand_end: row.recommand_end,
  recommand_banner: row.recommand_banner,
  recommand_banner_link: row.recommand_banner_link,
  recommand_banner_target: row.recommand_banner_target,
  recommand_goods_1: row.recommand_goods_1,
  recommand_goods_2: row.recommand_goods_2,
  recommand_goods_3: row.recommand_goods_3,
  recommand_goods_4: row.recommand_goods_4,
  is_view: row.is_view,
});

export const mainRecommandHandlers = [
  // legacy AdminSite::getMainRecommandList — is_del='N', order recommand_sort asc, page당 20.
  // 검색: recommand_name LIKE(개발자 지시로 legacy 파라미터 불일치 버그 수정).
  http.get(api("/admin/site/main-recommands"), ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
    const searchTitle = url.searchParams.get("search_recommand_name") ?? "";

    let rows = db.mainRecommand.filter((row) => row.is_del === "N");
    if (searchTitle) {
      const needle = searchTitle.toLowerCase();
      rows = rows.filter((row) => row.recommand_name.toLowerCase().includes(needle));
    }
    rows.sort((a, b) => a.recommand_sort - b.recommand_sort);

    const totalResults = rows.length;
    const totalPages = Math.ceil(totalResults / PER_PAGE);
    const start = (page - 1) * PER_PAGE;
    const items = rows.slice(start, start + PER_PAGE).map(toListItem);

    return HttpResponse.json<MainRecommandListResponse>({
      items,
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE,
        total_results: totalResults,
        total_pages: totalPages,
      },
    });
  }),

  // legacy recommand_sort_up/down — recommand_sort만 ±1(swap 아님).
  http.post(api("/admin/site/main-recommands/:idx/sort"), async ({ request, params }) => {
    const idx = Number(params.idx);
    const { direction } = (await request.json()) as { direction: "up" | "down" };
    const target = db.mainRecommand.find((row) => row.idx === idx);
    if (!target) {
      return HttpResponse.json<MutationResponse>({ success: false }, { status: 404 });
    }
    const nextSort = direction === "up" ? target.recommand_sort - 1 : target.recommand_sort + 1;
    db.mainRecommand.update((row) => row.idx === idx, { recommand_sort: nextSort });
    return HttpResponse.json<MutationResponse>({ success: true });
  }),

  // legacy delete — 소프트 삭제(is_del='Y').
  http.delete(api("/admin/site/main-recommands/:idx"), ({ params }) => {
    const idx = Number(params.idx);
    const updated = db.mainRecommand.update((row) => row.idx === idx, { is_del: "Y" });
    if (!updated) {
      return HttpResponse.json<MutationResponse>({ success: false }, { status: 404 });
    }
    return HttpResponse.json<MutationResponse>({ success: true });
  }),

  // legacy main_recommand_ps.php register — INSERT(날짜 strtotime, recommand_sort 기본 0, is_del='N').
  http.post(api("/admin/site/main-recommands"), async ({ request }) => {
    const body = (await request.json()) as CreateRequest;
    const nextIdx = db.mainRecommand.all().reduce((max, row) => Math.max(max, row.idx), 0) + 1;
    db.mainRecommand.insert({
      idx: nextIdx,
      recommand_sort: 0,
      recommand_banner: body.recommand_banner,
      recommand_banner_link: body.recommand_banner_link,
      recommand_banner_target: body.recommand_banner_target,
      recommand_name: body.recommand_name,
      recommand_start: toEpoch(body.recommand_start),
      recommand_end: toEpoch(body.recommand_end),
      recommand_goods_1: body.recommand_goods_1,
      recommand_goods_2: body.recommand_goods_2,
      recommand_goods_3: body.recommand_goods_3,
      recommand_goods_4: body.recommand_goods_4,
      is_view: body.is_view,
      is_del: "N",
    });
    return HttpResponse.json<MutationResponse>({ success: true });
  }),

  // legacy main_recommand_modify.php: select * where idx — 폼 프리필용 단건.
  http.get(api("/admin/site/main-recommands/:idx"), ({ params }) => {
    const idx = Number(params.idx);
    const row = db.mainRecommand.find((item) => item.idx === idx);
    if (!row) {
      return HttpResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }
    return HttpResponse.json<MainRecommandDetail>(toDetail(row));
  }),

  // legacy main_recommand_ps.php modify — UPDATE WHERE idx(날짜 strtotime, sort/is_del 미변경).
  http.put(api("/admin/site/main-recommands/:idx"), async ({ request, params }) => {
    const idx = Number(params.idx);
    const body = (await request.json()) as CreateRequest;
    const updated = db.mainRecommand.update((row) => row.idx === idx, {
      recommand_banner: body.recommand_banner,
      recommand_banner_link: body.recommand_banner_link,
      recommand_banner_target: body.recommand_banner_target,
      recommand_name: body.recommand_name,
      recommand_start: toEpoch(body.recommand_start),
      recommand_end: toEpoch(body.recommand_end),
      recommand_goods_1: body.recommand_goods_1,
      recommand_goods_2: body.recommand_goods_2,
      recommand_goods_3: body.recommand_goods_3,
      recommand_goods_4: body.recommand_goods_4,
      is_view: body.is_view,
    });
    if (!updated) {
      return HttpResponse.json<MutationResponse>({ success: false }, { status: 404 });
    }
    return HttpResponse.json<MutationResponse>({ success: true });
  }),
];
