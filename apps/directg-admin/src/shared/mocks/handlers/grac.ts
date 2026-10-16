import { http, HttpResponse } from "msw";
import { env } from "@shared/config/env";

const api = (path: string) => `${env.apiBaseUrl}${path}`;

// legacy grac/grac_list.php — 심의정보 현황(grac_list 원장).
const GRAC_LIST = [
  {
    rateno: "CC-XR-260115-001",
    gametitle: "스트레인저 댄 헤븐",
    orgname: "게임물관리위원회",
    entname: "H2 Interactive",
    givenrate: "15세이용가",
    rateddate: "2026-01-15",
    descriptors: "폭력성, 선정성",
    platform: "비디오 게임",
    reg_date: "2026-01-10 09:00:00",
  },
  {
    rateno: "CC-OM-251220-045",
    gametitle: "발더스 게이트 3",
    orgname: "게임콘텐츠등급분류위원회",
    entname: "라리안 스튜디오",
    givenrate: "청소년이용불가",
    rateddate: "2025-12-20",
    descriptors: "선정성, 폭력성, 언어의 부적절성",
    platform: "PC/온라인 게임",
    reg_date: "2025-12-15 14:30:00",
  },
  {
    rateno: "SA-260201-777",
    gametitle: "하츠네 미쿠 SNOW 2026",
    orgname: "자체등급분류사업자",
    entname: "GENBA",
    givenrate: "전체이용가",
    rateddate: "2026-02-01",
    descriptors: "",
    platform: "모바일 게임",
    reg_date: "2026-01-28 11:20:00",
  },
];
const PER_PAGE_GRAC = 50;

// legacy grac/grac_batch.php — 동기화 대상 심의업체(grac_entname, tcount>=9, tcount desc).
const GRAC_ENTNAME_LIST = [
  { entname: "H2 Interactive", tcount: 128, batch_date: "2026-07-20 03:00:00" },
  { entname: "라리안 스튜디오", tcount: 42, batch_date: "2026-07-18 03:00:00" },
  { entname: "GENBA", tcount: 9, batch_date: null },
];

export const gracHandlers = [
  // legacy grac/grac_list.php — 심의정보 현황 목록.
  http.get(api("/admin/goods/grac"), ({ request }) => {
    const url = new URL(request.url);
    const q = (key: string) => url.searchParams.get(key) ?? "";
    const page = Math.max(1, Number.parseInt(q("page") || "1", 10) || 1);

    let rows = GRAC_LIST;
    const rateno = q("search_rateno");
    if (rateno) {
      rows = rows.filter((r) => r.rateno.toLowerCase().startsWith(rateno.toLowerCase())); // LIKE 'val%'
    }
    const gametitle = q("search_gametitle");
    if (gametitle) {
      rows = rows.filter((r) => r.gametitle.toLowerCase().includes(gametitle.toLowerCase()));
    }
    const entname = q("search_entname");
    if (entname) {
      rows = rows.filter((r) => r.entname.toLowerCase().includes(entname.toLowerCase()));
    }
    const orgname = q("search_orgname");
    if (orgname && orgname !== "all") {
      rows = rows.filter((r) => r.orgname === orgname);
    }
    const givenrate = q("search_givenrate");
    if (givenrate && givenrate !== "all") {
      rows = rows.filter((r) => r.givenrate === givenrate);
    }
    const platform = q("search_platform");
    if (platform && platform !== "all") {
      rows = rows.filter((r) => r.platform === platform);
    }

    const totalResults = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE_GRAC));
    const start = (page - 1) * PER_PAGE_GRAC;
    return HttpResponse.json({
      items: rows.slice(start, start + PER_PAGE_GRAC),
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE_GRAC,
        total_results: totalResults,
        total_pages: totalPages,
      },
    });
  }),

  // legacy grac/grac_batch.php — 동기화 대상 심의업체 목록(페이징 없음).
  http.get(api("/admin/goods/grac/entname"), () =>
    HttpResponse.json({
      items: [...GRAC_ENTNAME_LIST].sort((a, b) => b.tcount - a.tcount), // tcount desc
    }),
  ),

  // legacy grac_ps.php mode=grac_batch — 심의정보 동기화(GRAC 웹서비스 + DB upsert는 백엔드).
  http.post(api("/admin/goods/grac/batch"), async ({ request }) => {
    await request.json().catch(() => ({}));
    return HttpResponse.json({ success: true });
  }),

  // legacy grac_ps.php mode=register — 심의정보 등록(descriptors 콤마 조인·grac_list upsert는 백엔드).
  // mode=modify는 legacy 처리기 case 부재 → no-op 이식.
  http.post(api("/admin/goods/grac"), async ({ request }) => {
    await request.json().catch(() => ({}));
    return HttpResponse.json({ success: true });
  }),
];
