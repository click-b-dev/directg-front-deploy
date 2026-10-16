import { http, HttpResponse } from "msw";
import { env } from "@shared/config/env";

const api = (path: string) => `${env.apiBaseUrl}${path}`;

// legacy partner/partner_list.php — 파트너 계정 관리(directgames.tbl_admin_publisher a
// inner join tbl_partner b, b.publisher_code>0, a.idx DESC, 50/page).
// 조회 대상은 퍼블리셔 포털 로그인 계정. report_term/is_system은 tbl_partner 파생(필터 UI 없음).
type PartnerMemberRow = {
  idx: number;
  id: string;
  name: string;
  flag: string;
  publisher_code: number;
  publisher_name: string;
  report_term: string; // 필터용(M/T)
  is_system: string; // 필터용(Y/N)
};

const PARTNER_MEMBER_LIST: PartnerMemberRow[] = [
  {
    idx: 14,
    id: "settlement@bethesda.com",
    name: "김도윤",
    flag: "Y",
    publisher_code: 38,
    publisher_name: "Bethesda Softworks",
    report_term: "M",
    is_system: "Y",
  },
  {
    idx: 11,
    id: "partner@funcom.com",
    name: "이서준",
    flag: "Y",
    publisher_code: 81,
    publisher_name: "Funcom",
    report_term: "T",
    is_system: "N",
  },
  {
    idx: 7,
    id: "kr-report@thq-nordic.com",
    name: "박지호",
    flag: "N",
    publisher_code: 52,
    publisher_name: "THQ Nordic",
    report_term: "M",
    is_system: "Y",
  },
  {
    idx: 3,
    id: "accounts@devolver.com",
    name: "최윤서",
    flag: "Y",
    publisher_code: 27,
    publisher_name: "Devolver Digital",
    report_term: "M",
    is_system: "N",
  },
];
const PER_PAGE = 50;

// legacy partner/partner_code.php — 파트너 마스터(tbl_partner, publisher_code>0, publisher_name ASC).
// add/toggle/report 수정이 반영되도록 가변 배열. report_term: M=월별/T=분기별, is_system: Y/N.
type PartnerRow = {
  publisher_code: number;
  publisher_name: string;
  report_term: string;
  is_system: string;
};

const PARTNER_LIST: PartnerRow[] = [
  { publisher_code: 38, publisher_name: "Bethesda Softworks", report_term: "M", is_system: "Y" },
  { publisher_code: 27, publisher_name: "Devolver Digital", report_term: "M", is_system: "N" },
  { publisher_code: 81, publisher_name: "Funcom", report_term: "T", is_system: "N" },
  { publisher_code: 52, publisher_name: "THQ Nordic", report_term: "M", is_system: "Y" },
];

// legacy getSupplierList() — tbl_publisher 중 tbl_partner에 없는 공급처(추가 모달 select용).
const PARTNER_SUPPLIERS: PartnerRow[] = [
  { publisher_code: 14, publisher_name: "Annapurna Interactive", report_term: "", is_system: "" },
  { publisher_code: 63, publisher_name: "Focus Entertainment", report_term: "", is_system: "" },
  { publisher_code: 45, publisher_name: "Team17", report_term: "", is_system: "" },
];

// legacy partner/partner_pg_fee.php — 파트너 PG수수료(directgames.tbl_pg_fee⋈tbl_partner,
// b.publisher_name ASC, 30/page). fee는 % raw 문자열(인라인 편집). 가변 배열.
type PgFeeRowData = {
  publisher_code: number;
  publisher_name: string;
  account: string;
  credit_card: string;
  mobile_payment: string;
};

const PARTNER_PG_FEE_LIST: PgFeeRowData[] = [
  {
    publisher_code: 38,
    publisher_name: "Bethesda Softworks",
    account: "3.3",
    credit_card: "3.5",
    mobile_payment: "3.4",
  },
  {
    publisher_code: 81,
    publisher_name: "Funcom",
    account: "2.8",
    credit_card: "3.2",
    mobile_payment: "3.0",
  },
];

