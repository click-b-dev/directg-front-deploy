import { http, HttpResponse } from "msw";
import { env } from "@shared/config/env";
import { db } from "../db";
import type { SearchRecommandRow } from "../db";

const api = (path: string) => `${env.apiBaseUrl}${path}`;

// 계약 스키마 사본 (shared는 entities를 import할 수 없다 — FSD import 방향)
type Slot = { idx: number; keyword: string; link_url: string; click_count: number };
type ListItem = Slot;
type SearchRecommandResponse = {
  slots: (Slot | null)[];
  list: {
    items: ListItem[];
    pagination: {
      current_page: number;
      results_per_page: number;
      total_results: number;
      total_pages: number;
    };
  };
};
type MutationResponse = { success: boolean };
type SlotRegisterRequest = { slot: number; keyword: string; link_url: string };
type ModifyRequest = { keyword: string; link_url: string };
type AssignRequest = { slot: number };

const PER_PAGE = 20; // legacy getSearchRecommandList results_per_page

const toItem = (row: SearchRecommandRow): Slot => ({
  idx: row.idx,
  keyword: row.keyword,
  link_url: row.link_url,
  click_count: row.click_count,
});

// legacy: link 빈값 → 검색결과 URL 자동.
const autoLink = (keyword: string, link: string) =>
  link === "" ? `/game/game_search_thumb.html?q=${keyword}` : link;

// 해당 슬롯의 기존 노출 검색어를 전부 비노출(is_view='N') 처리.
const clearSlot = (slot: number) => {
  db.searchRecommand
    .all()
    .filter((r) => r.is_del === "N" && r.is_view === "Y" && r.recommand_sort === slot)
    .forEach((r) => db.searchRecommand.update((row) => row.idx === r.idx, { is_view: "N" }));
};

export const searchRecommandHandlers = [
  // legacy search_recommand.php — 슬롯 4칸 + 하단 목록.
  http.get(api("/admin/site/search-recommands"), ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
    const searchKeyword = url.searchParams.get("search_keyword") ?? "";

    const rows = db.searchRecommand.filter((row) => row.is_del === "N");

    // 슬롯: is_view='Y' order by recommand_sort asc, idx asc → sort 1~4 첫 매칭.
    const slotCandidates = rows
      .filter((row) => row.is_view === "Y")
      .sort((a, b) => a.recommand_sort - b.recommand_sort || a.idx - b.idx);
    const slots: (Slot | null)[] = [null, null, null, null];
    const slotIds = new Set<number>();
    for (const row of slotCandidates) {
      const s = row.recommand_sort;
      if (s >= 1 && s <= 4 && slots[s - 1] === null) {
        slots[s - 1] = toItem(row);
        slotIds.add(row.idx);
      }
    }

    // 하단: 슬롯 제외 + 검색. order by is_view desc, recommand_sort asc, idx desc.
    let listRows = rows.filter((row) => !slotIds.has(row.idx));
    if (searchKeyword) {
      const needle = searchKeyword.toLowerCase();
      listRows = listRows.filter((row) => row.keyword.toLowerCase().includes(needle));
    }
    listRows.sort(
      (a, b) =>
        (a.is_view === "Y" ? 0 : 1) - (b.is_view === "Y" ? 0 : 1) ||
        a.recommand_sort - b.recommand_sort ||
        b.idx - a.idx,
    );

    const totalResults = listRows.length;
    const totalPages = Math.ceil(totalResults / PER_PAGE);
    const start = (page - 1) * PER_PAGE;
    const items = listRows.slice(start, start + PER_PAGE).map(toItem);

    return HttpResponse.json<SearchRecommandResponse>({
      slots,
      list: {
        items,
        pagination: {
          current_page: page,
          results_per_page: PER_PAGE,
          total_results: totalResults,
          total_pages: totalPages,
        },
      },
    });
  }),

  // legacy mode=slot_register — 기존 슬롯 비노출 + 새 검색어 INSERT(is_view='Y').
  http.post(api("/admin/site/search-recommands"), async ({ request }) => {
    const { slot, keyword, link_url } = (await request.json()) as SlotRegisterRequest;
    if (slot < 1 || slot > 4) {
      return HttpResponse.json<MutationResponse>({ success: false }, { status: 400 });
    }
    clearSlot(slot);
    const nextIdx = db.searchRecommand.all().reduce((max, row) => Math.max(max, row.idx), 0) + 1;
    db.searchRecommand.insert({
      idx: nextIdx,
      keyword,
      link_url: autoLink(keyword, link_url),
      click_count: 0,
      recommand_sort: slot,
      is_view: "Y",
      is_del: "N",
    });
    return HttpResponse.json<MutationResponse>({ success: true });
  }),

  // legacy mode=modify — keyword/link_url 수정(link 자동).
  http.put(api("/admin/site/search-recommands/:idx"), async ({ request, params }) => {
    const idx = Number(params.idx);
    const { keyword, link_url } = (await request.json()) as ModifyRequest;
    const updated = db.searchRecommand.update((row) => row.idx === idx, {
      keyword,
      link_url: autoLink(keyword, link_url),
    });
    if (!updated) {
      return HttpResponse.json<MutationResponse>({ success: false }, { status: 404 });
    }
    return HttpResponse.json<MutationResponse>({ success: true });
  }),

  // legacy mode=slot_assign — 기존 슬롯 비노출 + idx를 슬롯에 노출.
  http.post(api("/admin/site/search-recommands/:idx/assign"), async ({ request, params }) => {
    const idx = Number(params.idx);
    const { slot } = (await request.json()) as AssignRequest;
    if (slot < 1 || slot > 4) {
      return HttpResponse.json<MutationResponse>({ success: false }, { status: 400 });
    }
    clearSlot(slot);
    const updated = db.searchRecommand.update((row) => row.idx === idx, {
      is_view: "Y",
      recommand_sort: slot,
    });
    if (!updated) {
      return HttpResponse.json<MutationResponse>({ success: false }, { status: 404 });
    }
    return HttpResponse.json<MutationResponse>({ success: true });
  }),

  // legacy mode=slot_clear — 슬롯 비우기(is_view='N').
  http.post(api("/admin/site/search-recommands/:idx/clear"), ({ params }) => {
    const idx = Number(params.idx);
    const updated = db.searchRecommand.update((row) => row.idx === idx, { is_view: "N" });
    if (!updated) {
      return HttpResponse.json<MutationResponse>({ success: false }, { status: 404 });
    }
    return HttpResponse.json<MutationResponse>({ success: true });
  }),

  // legacy mode=delete — 완전삭제(is_del='Y').
  http.delete(api("/admin/site/search-recommands/:idx"), ({ params }) => {
    const idx = Number(params.idx);
    const updated = db.searchRecommand.update((row) => row.idx === idx, { is_del: "Y" });
    if (!updated) {
      return HttpResponse.json<MutationResponse>({ success: false }, { status: 404 });
    }
    return HttpResponse.json<MutationResponse>({ success: true });
  }),
];
