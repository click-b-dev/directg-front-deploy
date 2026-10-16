import { http, HttpResponse } from "msw";
import { env } from "@shared/config/env";

const api = (path: string) => `${env.apiBaseUrl}${path}`;

// 계약 스키마 사본 (shared는 entities를 import할 수 없다 — FSD import 방향)
type DataroomRow = {
  idx: number;
  file_type: string;
  file_name: string;
  is_encode: string;
  encode_type: string;
  is_free: string;
  is_view: string;
  deploy_date: string;
  total_download: number;
  file_url: string;
  contents: string;
  thumbnail: string;
};

type DataroomSaveBody = {
  file_type: string;
  file_name: string;
  file_url: string;
  is_encode: string;
  encode_type: string;
  is_free: string;
  is_view: string;
  deploy_date: string;
  contents: string;
  thumbnail: string;
};

// legacy tbl_dataroom + tbl_dataroom_log(download 합계) 재현(등록/수정 반영 위해 mutable).
const DATAROOM_LIST: DataroomRow[] = [
  {
    idx: 82,
    file_type: "P",
    file_name: "발더스 게이트 3 한글패치 v1.2",
    is_encode: "Y",
    encode_type: "base64",
    is_free: "N",
    is_view: "Y",
    deploy_date: "2026-07-20",
    total_download: 1523,
    file_url: "https://directg.net/upload/dataroom/bg3_kor_v12.zip",
    contents: "발더스 게이트 3 공식 한글패치입니다.",
    thumbnail: "bg3_thumb.jpg",
  },
  {
    idx: 77,
    file_type: "C",
    file_name: "게임 매뉴얼 PDF 모음",
    is_encode: "N",
    encode_type: "N",
    is_free: "Y",
    is_view: "Y",
    deploy_date: "2026-07-10",
    total_download: 342,
    file_url: "https://directg.net/upload/dataroom/manuals.zip",
    contents: "주요 게임 매뉴얼 모음집.",
    thumbnail: "",
  },
  {
    idx: 61,
    file_type: "P",
    file_name: "사이버펑크 2077 한글패치",
    is_encode: "Y",
    encode_type: "md5",
    is_free: "Y",
    is_view: "Y",
    deploy_date: "2026-06-25",
    total_download: 8874,
    file_url: "https://directg.net/upload/dataroom/cp2077_kor.zip",
    contents: "## 설치 방법\n\n압축 해제 후 게임 폴더에 복사하세요.",
    thumbnail: "cp2077_thumb.jpg",
  },
  {
    idx: 45,
    file_type: "C",
    file_name: "OST 다운로드 (한정판 구매자용)",
    is_encode: "N",
    encode_type: "N",
    is_free: "N",
    is_view: "N",
    deploy_date: "2026-06-01",
    total_download: 210,
    file_url: "https://directg.net/upload/dataroom/ost_limited.zip",
    contents: "한정판 구매자 전용 OST.",
    thumbnail: "",
  },
];

const PER_PAGE_DATAROOM = 30;

// legacy tbl_dataroom_log JOIN tbl_dataroom — 다운로드현황(b.idx desc 재현: 최신순 배열).
const DATAROOM_DOWNLOAD_LIST = [
  { m_no: 10021, m_id: "gamer01", file_name: "발더스 게이트 3 한글패치 v1.2", download_count: 3 },
  { m_no: 10044, m_id: "buyer_kim", file_name: "사이버펑크 2077 한글패치", download_count: 1 },
  { m_no: 10021, m_id: "gamer01", file_name: "게임 매뉴얼 PDF 모음", download_count: 12 },
  { m_no: 10077, m_id: "player9", file_name: "사이버펑크 2077 한글패치", download_count: 5 },
  {
    m_no: 10099,
    m_id: "refund_me",
    file_name: "OST 다운로드 (한정판 구매자용)",
    download_count: 2,
  },
];

// 뷰용 contents_html — legacy Parsedown 렌더 근사(백엔드 책임, mock 근사치).
const mdToHtml = (md: string) =>
  md
    .split(/\n{2,}/)
    .map((block) => {
      if (block.startsWith("## ")) return `<h2>${block.slice(3)}</h2>`;
      if (block.startsWith("# ")) return `<h1>${block.slice(2)}</h1>`;
      const inline = block.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br/>");
      return `<p>${inline}</p>`;
    })
    .join("\n");