// legacy getNonPgfeePartner() — tbl_partner 중 tbl_pg_fee에 없는 파트너(등록 모달 후보).
const PARTNER_PG_FEE_CANDIDATES: { publisher_code: number; publisher_name: string }[] = [
  { publisher_code: 27, publisher_name: "Devolver Digital" },
  { publisher_code: 52, publisher_name: "THQ Nordic" },
];
const PG_FEE_PER_PAGE = 30;

// legacy partner/partner_email.php — 파트너 알림 주소록(tbl_publisher_email⋈tbl_partner,
// b.publisher_name ASC, 20/page). email은 JSON 배열(백엔드 파싱). 등록/수정/삭제 UI는
// legacy 미완성(dead) — 읽기 전용이라 고정 fixture.
type PartnerEmailRow = {
  publisher_code: number;
  publisher_name: string;
  email: string[];
};

const PARTNER_EMAIL_LIST: PartnerEmailRow[] = [
  {
    publisher_code: 38,
    publisher_name: "Bethesda Softworks",
    email: ["settlement@bethesda.com", "report@bethesda.com"],
  },
  {
    publisher_code: 81,
    publisher_name: "Funcom",
    email: ["partner@funcom.com"],
  },
];

// legacy getNonEmailPartner() — 이메일 미등록 파트너(등록 모달 후보).
const PARTNER_EMAIL_CANDIDATES: { publisher_code: number; publisher_name: string }[] = [
  { publisher_code: 27, publisher_name: "Devolver Digital" },
  { publisher_code: 52, publisher_name: "THQ Nordic" },
];
const EMAIL_PER_PAGE = 20;

// legacy getPartnerListAll(is_system) — 파트너 select(publisher_name asc). is_system 필터용 필드 포함.
const PARTNER_LIST_ALL = [
  { publisher_code: 38, publisher_name: "Bethesda Softworks", report_term: "M", is_system: "Y" },
  { publisher_code: 27, publisher_name: "Devolver Digital", report_term: "M", is_system: "N" },
  { publisher_code: 81, publisher_name: "Funcom", report_term: "T", is_system: "N" },
  { publisher_code: 52, publisher_name: "THQ Nordic", report_term: "M", is_system: "Y" },
];

// legacy partner/sales_list.php — tbl_sales_publisher 월간 집계(group by product_code,order_srp,
// order by count desc). publisher_code별 고정 fixture(count desc 정렬 유지).
type SalesItemData = {
  publisher_code: number;
  publisher_name: string;
  product_code: string;
  product_nm: string;
  order_srp: number;
  cc: number;
  sum_settleprice: number;
};

const PARTNER_SALES_DATA: Record<number, SalesItemData[]> = {
  38: [
    {
      publisher_code: 38,
      publisher_name: "Bethesda Softworks",
      product_code: "BS-SKYRIM-AE",
      product_nm: "The Elder Scrolls V: Skyrim Anniversary Edition",
      order_srp: 44000,
      cc: 120,
      sum_settleprice: 5280000,
    },
    {
      publisher_code: 38,
      publisher_name: "Bethesda Softworks",
      product_code: "BS-FALLOUT4-GOTY",
      product_nm: "Fallout 4: Game of the Year Edition",
      order_srp: 33000,
      cc: 85,
      sum_settleprice: 2805000,
    },
    {
      publisher_code: 38,
      publisher_name: "Bethesda Softworks",
      product_code: "BS-DOOM-ETERNAL",
      product_nm: "DOOM Eternal",
      order_srp: 42000,
      cc: 47,
      sum_settleprice: 1974000,
    },
  ],
  81: [
    {
      publisher_code: 81,
      publisher_name: "Funcom",
      product_code: "FC-CONAN-EXILES",
      product_nm: "Conan Exiles",
      order_srp: 39000,
      cc: 62,
      sum_settleprice: 2418000,
    },
  ],
};

