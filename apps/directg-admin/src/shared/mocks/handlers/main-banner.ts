import { http, HttpResponse } from "msw";
import { env } from "@shared/config/env";
import { db } from "../db";
import type { MainBannerRow } from "../db";

// api-client(ky)는 env.apiBaseUrl(prefix)을 prepend → handler도 동일 base.
const api = (path: string) => `${env.apiBaseUrl}${path}`;

// 계약 스키마 사본 (shared는 entities를 import할 수 없다 — FSD import 방향)
// 목록 아이템은 show_prod_info/show_sale_info 미포함(상세만 포함).
type MainBannerListItem = Omit<MainBannerRow, "is_del" | "show_prod_info" | "show_sale_info">;
type MainBannerListResponse = {
  items: MainBannerListItem[];
  pagination: {
    current_page: number;
    results_per_page: number;
    total_results: number;
    total_pages: number;
  };
};
type MutationResponse = { success: boolean };
type MainBannerDetail = Omit<MainBannerRow, "is_del">;
type CreateRequest = Omit<
  MainBannerRow,
  "idx" | "banner_start" | "banner_end" | "banner_sort" | "is_del"
> & {
  banner_start: string;
  banner_end: string;
  banner_sort: string;
};

const PER_PAGE = 20; // legacy getMainbannerList results_per_page

// legacy strtotime("YYYY-MM-DD HH:MM:SS") 대응. 빈값/미형식 → 0(=strtotime false).
const toEpoch = (value: string): number => {
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/);
  if (!m) {
    return 0;
  }
  const [, y, mo, d, h, mi, s] = m.map(Number);
  return Math.floor(new Date(y, mo - 1, d, h, mi, s).getTime() / 1000);
};

// 응답에서 is_del 제외(계약: 목록 아이템은 is_del 미포함).
const toListItem = (row: MainBannerRow): MainBannerListItem => ({
  idx: row.idx,
  banner_sort: row.banner_sort,
  banner_pc: row.banner_pc,
  banner_mobile: row.banner_mobile,
  banner_link: row.banner_link,
  banner_target: row.banner_target,
  banner_title: row.banner_title,
  product_code: row.product_code,
  banner_publisher: row.banner_publisher,
  banner_start: row.banner_start,
  banner_end: row.banner_end,
  flag: row.flag,
  bannerPeriodOutputFl: row.bannerPeriodOutputFl,
});

// 상세: 목록 아이템 + show_prod_info/show_sale_info (is_del 제외).
const toDetail = (row: MainBannerRow): MainBannerDetail => ({
  ...toListItem(row),
  show_prod_info: row.show_prod_info,
  show_sale_info: row.show_sale_info,
});