const toListItem = (r: DataroomRow) => ({
  idx: r.idx,
  file_type: r.file_type,
  file_name: r.file_name,
  is_encode: r.is_encode,
  encode_type: r.encode_type,
  is_free: r.is_free,
  deploy_date: r.deploy_date,
  total_download: r.total_download,
  file_url: r.file_url,
});

export const dataroomHandlers = [
  // legacy board/dataroom_file.php — 자료실 파일현황(deploy_date desc, 30/page).
  http.get(api("/admin/board/datarooms"), ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);

    const rows = [...DATAROOM_LIST].sort((a, b) => b.deploy_date.localeCompare(a.deploy_date));

    const totalResults = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE_DATAROOM));
    const start = (page - 1) * PER_PAGE_DATAROOM;
    return HttpResponse.json({
      items: rows.slice(start, start + PER_PAGE_DATAROOM).map(toListItem),
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE_DATAROOM,
        total_results: totalResults,
        total_pages: totalPages,
      },
    });
  }),

  // legacy dataroom_download.php — 자료실 다운로드현황(b.idx desc, 30/page).
  http.get(api("/admin/board/dataroom-downloads"), ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
    // legacy: search_title_name 필터는 미적용(비기능 quirk) → 무시.
    const rows = DATAROOM_DOWNLOAD_LIST;
    const totalResults = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE_DATAROOM));
    const start = (page - 1) * PER_PAGE_DATAROOM;
    return HttpResponse.json({
      items: rows.slice(start, start + PER_PAGE_DATAROOM),
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE_DATAROOM,
        total_results: totalResults,
        total_pages: totalPages,
      },
    });
  }),

  // legacy dataroom_register.php(modify 로드) · dataroom_view.php — 상세.
  http.get(api("/admin/board/datarooms/:idx"), ({ params }) => {
    const idx = Number(params.idx);
    const row = DATAROOM_LIST.find((r) => r.idx === idx);
    if (!row) {
      return HttpResponse.json({ success: false }, { status: 404 });
    }
    return HttpResponse.json({
      idx: row.idx,
      file_type: row.file_type,
      file_name: row.file_name,
      file_url: row.file_url,
      is_encode: row.is_encode,
      encode_type: row.encode_type,
      is_free: row.is_free,
      is_view: row.is_view,
      deploy_date: row.deploy_date,
      contents: row.contents,
      contents_html: mdToHtml(row.contents),
      thumbnail: row.thumbnail,
    });
  }),

  // legacy dataroom_ps.php mode=register — 등록.
  http.post(api("/admin/board/datarooms"), async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as Partial<DataroomSaveBody>;
    const nextIdx = DATAROOM_LIST.reduce((max, r) => Math.max(max, r.idx), 0) + 1;
    DATAROOM_LIST.push({
      idx: nextIdx,
      file_type: body.file_type ?? "",
      file_name: body.file_name ?? "",
      is_encode: body.is_encode ?? "",
      encode_type: body.encode_type ?? "",
      is_free: body.is_free ?? "",
      is_view: body.is_view ?? "",
      deploy_date: body.deploy_date ?? "",
      total_download: 0,
      file_url: body.file_url ?? "",
      contents: body.contents ?? "",
      thumbnail: body.thumbnail ?? "",
    });
    return HttpResponse.json({ success: true });
  }),

  // legacy dataroom_ps.php mode=modify — 수정.
  http.put(api("/admin/board/datarooms/:idx"), async ({ params, request }) => {
    const idx = Number(params.idx);
    const body = (await request.json().catch(() => ({}))) as Partial<DataroomSaveBody>;
    const row = DATAROOM_LIST.find((r) => r.idx === idx);
    if (!row) {
      return HttpResponse.json({ success: false }, { status: 404 });
    }
    row.file_type = body.file_type ?? row.file_type;
    row.file_name = body.file_name ?? row.file_name;
    row.file_url = body.file_url ?? row.file_url;
    row.is_encode = body.is_encode ?? row.is_encode;
    row.encode_type = body.encode_type ?? row.encode_type;
    row.is_free = body.is_free ?? row.is_free;
    row.is_view = body.is_view ?? row.is_view;
    row.deploy_date = body.deploy_date ?? row.deploy_date;
    row.contents = body.contents ?? row.contents;
    if (body.thumbnail) {
      row.thumbnail = body.thumbnail;
    }
    return HttpResponse.json({ success: true });
  }),
];
