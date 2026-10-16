import { http, HttpResponse } from "msw";
import { env } from "@shared/config/env";

const api = (path: string) => `${env.apiBaseUrl}${path}`;

// legacy supply_content.php — 제공컨텐츠 현황(getSupplyContentList + getSupplyContentGoodsList).
const SUPPLY_CONTENT_LIST = [
  {
    idx: 301,
    supply_content_type: "P",
    supply_content: "발더스 게이트 3 한글패치 v1.2",
    supply_content_url: "https://image.directg.net/supply/patch/bg3_kor_v1.2.zip",
    is_encode: "Y",
    encode_type: "AES-256",
    goods: [
      { goods_code: "DG-G-1006", goods_nm: "발더스 게이트 3", asset_id: "AST-1006", is_free: "N" },
      {
        goods_code: "DG-E-2001",
        goods_nm: "젤다 디럭스 에디션",
        asset_id: "AST-2001",
        is_free: "Y",
      },
    ],
  },
  {
    idx: 302,
    supply_content_type: "C",
    supply_content: "오리지널 사운드트랙 컨텐츠",
    supply_content_url: "https://image.directg.net/supply/content/ost_pack.zip",
    is_encode: "N",
    encode_type: "",
    goods: [
      {
        goods_code: "DG-M-8001",
        goods_nm: "오리지널 사운드트랙",
        asset_id: "AST-8001",
        is_free: "N",
      },
    ],
  },
  {
    idx: 303,
    supply_content_type: "P",
    supply_content: "확장팩 한글패치",
    supply_content_url: "https://directg.net/supply/patch/expansion_kor.zip",
    is_encode: "N",
    encode_type: "",
    goods: [],
  },
];
const PER_PAGE_SUPPLY = 30;

// legacy supply_content_member.php — 회원 아이디별 제공컨텐츠(+한글패치 비밀번호). 미등록 회원은 빈 목록.
const SUPPLY_CONTENT_MEMBER: Record<
  string,
  {
    idx: number;
    supply_content_type: string;
    supply_content: string;
    supply_content_url: string;
    is_encode: string;
    encode_type: string;
    patch_password: string;
  }[]
> = {
  tester01: [
    {
      idx: 1,
      supply_content_type: "P",
      supply_content: "PREY 한글패치",
      supply_content_url: "https://image.directg.net/supply/patch/prey_kor.zip",
      is_encode: "Y",
      encode_type: "md5",
      patch_password: "5f4dcc3b5aa765d61d8327deb882cf99",
    },
    {
      idx: 3,
      supply_content_type: "P",
      supply_content: "DO2 DLC1 한글패치",
      supply_content_url: "https://image.directg.net/supply/patch/do2_dlc1_kor.zip",
      is_encode: "Y",
      encode_type: "md5",
      patch_password: "e10adc3949ba59abbe56e057f20f883e",
    },
    {
      idx: 20,
      supply_content_type: "C",
      supply_content: "아트북 컨텐츠",
      supply_content_url: "https://image.directg.net/supply/content/artbook.pdf",
      is_encode: "N",
      encode_type: "",
      patch_password: "",
    },
  ],
};

// legacy supply_content_download.php — 제공컨텐츠 다운로드 이력(idx desc).
const PATCH_DOWNLOAD_LOG = [
  {
    idx: 5003,
    m_id: "tester01",
    patch_name: "PREY 한글패치",
    count: 3,
    ip: "203.0.113.10",
    reg_date: "2026-07-01 10:22:31",
    last_download: "2026-07-15 18:03:11",
  },
  {
    idx: 5002,
    m_id: "gamer77",
    patch_name: "DO2 DLC1 한글패치",
    count: 1,
    ip: "198.51.100.24",
    reg_date: "2026-06-20 09:15:02",
    last_download: "2026-06-20 09:15:02",
  },
  {
    idx: 5001,
    m_id: "tester01",
    patch_name: "아트북 컨텐츠",
    count: 5,
    ip: "203.0.113.10",
    reg_date: "2026-05-11 14:41:50",
    last_download: "2026-07-02 21:10:44",
  },
];
const PER_PAGE_DOWNLOAD = 50;

export const supplyContentHandlers = [
  // legacy supply_content.php — 제공컨텐츠 현황 목록.
  http.get(api("/admin/goods/supply-contents"), ({ request }) => {
    const url = new URL(request.url);
    const q = (key: string) => url.searchParams.get(key) ?? "";
    const page = Math.max(1, Number.parseInt(q("page") || "1", 10) || 1);

    let rows = SUPPLY_CONTENT_LIST;
    const value = q("search_value");
    if (value) {
      rows = rows.filter((r) => r.supply_content.toLowerCase().includes(value.toLowerCase()));
    }
    const type = q("search_supply_content_type");
    if (type) {
      rows = rows.filter((r) => r.supply_content_type === type);
    }
    const isEncode = q("search_is_encode");
    if (isEncode) {
      rows = rows.filter((r) => r.is_encode === isEncode);
    }

    const totalResults = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE_SUPPLY));
    const start = (page - 1) * PER_PAGE_SUPPLY;
    return HttpResponse.json({
      items: rows.slice(start, start + PER_PAGE_SUPPLY),
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE_SUPPLY,
        total_results: totalResults,
        total_pages: totalPages,
      },
    });
  }),

  // legacy supply_content_member.php — 회원별 제공컨텐츠 조회(페이지네이션 없음).
  http.get(api("/admin/goods/supply-contents/member"), ({ request }) => {
    const url = new URL(request.url);
    const value = url.searchParams.get("search_value") ?? "";
    const items = value ? (SUPPLY_CONTENT_MEMBER[value] ?? []) : [];
    return HttpResponse.json({ member_id: value, items });
  }),

  // legacy supply_content_download.php — 제공컨텐츠 다운로드 현황(idx desc, 50/page).
  http.get(api("/admin/goods/supply-contents/download-log"), ({ request }) => {
    const url = new URL(request.url);
    const q = (key: string) => url.searchParams.get(key) ?? "";
    const page = Math.max(1, Number.parseInt(q("page") || "1", 10) || 1);

    let rows = [...PATCH_DOWNLOAD_LOG].sort((a, b) => b.idx - a.idx);
    // search_m_id일 때 m_id 등호. (검색 없으면 전체)
    const value = q("search_value");
    if (value && q("search_key") === "search_m_id") {
      rows = rows.filter((r) => r.m_id === value);
    }

    const totalResults = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE_DOWNLOAD));
    const start = (page - 1) * PER_PAGE_DOWNLOAD;
    return HttpResponse.json({
      items: rows.slice(start, start + PER_PAGE_DOWNLOAD),
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE_DOWNLOAD,
        total_results: totalResults,
        total_pages: totalPages,
      },
    });
  }),
];