export const mainBannerHandlers = [
  // legacy AdminSite::getMainbannerList — is_del='N' + 필터, order banner_sort asc, page당 20.
  http.get(api("/admin/site/main-banners"), ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
    const searchTitle = url.searchParams.get("search_banner_title") ?? "";
    const searchFlag = url.searchParams.get("search_flag") ?? "";

    let rows = db.mainBanner.filter((row) => row.is_del === "N");
    if (searchTitle) {
      // legacy: banner_title like '%q%' (MySQL utf8 collation = 대소문자 무시)
      const needle = searchTitle.toLowerCase();
      rows = rows.filter((row) => row.banner_title.toLowerCase().includes(needle));
    }
    if (searchFlag === "Y" || searchFlag === "N") {
      rows = rows.filter((row) => row.flag === searchFlag);
    }
    rows.sort((a, b) => a.banner_sort - b.banner_sort);

    const totalResults = rows.length;
    const totalPages = Math.ceil(totalResults / PER_PAGE);
    const start = (page - 1) * PER_PAGE;
    const items = rows.slice(start, start + PER_PAGE).map(toListItem);

    return HttpResponse.json<MainBannerListResponse>({
      items,
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE,
        total_results: totalResults,
        total_pages: totalPages,
      },
    });
  }),

  // legacy banner_proc.php banner_sort_up/down — 해당 행 banner_sort만 ±1(swap 아님, legacy 버그 이식).
  http.post(api("/admin/site/main-banners/:idx/sort"), async ({ request, params }) => {
    const idx = Number(params.idx);
    const { direction } = (await request.json()) as { direction: "up" | "down" };
    const target = db.mainBanner.find((row) => row.idx === idx);
    if (!target) {
      return HttpResponse.json<MutationResponse>({ success: false }, { status: 404 });
    }
    const nextSort = direction === "up" ? target.banner_sort - 1 : target.banner_sort + 1;
    db.mainBanner.update((row) => row.idx === idx, { banner_sort: nextSort });
    return HttpResponse.json<MutationResponse>({ success: true });
  }),

  // legacy banner_proc.php banner_delete — 소프트 삭제(is_del='Y').
  http.delete(api("/admin/site/main-banners/:idx"), ({ params }) => {
    const idx = Number(params.idx);
    const updated = db.mainBanner.update((row) => row.idx === idx, { is_del: "Y" });
    if (!updated) {
      return HttpResponse.json<MutationResponse>({ success: false }, { status: 404 });
    }
    return HttpResponse.json<MutationResponse>({ success: true });
  }),

  // legacy banner_proc.php register — INSERT tbl_main_banner(날짜 strtotime, reg_date now, is_del='N').
  http.post(api("/admin/site/main-banners"), async ({ request }) => {
    const body = (await request.json()) as CreateRequest;
    const nextIdx = db.mainBanner.all().reduce((max, row) => Math.max(max, row.idx), 0) + 1;
    db.mainBanner.insert({
      idx: nextIdx,
      banner_sort: Number(body.banner_sort) || 0,
      banner_pc: body.banner_pc,
      banner_mobile: body.banner_mobile,
      banner_link: body.banner_link,
      banner_target: body.banner_target,
      banner_title: body.banner_title,
      product_code: body.product_code,
      banner_publisher: body.banner_publisher,
      banner_start: toEpoch(body.banner_start),
      banner_end: toEpoch(body.banner_end),
      flag: body.flag,
      bannerPeriodOutputFl: body.bannerPeriodOutputFl,
      show_prod_info: body.show_prod_info,
      show_sale_info: body.show_sale_info,
      is_del: "N",
    });
    return HttpResponse.json<MutationResponse>({ success: true });
  }),

  // legacy banner_modify.php: select * where idx — 폼 프리필용 단건(is_del 제외).
  http.get(api("/admin/site/main-banners/:idx"), ({ params }) => {
    const idx = Number(params.idx);
    const row = db.mainBanner.find((item) => item.idx === idx);
    if (!row) {
      return HttpResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }
    return HttpResponse.json<MainBannerDetail>(toDetail(row));
  }),

  // legacy banner_proc.php modify — UPDATE tbl_main_banner WHERE idx(날짜 strtotime).
  http.put(api("/admin/site/main-banners/:idx"), async ({ request, params }) => {
    const idx = Number(params.idx);
    const body = (await request.json()) as CreateRequest;
    const updated = db.mainBanner.update((row) => row.idx === idx, {
      banner_sort: Number(body.banner_sort) || 0,
      banner_pc: body.banner_pc,
      banner_mobile: body.banner_mobile,
      banner_link: body.banner_link,
      banner_target: body.banner_target,
      banner_title: body.banner_title,
      product_code: body.product_code,
      banner_publisher: body.banner_publisher,
      banner_start: toEpoch(body.banner_start),
      banner_end: toEpoch(body.banner_end),
      flag: body.flag,
      bannerPeriodOutputFl: body.bannerPeriodOutputFl,
      show_prod_info: body.show_prod_info,
      show_sale_info: body.show_sale_info,
    });
    if (!updated) {
      return HttpResponse.json<MutationResponse>({ success: false }, { status: 404 });
    }
    return HttpResponse.json<MutationResponse>({ success: true });
  }),

  // legacy banner_proc.php banner_link_search — product_code → 상세 링크.
  // 실제 game_type 분기(game/dlc/bundle/…)는 tbl_goods_item 기반(백엔드).
  // mock: 특정 코드는 game_type 변형(dlc/bundle)으로 예시, 그 외 비어있지 않은 코드는
  // game_view 기본형으로 링크 생성(데모 — 실제 백엔드는 미존재 코드에 "" 반환). 빈 코드 → "".
  http.get(api("/admin/site/banner-link"), ({ request }) => {
    const productCode = new URL(request.url).searchParams.get("product_code") ?? "";
    if (productCode === "") {
      return HttpResponse.json<{ banner_link: string }>({ banner_link: "" });
    }
    const variants: Record<string, string> = {
      DG20003: "/game/dlc_view.html?sku=SKU20003&platform=pc",
      DG20005: "/game/bundle_view.html?sku=SKU20005&platform=pc",
    };
    const bannerLink =
      variants[productCode] ??
      `/game/game_view.html?product_id=${productCode}&sku=SKU-${productCode}&platform=pc`;
    return HttpResponse.json<{ banner_link: string }>({ banner_link: bannerLink });
  }),
];
