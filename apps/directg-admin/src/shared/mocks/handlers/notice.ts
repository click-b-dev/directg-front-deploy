import { http, HttpResponse } from "msw";
import { env } from "@shared/config/env";

const api = (path: string) => `${env.apiBaseUrl}${path}`;

// 계약 스키마 사본 (shared는 entities를 import할 수 없다 — FSD import 방향)
type NoticeRow = {
  idx: number;
  notice_type: string;
  subject: string;
  contents: string; // 상세/편집용
  is_notice: "Y" | "N";
  reg_date: string;
  deploy_date: string;
  is_view: "Y" | "N";
  hit: number;
  admin_id: string;
};

type NoticeSaveBody = {
  notice_type: string;
  subject: string;
  contents: string;
  is_notice: string;
  is_view: string;
  deploy_date: string;
};

// legacy board/notice_list.php — tbl_notice 재현(삭제는 하드 삭제 → mutable).
let NOTICE_LIST: NoticeRow[] = [
  {
    idx: 1024,
    notice_type: "3",
    subject: "발더스 게이트 3 한국어판 정식 출시 안내",
    contents: "# 발더스 게이트 3\n\n한국어판이 정식 출시되었습니다.",
    is_notice: "Y",
    reg_date: "2026-07-20 10:15:00",
    deploy_date: "2026-07-22 09:00:00",
    is_view: "Y",
    hit: 3820,
    admin_id: "admin@h2int.com",
  },
  {
    idx: 1019,
    notice_type: "2",
    subject: "여름 스팀 세일 프로모션 진행 (최대 90% 할인)",
    contents: "## 여름 세일\n\n최대 **90%** 할인!",
    is_notice: "Y",
    reg_date: "2026-07-15 14:30:00",
    deploy_date: "2026-07-18 00:00:00",
    is_view: "Y",
    hit: 12904,
    admin_id: "admin@h2int.com",
  },
  {
    idx: 1007,
    notice_type: "1",
    subject: "제품코드(키) 발송 지연 안내",
    contents: "제품코드 발송이 일시적으로 지연되고 있습니다.",
    is_notice: "N",
    reg_date: "2026-07-10 09:05:00",
    deploy_date: "2026-07-10 09:10:00",
    is_view: "Y",
    hit: 542,
    admin_id: "admin@h2int.com",
  },
  {
    idx: 998,
    notice_type: "4",
    subject: "개인정보처리방침 개정 안내",
    contents: "개인정보처리방침이 2026-07-01부로 개정됩니다.",
    is_notice: "N",
    reg_date: "2026-06-28 16:40:00",
    deploy_date: "2026-07-01 00:00:00",
    is_view: "Y",
    hit: 231,
    admin_id: "admin@h2int.com",
  },
  {
    idx: 981,
    notice_type: "3",
    subject: "신규 DLC 입고 및 판매 일정 (비공개)",
    contents: "신규 DLC 판매 일정 (내부용).",
    is_notice: "N",
    reg_date: "2026-06-20 11:00:00",
    deploy_date: "2026-06-20 11:00:00",
    is_view: "N",
    hit: 17,
    admin_id: "admin@h2int.com",
  },
  {
    idx: 970,
    notice_type: "2",
    subject: "출석체크 이벤트 종료 및 당첨자 발표",
    contents: "출석체크 이벤트가 종료되었습니다. 당첨자를 발표합니다.",
    is_notice: "N",
    reg_date: "2026-06-12 13:20:00",
    deploy_date: "2026-06-15 10:00:00",
    is_view: "Y",
    hit: 4488,
    admin_id: "admin@h2int.com",
  },
];

const PER_PAGE_NOTICE = 30;

// legacy reg_date=now() 재현(YYYY-MM-DD HH:MM:SS).
const nowString = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};

const toListItem = (r: NoticeRow) => ({
  idx: r.idx,
  notice_type: r.notice_type,
  subject: r.subject,
  is_notice: r.is_notice,
  reg_date: r.reg_date,
  deploy_date: r.deploy_date,
  is_view: r.is_view,
  hit: r.hit,
});

const asFlag = (v: string): "Y" | "N" => (v === "Y" ? "Y" : "N");

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