// legacy partner/refund_list.php — tbl_sales_publisher status='9'(환불), canceldt 월 집계.
// sales와 동일 구조, 환불 데이터. publisher_code별 고정 fixture(count desc).
const PARTNER_REFUND_DATA: Record<number, SalesItemData[]> = {
  38: [
    {
      publisher_code: 38,
      publisher_name: "Bethesda Softworks",
      product_code: "BS-SKYRIM-AE",
      product_nm: "The Elder Scrolls V: Skyrim Anniversary Edition",
      order_srp: 44000,
      cc: 8,
      sum_settleprice: 352000,
    },
    {
      publisher_code: 38,
      publisher_name: "Bethesda Softworks",
      product_code: "BS-FALLOUT4-GOTY",
      product_nm: "Fallout 4: Game of the Year Edition",
      order_srp: 33000,
      cc: 3,
      sum_settleprice: 99000,
    },
  ],
  81: [
    {
      publisher_code: 81,
      publisher_name: "Funcom",
      product_code: "FC-CONAN-EXILES",
      product_nm: "Conan Exiles",
      order_srp: 39000,
      cc: 2,
      sum_settleprice: 78000,
    },
  ],
};

// legacy partner/report_register.php — setPartnerReport() 정산 raw(판매 status'2' + 환불 status'9').
// 계산(VAT/fee/revenue share)은 프론트에서. 정렬 product_name_en asc/order_srp desc/settlekind asc/status asc.
type ReportRawData = {
  product_code: string;
  product_nm: string;
  product_name_en: string;
  order_srp: number;
  settlekind: string;
  price: number;
  status: string;
  cc: number;
  sum_settleprice: number;
  product_srp: number;
  product_ppr: number;
  product_rs: string;
  platform: string;
  product_platform: number;
};

const PARTNER_REPORT_DATA: Record<number, ReportRawData[]> = {
  38: [
    {
      product_code: "BS-SKYRIM-AE",
      product_nm: "엘더스크롤 5: 스카이림 AE",
      product_name_en: "The Elder Scrolls V: Skyrim Anniversary Edition",
      order_srp: 44000,
      settlekind: "Account",
      price: 44000,
      status: "2",
      cc: 100,
      sum_settleprice: 4400000,
      product_srp: 44000,
      product_ppr: 20000,
      product_rs: "70",
      platform: "PC",
      product_platform: 1,
    },
    {
      product_code: "BS-SKYRIM-AE",
      product_nm: "엘더스크롤 5: 스카이림 AE",
      product_name_en: "The Elder Scrolls V: Skyrim Anniversary Edition",
      order_srp: 44000,
      settlekind: "Account",
      price: 44000,
      status: "9",
      cc: -5,
      sum_settleprice: -220000,
      product_srp: 44000,
      product_ppr: 20000,
      product_rs: "70",
      platform: "PC",
      product_platform: 1,
    },
    {
      product_code: "BS-FALLOUT4-GOTY",
      product_nm: "폴아웃 4 GOTY",
      product_name_en: "Fallout 4: Game of the Year Edition",
      order_srp: 30000,
      settlekind: "Credit",
      price: 33000,
      status: "2",
      cc: 40,
      sum_settleprice: 1200000,
      product_srp: 33000,
      product_ppr: 15000,
      product_rs: "0",
      platform: "PC",
      product_platform: 1,
    },
  ],
};

// legacy getPartnerPGFee() — 단건 PG 수수료(결제수수료 override).
const PARTNER_REPORT_PGFEE: Record<
  number,
  { account: string; credit_card: string; mobile_payment: string }
> = {
  38: { account: "3.3", credit_card: "3.5", mobile_payment: "3.4" },
};

