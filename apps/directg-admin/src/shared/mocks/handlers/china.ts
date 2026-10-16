import { http, HttpResponse } from "msw";
import { env } from "@shared/config/env";

const api = (path: string) => `${env.apiBaseUrl}${path}`;

// legacy china/invoice_list.php — 중국 결제완료 목록(tbl_invoice_order step='2' AND flag='Y').
// settle_price는 raw number(number_format 표시), ord_ymd DESC 고정.
const CHINA_INVOICE_LIST = [
  {
    ord_ymd: "2026-06-18",
    settle_no: "CN20260618-004",
    name: "李娜",
    email: "lina@example.cn",
    settle_price: 89000,
    cdt: "2026-06-18 15:42:10",
  },
  {
    ord_ymd: "2026-05-02",
    settle_no: "CN20260502-003",
    name: "王伟",
    email: "wangwei@example.cn",
    settle_price: 129000,
    cdt: "2026-05-02 10:05:33",
  },
  {
    ord_ymd: "2026-03-10",
    settle_no: "CN20260310-001",
    name: "张敏",
    email: "zhangmin@example.cn",
    settle_price: 54000,
    cdt: "2026-03-10 12:30:00",
  },
  {
    ord_ymd: "2025-11-21",
    settle_no: "CN20251121-057",
    name: "刘洋",
    email: "liuyang@example.cn",
    settle_price: 198000,
    cdt: "2025-11-21 09:12:45",
  },
];
const PER_PAGE_INVOICE = 20;

// legacy china/invoice_member.php — 중국 결제자(tbl_invoice_member flag='Y', idx DESC).
const CHINA_MEMBER_LIST = [
  { idx: 12, email: "wangwei@example.cn", name: "王伟", login_date: "2026-07-28 18:20:11" },
  { idx: 9, email: "lina@example.cn", name: "李娜", login_date: "2026-07-15 09:41:02" },
  { idx: 5, email: "zhangmin@example.cn", name: "张敏", login_date: "2026-06-30 22:03:47" },
  { idx: 2, email: "liuyang@example.cn", name: "刘洋", login_date: "2026-05-11 13:55:20" },
];
const PER_PAGE_MEMBER = 20;

// legacy china/invoice_goods.php — 중국 결제 상품(tbl_invoice_goods idx>0, platform·goods_nm ASC).
const CHINA_GOODS_LIST = [
  { idx: 7, platform: "NSW", goods_nm: "젤다의 전설: 왕국의 눈물", price: 76800 },
  { idx: 3, platform: "PS5", goods_nm: "파이널 판타지 XVI", price: 88000 },
  { idx: 5, platform: "PS5", goods_nm: "호그와트 레거시", price: 79800 },
  { idx: 1, platform: "XBX", goods_nm: "스타필드", price: 84000 },
];
const PER_PAGE_GOODS = 20;

// legacy china/invoice_request.php — 중국 결제요청(tbl_invoice_order step='1' AND (flag='N' OR NULL)).
const CHINA_REQUEST_LIST = [
  {
    ord_ymd: "2026-07-22",
    settle_no: "1753000000001",
    name: "陈静",
    email: "chenjing@example.cn",
    settle_price: 153600,
    cdt: "2026-07-22 14:10:05",
  },
  {
    ord_ymd: "2026-04-15",
    settle_no: "1744000000002",
    name: "赵磊",
    email: "zhaolei@example.cn",
    settle_price: 88000,
    cdt: "2026-04-15 09:30:41",
  },
  {
    ord_ymd: "2025-09-08",
    settle_no: "1725000000003",
    name: "孙悦",
    email: "sunyue@example.cn",
    settle_price: 246800,
    cdt: "2025-09-08 20:55:12",
  },
];
const PER_PAGE_REQUEST = 20;