export const noticeHandlers = [
  // legacy board/notice_list.php — 공지사항 목록(deploy_date desc, 30/page).
  http.get(api("/admin/board/notices"), ({ request }) => {
    const url = new URL(request.url);
    const q = (key: string) => url.searchParams.get(key) ?? "";
    const page = Math.max(1, Number.parseInt(q("page") || "1", 10) || 1);

    let rows = [...NOTICE_LIST];
    const title = q("search_title");
    if (title) {
      rows = rows.filter((r) => r.subject.includes(title)); // subject LIKE '%val%'
    }
    const noticeType = q("search_notice_type");
    if (noticeType) {
      rows = rows.filter((r) => r.notice_type === noticeType); // notice_type = 'val'
    }

    rows.sort((a, b) => b.deploy_date.localeCompare(a.deploy_date)); // deploy_date desc

    const totalResults = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE_NOTICE));
    const start = (page - 1) * PER_PAGE_NOTICE;
    return HttpResponse.json({
      items: rows.slice(start, start + PER_PAGE_NOTICE).map(toListItem),
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE_NOTICE,
        total_results: totalResults,
        total_pages: totalPages,
      },
    });
  }),

  // legacy notice_register.php(modify 로드) · notice_view.php — 상세.
  http.get(api("/admin/board/notices/:idx"), ({ params }) => {
    const idx = Number(params.idx);
    const row = NOTICE_LIST.find((r) => r.idx === idx);
    if (!row) {
      return HttpResponse.json({ success: false }, { status: 404 });
    }
    return HttpResponse.json({
      idx: row.idx,
      notice_type: row.notice_type,
      subject: row.subject,
      contents: row.contents,
      contents_html: mdToHtml(row.contents),
      is_notice: row.is_notice,
      is_view: row.is_view,
      deploy_date: row.deploy_date,
      reg_date: row.reg_date,
      admin_id: row.admin_id,
    });
  }),

  // legacy notice_ps.php mode=regitster — 등록(reg_date=now, hit=0, admin_id 서버).
  http.post(api("/admin/board/notices"), async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as Partial<NoticeSaveBody>;
    const nextIdx = NOTICE_LIST.reduce((max, r) => Math.max(max, r.idx), 0) + 1;
    NOTICE_LIST.push({
      idx: nextIdx,
      notice_type: body.notice_type ?? "",
      subject: body.subject ?? "",
      contents: body.contents ?? "",
      is_notice: asFlag(body.is_notice ?? ""),
      reg_date: nowString(),
      deploy_date: body.deploy_date ?? "",
      is_view: asFlag(body.is_view ?? ""),
      hit: 0,
      admin_id: "admin@h2int.com",
    });
    return HttpResponse.json({ success: true });
  }),

  // legacy notice_ps.php mode=modify — 수정(reg_date/hit/admin_id 미변경).
  http.put(api("/admin/board/notices/:idx"), async ({ params, request }) => {
    const idx = Number(params.idx);
    const body = (await request.json().catch(() => ({}))) as Partial<NoticeSaveBody>;
    const row = NOTICE_LIST.find((r) => r.idx === idx);
    if (!row) {
      return HttpResponse.json({ success: false }, { status: 404 });
    }
    row.notice_type = body.notice_type ?? row.notice_type;
    row.subject = body.subject ?? row.subject;
    row.contents = body.contents ?? row.contents;
    row.is_notice = asFlag(body.is_notice ?? row.is_notice);
    row.is_view = asFlag(body.is_view ?? row.is_view);
    row.deploy_date = body.deploy_date ?? row.deploy_date;
    return HttpResponse.json({ success: true });
  }),

  // legacy notice_ps.php mode=delete — 하드 삭제(delete from tbl_notice where idx).
  http.delete(api("/admin/board/notices/:idx"), ({ params }) => {
    const idx = Number(params.idx);
    const before = NOTICE_LIST.length;
    NOTICE_LIST = NOTICE_LIST.filter((r) => r.idx !== idx);
    if (NOTICE_LIST.length === before) {
      return HttpResponse.json({ success: false }, { status: 404 });
    }
    return HttpResponse.json({ success: true });
  }),
];