// legacy partner/report_list.php — 생성된 리포트 내역(tbl_report_config). status는 한글 변환값.
type ReportListRow = {
  idx: number;
  publisher_code: number;
  publisher_name: string;
  report_year: string;
  report_month: string;
  report_term: string;
  total: number;
  royalty: number;
  currency_converter: string;
  total_sold: number;
  status: string;
};

const PARTNER_REPORT_LIST: ReportListRow[] = [
  {
    idx: 101,
    publisher_code: 38,
    publisher_name: "Bethesda Softworks",
    report_year: "2026",
    report_month: "07",
    report_term: "M",
    total: 2707600,
    royalty: 0.00075,
    currency_converter: "USD",
    total_sold: 135,
    status: "대기",
  },
  {
    idx: 98,
    publisher_code: 52,
    publisher_name: "THQ Nordic",
    report_year: "2026",
    report_month: "07",
    report_term: "M",
    total: 1840000,
    royalty: 0.00075,
    currency_converter: "USD",
    total_sold: 82,
    status: "확인",
  },
  {
    idx: 90,
    publisher_code: 81,
    publisher_name: "Funcom",
    report_year: "2026",
    report_month: "2",
    report_term: "T",
    total: 5120000,
    royalty: 0.0062,
    currency_converter: "EUR",
    total_sold: 240,
    status: "송금완료",
  },
];

// legacy partner/report_view.php — 리포트 상세(getPartnerReportInfo config + getPartnerReportData items).
// status는 raw(미변환). idx별 고정 fixture(report_list와 idx 일관).
type ReportViewConfig = {
  idx: number;
  publisher: string;
  publisher_code: number;
  currency_converter: string;
  account_fee: string;
  card_fee: string;
  mobile_fee: string;
  report_year: string;
  report_month: string;
  report_term: string;
  royalty: number;
  royalty_info: string;
  reg_date: string;
  update_date: string;
  notice_date: string;
  approval_date: string;
  status: string;
};
type ReportViewItem = {
  product_code: string;
  product_nm_en: string;
  publisher_srp: number;
  rate: string;
  publisher_price: number;
  product_cost: number;
  gross_units_sold: number;
  gross_sales_ex_vat: number;
  payment_gateway_fee: number;
  net_sales: number;
  revenue_share: number;
  platform: string;
  payment_gateway: string;
};

const PARTNER_REPORT_VIEW: Record<number, { config: ReportViewConfig; items: ReportViewItem[] }> = {
  101: {
    config: {
      idx: 101,
      publisher: "Bethesda Softworks",
      publisher_code: 38,
      currency_converter: "USD",
      account_fee: "3.3",
      card_fee: "3.5",
      mobile_fee: "3.4",
      report_year: "2026",
      report_month: "07",
      report_term: "M",
      royalty: 0.00075,
      royalty_info: "2026.07 평균 환율",
      reg_date: "2026-08-01 10:12:00",
      update_date: "2026-08-01 10:12:00",
      notice_date: "",
      approval_date: "",
      status: "ready",
    },
    items: [
      {
        product_code: "BS-SKYRIM-AE",
        product_nm_en: "The Elder Scrolls V: Skyrim Anniversary Edition",
        publisher_srp: 44000,
        rate: "0",
        publisher_price: 44000,
        product_cost: 20000,
        gross_units_sold: 95,
        gross_sales_ex_vat: 3800000,
        payment_gateway_fee: 125400,
        net_sales: 3674600,
        revenue_share: 2572220,
        platform: "PC",
        payment_gateway: "Account",
      },
      {
        product_code: "BS-FALLOUT4-GOTY",
        product_nm_en: "Fallout 4: Game of the Year Edition",
        publisher_srp: 33000,
        rate: "9",
        publisher_price: 30000,
        product_cost: 15000,
        gross_units_sold: 40,
        gross_sales_ex_vat: 1090909,
        payment_gateway_fee: 38181,
        net_sales: 1052728,
        revenue_share: 204750,
        platform: "PC",
        payment_gateway: "Credit",
      },
    ],
  },
};