export const chinaHandlers = [
  // legacy china/invoice_list.php — 중국 결제완료 리스트.
  http.get(api("/admin/china/invoices"), ({ request }) => {
    const url = new URL(request.url);
    const q = (key: string) => url.searchParams.get(key) ?? "";
    const page = Math.max(1, Number.parseInt(q("page") || "1", 10) || 1);
    // search_year 미지정 시 서버 현재년(legacy date('Y')).
    const year = q("search_year") || String(new Date().getFullYear());

    // base: step='2' AND flag='Y'(fixture 전량 결제완료) + 연도 범위.
    let rows = CHINA_INVOICE_LIST.filter(
      (r) => r.ord_ymd >= `${year}-01-01` && r.ord_ymd <= `${year}-12-31`,
    );

    const settleNo = q("search_settle_no");
    if (settleNo) {
      rows = rows.filter((r) => r.settle_no === settleNo); // 등호
    }
    const name = q("search_name");
    if (name) {
      rows = rows.filter((r) => r.name.includes(name)); // LIKE '%val%'
    }
    const email = q("search_email");
    if (email) {
      rows = rows.filter((r) => r.email === email); // 등호
    }

    // 정렬 ord_ymd DESC 고정(legacy가 전달 orderby 무시).
    rows = [...rows].sort((a, b) => (a.ord_ymd < b.ord_ymd ? 1 : a.ord_ymd > b.ord_ymd ? -1 : 0));

    const totalResults = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE_INVOICE));
    const start = (page - 1) * PER_PAGE_INVOICE;
    return HttpResponse.json({
      items: rows.slice(start, start + PER_PAGE_INVOICE),
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE_INVOICE,
        total_results: totalResults,
        total_pages: totalPages,
      },
    });
  }),

  // legacy china/invoice_member.php — 중국 결제자 목록(flag='Y', idx DESC).
  http.get(api("/admin/china/members"), ({ request }) => {
    const url = new URL(request.url);
    const q = (key: string) => url.searchParams.get(key) ?? "";
    const page = Math.max(1, Number.parseInt(q("page") || "1", 10) || 1);

    let rows = CHINA_MEMBER_LIST;
    const name = q("search_name");
    if (name) {
      rows = rows.filter((r) => r.name.includes(name)); // LIKE '%val%'
    }
    const email = q("search_email");
    if (email) {
      rows = rows.filter((r) => r.email === email); // 등호
    }

    rows = [...rows].sort((a, b) => b.idx - a.idx); // idx DESC

    const totalResults = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE_MEMBER));
    const start = (page - 1) * PER_PAGE_MEMBER;
    return HttpResponse.json({
      items: rows.slice(start, start + PER_PAGE_MEMBER),
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE_MEMBER,
        total_results: totalResults,
        total_pages: totalPages,
      },
    });
  }),

  // legacy invoice_member_ps.php mode=pwd_reset — 비밀번호 초기화(pwd=오늘 Ymd는 백엔드).
  // 성공 시 legacy 빈 응답 → message:"" 이식(빈 alert). 목록 미갱신.
  http.post(api("/admin/china/members/pwd-reset"), async ({ request }) => {
    await request.json().catch(() => ({}));
    return HttpResponse.json({ message: "" });
  }),

  // legacy invoice_member_ps.php mode=register — 결제자 등록(INSERT는 백엔드).
  http.post(api("/admin/china/members"), async ({ request }) => {
    await request.json().catch(() => ({}));
    return HttpResponse.json({ success: true, message: "" });
  }),

  // legacy china/invoice_goods.php — 중국 결제 상품 목록(idx>0, platform·goods_nm ASC).
  http.get(api("/admin/china/goods"), ({ request }) => {
    const url = new URL(request.url);
    const q = (key: string) => url.searchParams.get(key) ?? "";
    const page = Math.max(1, Number.parseInt(q("page") || "1", 10) || 1);

    let rows = CHINA_GOODS_LIST;
    const name = q("search_name");
    if (name) {
      rows = rows.filter((r) => r.goods_nm.includes(name)); // LIKE '%val%'
    }
    const platform = q("search_platform");
    if (platform) {
      rows = rows.filter((r) => r.platform === platform); // 등호
    }

    // 정렬 platform ASC, goods_nm ASC.
    rows = [...rows].sort(
      (a, b) => a.platform.localeCompare(b.platform) || a.goods_nm.localeCompare(b.goods_nm),
    );

    const totalResults = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE_GOODS));
    const start = (page - 1) * PER_PAGE_GOODS;
    return HttpResponse.json({
      items: rows.slice(start, start + PER_PAGE_GOODS),
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE_GOODS,
        total_results: totalResults,
        total_pages: totalPages,
      },
    });
  }),

  // legacy invoice_goods_ps.php mode=register|modify — 상품 등록/수정(INSERT/UPDATE는 백엔드).
  http.post(api("/admin/china/goods"), async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as { mode?: string };
    const message = body.mode === "modify" ? "수정되었습니다." : "등록되었습니다.";
    return HttpResponse.json({ message });
  }),

  // legacy invoice_goods_ps.php mode=delete — 상품 삭제(DELETE는 백엔드).
  http.post(api("/admin/china/goods/delete"), async ({ request }) => {
    await request.json().catch(() => ({}));
    return HttpResponse.json({ message: "삭제되었습니다." });
  }),

  // legacy invoice_register.php — 결제자 전체(모달용, idx DESC, 페이징 없음).
  http.get(api("/admin/china/members/all"), () =>
    HttpResponse.json({
      items: [...CHINA_MEMBER_LIST]
        .sort((a, b) => b.idx - a.idx)
        .map((m) => ({ idx: m.idx, name: m.name, email: m.email })),
    }),
  ),

  // legacy invoice_goods_ps.php mode=invoice_goods_search — 주문상품 검색(platform 등호·goods_nm LIKE).
  http.get(api("/admin/china/goods/search"), ({ request }) => {
    const url = new URL(request.url);
    const platform = url.searchParams.get("search_platform") ?? "";
    const value = url.searchParams.get("search_value") ?? "";
    const items = CHINA_GOODS_LIST.filter(
      (r) => r.platform === platform && r.goods_nm.includes(value),
    )
      .map((r) => ({ platform: r.platform, goods_nm: r.goods_nm, price: r.price }))
      .sort((a, b) => a.platform.localeCompare(b.platform) || a.goods_nm.localeCompare(b.goods_nm));
    return HttpResponse.json({ items });
  }),

  // legacy invoice_ps.php mode=register — 주문서 등록(order + items INSERT는 백엔드).
  http.post(api("/admin/china/orders"), async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as { settle_no?: string };
    return HttpResponse.json({ success: true, settle_no: body.settle_no ?? "" });
  }),

  // legacy china/invoice_request.php — 중국 결제요청 목록(step='1', #218과 동일 필터).
  http.get(api("/admin/china/requests"), ({ request }) => {
    const url = new URL(request.url);
    const q = (key: string) => url.searchParams.get(key) ?? "";
    const page = Math.max(1, Number.parseInt(q("page") || "1", 10) || 1);
    // search_year 미지정 시 서버 현재년(legacy date('Y')).
    const year = q("search_year") || String(new Date().getFullYear());

    // base: step='1' AND (flag='N' OR NULL)(fixture 전량 결제대기) + 연도 범위.
    let rows = CHINA_REQUEST_LIST.filter(
      (r) => r.ord_ymd >= `${year}-01-01` && r.ord_ymd <= `${year}-12-31`,
    );

    const settleNo = q("search_settle_no");
    if (settleNo) {
      rows = rows.filter((r) => r.settle_no === settleNo); // 등호
    }
    const name = q("search_name");
    if (name) {
      rows = rows.filter((r) => r.name.includes(name)); // LIKE '%val%'
    }
    const email = q("search_email");
    if (email) {
      rows = rows.filter((r) => r.email === email); // 등호
    }

    // 정렬 ord_ymd DESC 고정(legacy가 전달 orderby 무시).
    rows = [...rows].sort((a, b) => (a.ord_ymd < b.ord_ymd ? 1 : a.ord_ymd > b.ord_ymd ? -1 : 0));

    const totalResults = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE_REQUEST));
    const start = (page - 1) * PER_PAGE_REQUEST;
    return HttpResponse.json({
      items: rows.slice(start, start + PER_PAGE_REQUEST),
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE_REQUEST,
        total_results: totalResults,
        total_pages: totalPages,
      },
    });
  }),

  // legacy invoice_ps.php mode=invoice_delete — 주문서 삭제(order + item DELETE는 백엔드).
  http.post(api("/admin/china/orders/delete"), async ({ request }) => {
    await request.json().catch(() => ({}));
    return HttpResponse.json({ success: true });
  }),

  // legacy china/sales_china_year.php — 중국 누적매출 현황(연도×지역 매트릭스, 2016~현재년).
  http.get(api("/admin/china/sales/year"), () => {
    const regions = ["중국 산시성", "중국 안후이성", "중국 저장성", "중국 허난성"];
    const endYear = new Date().getFullYear();
    // 샘플 매출(지역×연도). 미지정 연도/지역은 0(zero-value 회색).
    const sample: Record<number, number[]> = {
      2024: [980000, 0, 640000, 0],
      2025: [1200000, 350000, 850000, 0],
      2026: [2400000, 500000, 0, 120000],
    };

    const rows = [];
    const regionTotals = regions.map(() => 0);
    let grandTotal = 0;
    for (let year = 2016; year <= endYear; year++) {
      const amounts = sample[year] ?? regions.map(() => 0);
      const total = amounts.reduce((s, v) => s + v, 0);
      amounts.forEach((v, i) => (regionTotals[i] += v));
      grandTotal += total;
      rows.push({ year, amounts, total });
    }

    return HttpResponse.json({
      regions,
      rows,
      region_totals: regionTotals,
      grand_total: grandTotal,
    });
  }),

  // legacy china/sales_china_month.php — 선택연도 월×지역 매출 매트릭스(1~12월).
  http.get(api("/admin/china/sales/month"), ({ request }) => {
    const url = new URL(request.url);
    const regions = ["중국 산시성", "중국 안후이성", "중국 저장성", "중국 허난성"];
    const year = Number(url.searchParams.get("search_year")) || new Date().getFullYear();
    // 샘플: 현재년만 월별 매출 존재, 그 외 연도는 0.
    const hasData = year === new Date().getFullYear();
    const monthly: Record<number, number[]> = {
      3: [540000, 0, 320000, 0],
      6: [880000, 150000, 0, 60000],
      11: [1200000, 0, 450000, 0],
    };

    const rows = [];
    const regionTotals = regions.map(() => 0);
    let grandTotal = 0;
    for (let month = 1; month <= 12; month++) {
      const amounts = hasData ? (monthly[month] ?? regions.map(() => 0)) : regions.map(() => 0);
      const total = amounts.reduce((s, v) => s + v, 0);
      amounts.forEach((v, i) => (regionTotals[i] += v));
      grandTotal += total;
      rows.push({ month, amounts, total });
    }

    return HttpResponse.json({
      year,
      regions,
      rows,
      region_totals: regionTotals,
      grand_total: grandTotal,
    });
  }),

  // legacy china/order_china_month.php — 선택 연월 타이틀별 주문 매트릭스(타이틀×지역 수량/금액).
  http.get(api("/admin/china/orders/month"), ({ request }) => {
    const url = new URL(request.url);
    const regions = ["중국 산시성", "중국 안후이성", "중국 저장성", "중국 허난성"];
    const now = new Date();
    const year = Number(url.searchParams.get("search_year")) || now.getFullYear();
    const month = Number(url.searchParams.get("search_month")) || now.getMonth() + 1;

    // 샘플: 현재 연·월만 타이틀 존재, 그 외엔 빈 목록.
    const hasData = year === now.getFullYear() && month === now.getMonth() + 1;
    const sampleTitles = hasData
      ? [
          {
            product_nm: "파이널 판타지 XVI",
            platform: "PS5",
            price: 88000,
            cells: [
              { qty: 3, amount: 264000 },
              { qty: 0, amount: 0 },
              { qty: 1, amount: 88000 },
              { qty: 0, amount: 0 },
            ],
          },
          {
            product_nm: "젤다의 전설: 왕국의 눈물",
            platform: "NSW",
            price: 76800,
            cells: [
              { qty: 2, amount: 153600 },
              { qty: 1, amount: 76800 },
              { qty: 0, amount: 0 },
              { qty: 0, amount: 0 },
            ],
          },
        ]
      : [];

    const titles = sampleTitles.map((t) => {
      const row_qty = t.cells.reduce((s, c) => s + c.qty, 0);
      const row_amount = t.cells.reduce((s, c) => s + c.amount, 0);
      return { ...t, row_qty, row_amount };
    });

    const regionTotals = regions.map((_, i) => ({
      qty: titles.reduce((s, t) => s + t.cells[i].qty, 0),
      amount: titles.reduce((s, t) => s + t.cells[i].amount, 0),
    }));
    const totalAllQty = titles.reduce((s, t) => s + t.row_qty, 0);
    const totalAllAmount = titles.reduce((s, t) => s + t.row_amount, 0);

    return HttpResponse.json({
      year,
      month,
      regions,
      titles,
      region_totals: regionTotals,
      total_all_qty: totalAllQty,
      total_all_amount: totalAllAmount,
    });
  }),

  // legacy china/invoice_view.php — 주문서 상세보기(order/items/logs/address).
  http.get(api("/admin/china/orders/detail"), () =>
    HttpResponse.json({
      order: {
        name: "王伟",
        email: "wangwei@example.cn",
        ord_ymd: "2026-05-02",
        settle_price: 264000,
        amount_paid: 88000,
        settle_count: "3",
        step: "1",
      },
      items: [
        { product_nm: "파이널 판타지 XVI", platform: "PS5", price: 88000, qty: 2 },
        { product_nm: "젤다의 전설: 왕국의 눈물", platform: "NSW", price: 76800, qty: 1 },
      ],
      logs: [
        {
          settle_count: 1,
          pg_provider: "kcp",
          status: "paid",
          imp_uid: "imp_1234567890",
          pg_tid: "",
          paid_amount: 88000,
          reg_date: "2026-05-02 10:05:33",
        },
      ],
      address: [
        {
          name: "王伟",
          zipcode: "200000",
          address: "上海市浦东新区世纪大道100号",
          tel: "13800138000",
        },
      ],
    }),
  ),

  // legacy invoice_ps.php mode=modify — 주문 헤더 수정(UPDATE는 백엔드).
  http.post(api("/admin/china/orders/modify"), async ({ request }) => {
    await request.json().catch(() => ({}));
    return HttpResponse.json({ success: true });
  }),
];