export const partnerHandlers = [
  // legacy partner/partner_list.php — 파트너 계정 관리 목록.
  http.get(api("/admin/partner/members"), ({ request }) => {
    const url = new URL(request.url);
    const q = (key: string) => url.searchParams.get(key) ?? "";
    const page = Math.max(1, Number.parseInt(q("page") || "1", 10) || 1);

    let rows = PARTNER_MEMBER_LIST;
    const publisherName = q("search_publisher_name");
    if (publisherName) {
      rows = rows.filter((r) => r.publisher_name.includes(publisherName)); // LIKE '%val%'
    }
    const reportTerm = q("report_term");
    if (reportTerm) {
      rows = rows.filter((r) => r.report_term === reportTerm); // 등호
    }
    const isSystem = q("is_system");
    if (isSystem) {
      rows = rows.filter((r) => r.is_system === isSystem); // 등호
    }

    rows = [...rows].sort((a, b) => b.idx - a.idx); // a.idx DESC

    const totalResults = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE));
    const start = (page - 1) * PER_PAGE;
    return HttpResponse.json({
      items: rows.slice(start, start + PER_PAGE).map((r) => ({
        idx: r.idx,
        id: r.id,
        name: r.name,
        flag: r.flag,
        publisher_code: r.publisher_code,
        publisher_name: r.publisher_name,
      })),
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE,
        total_results: totalResults,
        total_pages: totalPages,
      },
    });
  }),

  // legacy partner/partner_code.php — 파트너 코드 목록(tbl_partner, publisher_name ASC, 50/page).
  http.get(api("/admin/partner/partners"), ({ request }) => {
    const url = new URL(request.url);
    const q = (key: string) => url.searchParams.get(key) ?? "";
    const page = Math.max(1, Number.parseInt(q("page") || "1", 10) || 1);

    let rows = PARTNER_LIST;
    const publisherName = q("search_publisher_name");
    if (publisherName) {
      rows = rows.filter((r) => r.publisher_name.includes(publisherName)); // LIKE '%val%'
    }
    const reportTerm = q("report_term");
    if (reportTerm) {
      rows = rows.filter((r) => r.report_term === reportTerm); // 등호
    }
    const isSystem = q("is_system");
    if (isSystem) {
      rows = rows.filter((r) => r.is_system === isSystem); // 등호
    }

    // publisher_name ASC
    rows = [...rows].sort((a, b) =>
      a.publisher_name < b.publisher_name ? -1 : a.publisher_name > b.publisher_name ? 1 : 0,
    );

    const totalResults = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE));
    const start = (page - 1) * PER_PAGE;
    return HttpResponse.json({
      items: rows.slice(start, start + PER_PAGE),
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE,
        total_results: totalResults,
        total_pages: totalPages,
      },
    });
  }),

  // legacy getSupplierList() — 미등록 공급처(publisher_name ASC).
  http.get(api("/admin/partner/suppliers"), () => {
    const rows = [...PARTNER_SUPPLIERS]
      .sort((a, b) =>
        a.publisher_name < b.publisher_name ? -1 : a.publisher_name > b.publisher_name ? 1 : 0,
      )
      .map((r) => ({ publisher_code: r.publisher_code, publisher_name: r.publisher_name }));
    return HttpResponse.json(rows);
  }),

  // legacy partner_ps.php mode=partner_add — tbl_partner insert(flag='Y'), 공급처에서 제거.
  http.post(api("/admin/partner/partners"), async ({ request }) => {
    const body = (await request.json()) as {
      publisher_code: number;
      publisher_name: string;
      report_term: string;
    };
    PARTNER_LIST.push({
      publisher_code: body.publisher_code,
      publisher_name: body.publisher_name,
      report_term: body.report_term,
      is_system: "",
    });
    const idx = PARTNER_SUPPLIERS.findIndex((s) => s.publisher_code === body.publisher_code);
    if (idx >= 0) {
      PARTNER_SUPPLIERS.splice(idx, 1);
    }
    return HttpResponse.json({ message: "등록되었습니다." });
  }),

  // legacy partner_ps.php mode=partner_config — is_system 토글 update.
  http.post(api("/admin/partner/partners/system"), async ({ request }) => {
    const body = (await request.json()) as { publisher_code: number; is_system: string };
    const row = PARTNER_LIST.find((r) => r.publisher_code === body.publisher_code);
    if (row) {
      row.is_system = body.is_system;
    }
    return HttpResponse.json({ message: "수정되었습니다." });
  }),

  // legacy partner_ps.php mode=partner_report_config — report_term update.
  http.post(api("/admin/partner/partners/report-term"), async ({ request }) => {
    const body = (await request.json()) as { publisher_code: number; report_term: string };
    const row = PARTNER_LIST.find((r) => r.publisher_code === body.publisher_code);
    if (row) {
      row.report_term = body.report_term;
    }
    return HttpResponse.json({ message: "수정되었습니다." });
  }),

  // legacy partner/partner_pg_fee.php — PG 수수료 목록(b.publisher_name ASC, 30/page).
  http.get(api("/admin/partner/pg-fees"), ({ request }) => {
    const url = new URL(request.url);
    const q = (key: string) => url.searchParams.get(key) ?? "";
    const page = Math.max(1, Number.parseInt(q("page") || "1", 10) || 1);

    let rows = PARTNER_PG_FEE_LIST;
    const publisherName = q("search_publisher_name");
    if (publisherName) {
      rows = rows.filter((r) => r.publisher_name.includes(publisherName)); // LIKE '%val%'
    }

    rows = [...rows].sort((a, b) =>
      a.publisher_name < b.publisher_name ? -1 : a.publisher_name > b.publisher_name ? 1 : 0,
    );

    const totalResults = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PG_FEE_PER_PAGE));
    const start = (page - 1) * PG_FEE_PER_PAGE;
    return HttpResponse.json({
      items: rows.slice(start, start + PG_FEE_PER_PAGE),
      pagination: {
        current_page: page,
        results_per_page: PG_FEE_PER_PAGE,
        total_results: totalResults,
        total_pages: totalPages,
      },
    });
  }),

  // legacy getNonPgfeePartner() — 수수료 미등록 파트너(publisher_name ASC).
  http.get(api("/admin/partner/pg-fees/candidates"), () => {
    const rows = [...PARTNER_PG_FEE_CANDIDATES].sort((a, b) =>
      a.publisher_name < b.publisher_name ? -1 : a.publisher_name > b.publisher_name ? 1 : 0,
    );
    return HttpResponse.json(rows);
  }),

  // legacy partner_pg_fee_ps.php mode=register — tbl_pg_fee insert(reg_date=now), 후보에서 제거.
  http.post(api("/admin/partner/pg-fees"), async ({ request }) => {
    const body = (await request.json()) as {
      publisher_code: number;
      account: string;
      credit_card: string;
      mobile_payment: string;
    };
    const candidateIdx = PARTNER_PG_FEE_CANDIDATES.findIndex(
      (c) => c.publisher_code === body.publisher_code,
    );
    const name =
      candidateIdx >= 0
        ? PARTNER_PG_FEE_CANDIDATES[candidateIdx].publisher_name
        : String(body.publisher_code);
    PARTNER_PG_FEE_LIST.push({
      publisher_code: body.publisher_code,
      publisher_name: name,
      account: body.account,
      credit_card: body.credit_card,
      mobile_payment: body.mobile_payment,
    });
    if (candidateIdx >= 0) {
      PARTNER_PG_FEE_CANDIDATES.splice(candidateIdx, 1);
    }
    return HttpResponse.json({ message: "등록되었습니다." });
  }),

  // legacy partner_pg_fee_ps.php mode=modify — fee 3종 update.
  http.post(api("/admin/partner/pg-fees/modify"), async ({ request }) => {
    const body = (await request.json()) as {
      publisher_code: number;
      account: string;
      credit_card: string;
      mobile_payment: string;
    };
    const row = PARTNER_PG_FEE_LIST.find((r) => r.publisher_code === body.publisher_code);
    if (row) {
      row.account = body.account;
      row.credit_card = body.credit_card;
      row.mobile_payment = body.mobile_payment;
    }
    return HttpResponse.json({ message: "수정되었습니다." });
  }),

  // legacy partner_pg_fee_ps.php mode=delete — tbl_pg_fee 삭제, 후보로 복귀.
  http.post(api("/admin/partner/pg-fees/delete"), async ({ request }) => {
    const body = (await request.json()) as { publisher_code: number };
    const idx = PARTNER_PG_FEE_LIST.findIndex((r) => r.publisher_code === body.publisher_code);
    if (idx >= 0) {
      const [removed] = PARTNER_PG_FEE_LIST.splice(idx, 1);
      PARTNER_PG_FEE_CANDIDATES.push({
        publisher_code: removed.publisher_code,
        publisher_name: removed.publisher_name,
      });
    }
    return HttpResponse.json({ message: "삭제되었습니다." });
  }),

  // legacy partner/partner_email.php — 알림 주소록 목록(b.publisher_name ASC, 20/page).
  http.get(api("/admin/partner/notification-emails"), ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);

    const rows = [...PARTNER_EMAIL_LIST].sort((a, b) =>
      a.publisher_name < b.publisher_name ? -1 : a.publisher_name > b.publisher_name ? 1 : 0,
    );

    const totalResults = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / EMAIL_PER_PAGE));
    const start = (page - 1) * EMAIL_PER_PAGE;
    return HttpResponse.json({
      items: rows.slice(start, start + EMAIL_PER_PAGE),
      pagination: {
        current_page: page,
        results_per_page: EMAIL_PER_PAGE,
        total_results: totalResults,
        total_pages: totalPages,
      },
    });
  }),

  // legacy getNonEmailPartner() — 이메일 미등록 파트너(publisher_name ASC).
  http.get(api("/admin/partner/notification-emails/candidates"), () => {
    const rows = [...PARTNER_EMAIL_CANDIDATES].sort((a, b) =>
      a.publisher_name < b.publisher_name ? -1 : a.publisher_name > b.publisher_name ? 1 : 0,
    );
    return HttpResponse.json(rows);
  }),

  // legacy getPartnerListAll(is_system) — 검색필터 파트너 select(publisher_name ASC).
  http.get(api("/admin/partner/list-all"), ({ request }) => {
    const url = new URL(request.url);
    const isSystem = url.searchParams.get("is_system") || "";
    let rows = PARTNER_LIST_ALL;
    if (isSystem) {
      rows = rows.filter((r) => r.is_system === isSystem);
    }
    rows = [...rows].sort((a, b) =>
      a.publisher_name < b.publisher_name ? -1 : a.publisher_name > b.publisher_name ? 1 : 0,
    );
    return HttpResponse.json(rows);
  }),

  // legacy partner/sales_list.php — Sales list 조회(publisher_code 미지정 시 빈 목록).
  http.get(api("/admin/partner/sales-list"), ({ request }) => {
    const url = new URL(request.url);
    const publisherCode = Number(url.searchParams.get("publisher_code") || "0");
    const items = publisherCode ? (PARTNER_SALES_DATA[publisherCode] ?? []) : [];
    const totalSold = items.reduce((sum, r) => sum + r.cc, 0);
    const totalPrice = items.reduce((sum, r) => sum + r.sum_settleprice, 0);
    return HttpResponse.json({ items, total_sold: totalSold, total_price: totalPrice });
  }),

  // legacy report_ps.php mode=report_batch — sp_sales_publisher_insert_batch(백엔드). 메시지만.
  http.post(api("/admin/partner/sales-list/sync"), () =>
    HttpResponse.json({ message: "동기화가 완료되었습니다. 새로 고침해주십시요" }),
  ),

  // legacy partner/refund_list.php — Refund list 조회(publisher_code 미지정 시 빈 목록).
  http.get(api("/admin/partner/refund-list"), ({ request }) => {
    const url = new URL(request.url);
    const publisherCode = Number(url.searchParams.get("publisher_code") || "0");
    const items = publisherCode ? (PARTNER_REFUND_DATA[publisherCode] ?? []) : [];
    const totalSold = items.reduce((sum, r) => sum + r.cc, 0);
    const totalPrice = items.reduce((sum, r) => sum + r.sum_settleprice, 0);
    return HttpResponse.json({ items, total_sold: totalSold, total_price: totalPrice });
  }),

  // legacy report_ps.php mode=refund_batch — sp_sales_publisher_refund_batch(백엔드). 메시지만.
  http.post(api("/admin/partner/refund-list/sync"), () =>
    HttpResponse.json({ message: "동기화가 완료되었습니다. 새로 고침해주십시요" }),
  ),

  // legacy partner/report_register.php — 정산 리포트 미리보기(setPartnerReport + getPartnerPGFee).
  http.get(api("/admin/partner/report/preview"), ({ request }) => {
    const url = new URL(request.url);
    const publisherCode = Number(url.searchParams.get("publisher_code") || "0");
    if (!publisherCode) {
      return HttpResponse.json({ items: [], pg_fee: null });
    }
    const items = PARTNER_REPORT_DATA[publisherCode] ?? [];
    const pgFee = PARTNER_REPORT_PGFEE[publisherCode] ?? null;
    return HttpResponse.json({ items, pg_fee: pgFee });
  }),

  // legacy report_ps.php mode=report_register — tbl_report_config + tbl_report(백엔드). 메시지만.
  http.post(api("/admin/partner/report"), () =>
    HttpResponse.json({ message: "리포트가 생성되었습니다." }),
  ),

  // legacy report_ps.php mode=revenue_edit — tbl_goods_item update(백엔드). 메시지만.
  http.post(api("/admin/partner/report/revenue-edit"), () =>
    HttpResponse.json({ message: "수정되었습니다." }),
  ),

  // legacy partner/report_list.php — 리포트 내역 목록(report_term 필터, publisher 있으면 month 무시).
  http.get(api("/admin/partner/report/list"), ({ request }) => {
    const url = new URL(request.url);
    const reportTerm = url.searchParams.get("report_term") || "M";
    const publisher = url.searchParams.get("publisher_code") || "";
    const year = url.searchParams.get("year") || "";
    const month = url.searchParams.get("month") || "";

    let rows = PARTNER_REPORT_LIST.filter((r) => r.report_term === reportTerm);
    if (year) {
      rows = rows.filter((r) => r.report_year === year);
    }
    if (publisher) {
      rows = rows.filter((r) => String(r.publisher_code) === publisher);
    } else if (month) {
      rows = rows.filter((r) => r.report_month === month);
    }

    const totalSold = rows.reduce((sum, r) => sum + r.total_sold, 0);
    const totalPrice = rows.reduce((sum, r) => sum + r.total, 0);
    // publisher_code는 필터용 여분 필드(프론트 미사용).
    return HttpResponse.json({ items: rows, total_sold: totalSold, total_price: totalPrice });
  }),

  // legacy partner/report_view.php — 리포트 상세(config + items). status raw.
  http.get(api("/admin/partner/report/view"), ({ request }) => {
    const url = new URL(request.url);
    const idx = Number(url.searchParams.get("idx") || "0");
    const view = PARTNER_REPORT_VIEW[idx] ?? PARTNER_REPORT_VIEW[101];
    return HttpResponse.json(view);
  }),
];
