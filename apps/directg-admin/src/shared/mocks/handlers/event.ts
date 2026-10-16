import { http, HttpResponse } from "msw";
import { env } from "@shared/config/env";

const api = (path: string) => `${env.apiBaseUrl}${path}`;

// legacy event_board_list.php — tbl_event (is_view desc, start_date desc).
const EVENT_BOARD_ROWS = [
  {
    idx: 3,
    event_gubun: "1",
    subject: "풋볼 매니저 26 예약 구매 이벤트",
    contents_html: "<p>풋볼 매니저 26을 예약 구매하고 <strong>사은품</strong>을 받으세요.</p>",
    start_date: 1751328000, // 2025-07-01 00:00:00 UTC
    end_date: 1753920000, // 2025-07-31 00:00:00 UTC
    event_banner: "https://directg.net/data/event/fm26_banner.jpg",
    event_link_url: "https://directg.net/event/fm26",
    is_view: "Y",
    show_promotion: "Y",
  },
  {
    idx: 2,
    event_gubun: "5",
    subject: "2025 여름 프로모션 당첨자 발표",
    contents_html: "<p>당첨을 축하드립니다! 아래 목록을 확인해 주세요.</p>",
    start_date: 1750809600, // 2025-06-25 00:00:00 UTC
    end_date: 1752019200, // 2025-07-09 00:00:00 UTC
    event_banner: "https://directg.net/data/event/summer_winner.jpg",
    event_link_url: "https://directg.net/event/summer-winner",
    is_view: "Y",
    show_promotion: "N",
  },
  {
    idx: 1,
    event_gubun: "2",
    subject: "네이버페이 즉시할인 이벤트",
    contents_html: "<p>네이버페이로 결제 시 <em>즉시 할인</em> 혜택.</p>",
    start_date: 1748736000, // 2025-06-01 00:00:00 UTC
    end_date: 1751241600, // 2025-06-30 00:00:00 UTC
    event_banner: "https://directg.net/data/event/npay.jpg",
    event_link_url: "https://directg.net/event/npay",
    is_view: "N",
    show_promotion: "N",
  },
];
const PER_PAGE_EVENT_BOARD = 10;

// legacy event_lottery_list.php — tbl_event_lottery_config (idx desc), 행별 집계는 백엔드 완료 형태.
const EVENT_LOTTERY_ROWS = [
  {
    idx: 3,
    event_name: "2025 여름 적립금 추첨 이벤트",
    event_gift: "닌텐도 스위치 2",
    event_gift_count: 3,
    event_start_dt: "2025-07-01 00:00:00",
    event_end_dt: "2025-07-31 23:59:59",
    total: 18450000,
    member_count: 1024,
    event_member: 812,
    event_count: 3571,
    won_count: 3,
  },
  {
    idx: 2,
    event_name: "2025 봄맞이 적립금 추첨 이벤트",
    event_gift: "스팀 기프트카드 5만원",
    event_gift_count: 10,
    event_start_dt: "2025-05-01 00:00:00",
    event_end_dt: "2025-05-31 23:59:59",
    total: 9320000,
    member_count: 640,
    event_member: 503,
    event_count: 1987,
    won_count: 10,
  },
  {
    idx: 1,
    event_name: "신규 회원 적립금 추첨 이벤트",
    event_gift: "문화상품권 1만원",
    event_gift_count: 50,
    event_start_dt: "2025-03-01 00:00:00",
    event_end_dt: "2025-03-31 23:59:59",
    total: 2110000,
    member_count: 211,
    event_member: 189,
    event_count: 402,
    won_count: 50,
  },
];
const PER_PAGE_EVENT_LOTTERY = 30;

// legacy event_lottery_success.php — 당첨자현황(tbl_event_lottery_item ⋈ config, 회원 enrich).
const EVENT_LOTTERY_SUCCESS_INFO = {
  event_name: "2025 여름 적립금 추첨 이벤트",
  event_start_dt: "2025-07-01 00:00:00",
  event_end_dt: "2025-07-31 23:59:59",
};
const EVENT_LOTTERY_SUCCESS_ROWS = [
  {
    item_name: "닌텐도 스위치 2",
    m_id: "winner01",
    name: "홍길동",
    birth_day: "900101",
    hp: "010-1234-5678",
    lottery_date: "2025-07-15 14:22:03",
  },
  {
    item_name: "닌텐도 스위치 2",
    m_id: "winner02",
    name: "김철수",
    birth_day: "880512",
    hp: "010-2222-3333",
    lottery_date: "2025-07-15 14:21:47",
  },
  {
    item_name: "닌텐도 스위치 2",
    m_id: "winner03",
    name: "이영희",
    birth_day: "950920",
    hp: "010-4444-5555",
    lottery_date: "2025-07-15 14:20:11",
  },
];

// legacy event_list_202505.php — 2025 가정의달 이벤트(idx 29~33 고정, idx desc). 사용예산 빈 셀.
const EVENT_CAMPAIGN_202505_ROWS = [
  {
    idx: 33,
    event_name: "가정의달 적립금 추첨 이벤트",
    event_gift: "스타벅스 기프티콘",
    event_gift_count: 100,
    event_start_dt: "2025-05-01 00:00:00",
    event_end_dt: "2025-05-31 23:59:59",
    event_member: 512,
  },
  {
    idx: 32,
    event_name: "어린이날 게임 추천 이벤트",
    event_gift: "닌텐도 e숍 카드 1만원",
    event_gift_count: 50,
    event_start_dt: "2025-05-01 00:00:00",
    event_end_dt: "2025-05-10 23:59:59",
    event_member: 341,
  },
  {
    idx: 31,
    event_name: "어버이날 감사 이벤트",
    event_gift: "문화상품권 3만원",
    event_gift_count: 30,
    event_start_dt: "2025-05-05 00:00:00",
    event_end_dt: "2025-05-12 23:59:59",
    event_member: 208,
  },
  {
    idx: 30,
    event_name: "스승의날 응원 이벤트",
    event_gift: "스팀 기프트카드 5만원",
    event_gift_count: 20,
    event_start_dt: "2025-05-10 00:00:00",
    event_end_dt: "2025-05-15 23:59:59",
    event_member: 173,
  },
  {
    idx: 29,
    event_name: "가정의달 첫 구매 이벤트",
    event_gift: "적립금 5,000원",
    event_gift_count: 200,
    event_start_dt: "2025-05-01 00:00:00",
    event_end_dt: "2025-05-31 23:59:59",
    event_member: 689,
  },
];

// legacy event_list_20250626.php — 2025 여름 프로모션(idx 34~37 고정, idx asc). event_per_price 동봉.
const EVENT_CAMPAIGN_20250626_ROWS = [
  {
    idx: 34,
    event_name: "여름 프로모션 첫 구매 이벤트",
    event_gift: "스팀 기프트카드 3만원",
    event_gift_count: 80,
    event_start_dt: "2025-06-26 00:00:00",
    event_end_dt: "2025-08-31 23:59:59",
    event_member: 430,
    event_per_price: 5000,
  },
  {
    idx: 35,
    event_name: "여름 게임 페스티벌 이벤트",
    event_gift: "적립금 1만원",
    event_gift_count: 120,
    event_start_dt: "2025-07-01 00:00:00",
    event_end_dt: "2025-07-31 23:59:59",
    event_member: 612,
    event_per_price: 3000,
  },
  {
    idx: 36,
    event_name: "휴가철 특별 추첨 이벤트",
    event_gift: "닌텐도 e숍 카드 2만원",
    event_gift_count: 40,
    event_start_dt: "2025-07-15 00:00:00",
    event_end_dt: "2025-08-15 23:59:59",
    event_member: 287,
    event_per_price: 4000,
  },
  {
    idx: 37,
    event_name: "여름 프로모션 마무리 이벤트",
    event_gift: "문화상품권 5만원",
    event_gift_count: 25,
    event_start_dt: "2025-08-16 00:00:00",
    event_end_dt: "2025-08-31 23:59:59",
    event_member: 198,
    event_per_price: 10000,
  },
];

// legacy event_fm26.php — 풋볼 매니저 26 예약 구매(idx 38~39 고정, idx asc). event_per_price 동봉.
const EVENT_CAMPAIGN_FM26_ROWS = [
  {
    idx: 38,
    event_name: "풋볼 매니저 26 예약 구매 사은품",
    event_gift: "스팀 기프트카드 1만원",
    event_gift_count: 300,
    event_start_dt: "2025-09-01 00:00:00",
    event_end_dt: "2025-11-04 23:59:59",
    event_member: 274,
    event_per_price: 10000,
  },
  {
    idx: 39,
    event_name: "풋볼 매니저 26 얼리 액세스 이벤트",
    event_gift: "인게임 아이템 쿠폰",
    event_gift_count: 500,
    event_start_dt: "2025-10-28 00:00:00",
    event_end_dt: "2025-11-04 23:59:59",
    event_member: 361,
    event_per_price: 3000,
  },
];

// legacy event_gift_list.php — 사은품 이벤트 진행이력(tbl_event_gift, idx desc).
const EVENT_GIFT_ROWS = [
  {
    idx: 12,
    title: "여름 프로모션 사은품 이벤트",
    gift_nm: "닌텐도 스위치 2",
    gift_count: 3,
    start_dt: "2025-07-01 00:00:00",
    end_dt: "2025-07-31 23:59:59",
    event_m_date: "2025-08-05",
    delivery_date: "2025-08-10",
    is_delivery: "Y",
  },
  {
    idx: 11,
    title: "봄맞이 사은품 증정 이벤트",
    gift_nm: "스타벅스 기프티콘",
    gift_count: 50,
    start_dt: "2025-05-01 00:00:00",
    end_dt: "2025-05-31 23:59:59",
    event_m_date: "2025-06-03",
    delivery_date: "",
    is_delivery: "N",
  },
];

// legacy event_gift_member.php — 사은품 이벤트 당첨자현황(tbl_event_gift_member ⋈ tbl_event_gift).
// idx 12=배송 O(is_delivery Y), idx 11=배송 X(is_delivery N) — #148 fixture와 연동.
const EVENT_GIFT_MEMBER_INFO: Record<
  number,
  { title: string; is_delivery: string; start_dt: string; end_dt: string }
> = {
  12: {
    title: "여름 프로모션 사은품 이벤트",
    is_delivery: "Y",
    start_dt: "2025-07-01 00:00:00",
    end_dt: "2025-07-31 23:59:59",
  },
  11: {
    title: "봄맞이 사은품 증정 이벤트",
    is_delivery: "N",
    start_dt: "2025-05-01 00:00:00",
    end_dt: "2025-05-31 23:59:59",
  },
};
const emptyGiftMember = {
  gift_nm: "",
  m_id: "",
  name: "",
  birth_day: "",
  hp: "",
  tel: "",
  receiver: "",
  zipcode: "",
  address: "",
  address_detail: "",
  reg_date: "",
  status: 0,
  tracking_no: "",
  delivery_code: "",
  asset_id: "",
};
const EVENT_GIFT_MEMBER_ROWS: Record<number, Array<typeof emptyGiftMember>> = {
  12: [
    {
      ...emptyGiftMember,
      gift_nm: "닌텐도 스위치 2",
      m_id: "winner01",
      name: "홍길동",
      birth_day: "900101",
      tel: "010-1234-5678",
      receiver: "홍길동",
      zipcode: "06236",
      address: "서울 강남구 테헤란로 1",
      address_detail: "101호",
      reg_date: "2025-08-06 10:12:00",
      status: 2,
      tracking_no: "1234-5678-9012",
      delivery_code: "001",
    },
    {
      ...emptyGiftMember,
      gift_nm: "닌텐도 스위치 2",
      m_id: "winner02",
      name: "김철수",
      birth_day: "880512",
      tel: "010-2222-3333",
      receiver: "김철수",
      zipcode: "13529",
      address: "경기 성남시 분당구 판교역로 235",
      address_detail: "H스퀘어 5층",
      reg_date: "2025-08-05 09:40:00",
      status: 1,
      tracking_no: "",
      delivery_code: "",
    },
  ],
  11: [
    {
      ...emptyGiftMember,
      asset_id: "ASSET-000123",
      gift_nm: "스타벅스 기프티콘",
      m_id: "spring01",
      name: "이영희",
      birth_day: "950920",
      hp: "010-4444-5555",
      reg_date: "2025-06-04 14:00:00",
      status: 3,
    },
    {
      ...emptyGiftMember,
      asset_id: "ASSET-000124",
      gift_nm: "스타벅스 기프티콘",
      m_id: "spring02",
      name: "박민수",
      birth_day: "920215",
      hp: "010-6666-7777",
      reg_date: "2025-06-03 11:20:00",
      status: 2,
    },
  ],
};

// legacy event_gift_request.php — 사은품 발송 현황(is_delivery='Y' 고정, reg_date desc).
const EVENT_GIFT_REQUEST_ROWS = [
  {
    parent_idx: 12,
    title: "여름 프로모션 사은품 이벤트",
    gift_nm: "닌텐도 스위치 2",
    m_id: "winner01",
    name: "홍길동",
    birth_day: "900101",
    tel: "010-1234-5678",
    receiver: "홍길동",
    zipcode: "06236",
    address: "서울 강남구 테헤란로 1",
    address_detail: "101호",
    reg_date: "2025-08-06 10:12:00",
    status: 2,
    tracking_no: "1234-5678-9012",
    delivery_code: "001",
  },
  {
    parent_idx: 12,
    title: "여름 프로모션 사은품 이벤트",
    gift_nm: "닌텐도 스위치 2",
    m_id: "winner02",
    name: "김철수",
    birth_day: "880512",
    tel: "010-2222-3333",
    receiver: "김철수",
    zipcode: "13529",
    address: "경기 성남시 분당구 판교역로 235",
    address_detail: "H스퀘어 5층",
    reg_date: "2025-08-05 09:40:00",
    status: 1,
    tracking_no: "",
    delivery_code: "",
  },
];
const EVENT_GIFT_REQUEST_OPTIONS = [
  { idx: 12, title: "여름 프로모션 사은품 이벤트", gift_nm: "닌텐도 스위치 2" },
];

// legacy event_point_list.php — 포인트 지급 이벤트(MAIN DB tbl_add_repay ⋈ tbl_goods_item).
// 진행상태(진행중/종료/진행예정)를 모두 노출하기 위해 now 기준 상대 날짜로 생성.
const fmtDateTime = (d: Date) => {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(
    d.getMinutes(),
  )}:${p(d.getSeconds())}`;
};
const shiftDays = (base: Date, days: number) => {
  const d = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
  return fmtDateTime(d);
};
const buildEventPointRows = () => {
  const now = new Date();
  return [
    {
      idx: 5,
      product_code: "PKG-000101",
      product_name: "풋볼 매니저 26 (Standard)",
      product_name_en: "Football Manager 26 (Standard)",
      repay_flag: "Y",
      start_dt: shiftDays(now, -10),
      end_dt: shiftDays(now, 10),
      repay_type: "%",
      repay_point: 5,
    },
    {
      idx: 4,
      product_code: "PKG-000102",
      product_name: "사이버펑크 2077",
      product_name_en: "Cyberpunk 2077",
      repay_flag: "Y",
      start_dt: shiftDays(now, -30),
      end_dt: shiftDays(now, -10),
      repay_type: "P",
      repay_point: 3000,
    },
    {
      idx: 3,
      product_code: "PKG-000103",
      product_name: "GTA 6",
      product_name_en: "GTA 6",
      repay_flag: "N",
      start_dt: shiftDays(now, 10),
      end_dt: shiftDays(now, 20),
      repay_type: "P",
      repay_point: 10000,
    },
  ];
};

export const eventHandlers = [
  // legacy event_point_list.php — 포인트 지급 이벤트(start_dt/end_dt desc, 30/page, 검색필터).
  http.get(api("/admin/event/point-list"), ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
    const searchFlag = url.searchParams.get("search_flag") || "";
    const searchStatus = url.searchParams.get("search_status") || "";
    const searchKey = url.searchParams.get("search_key") || "";
    const searchValue = url.searchParams.get("search_value") || "";
    const nowStr = fmtDateTime(new Date());

    let rows = buildEventPointRows();
    if (searchFlag) {
      rows = rows.filter((r) => r.repay_flag === searchFlag);
    }
    if (searchValue) {
      if (searchKey === "search_product_code") {
        rows = rows.filter((r) => r.product_code === searchValue);
      } else {
        rows = rows.filter(
          (r) => r.product_name.includes(searchValue) || r.product_name_en.includes(searchValue),
        );
      }
    }
    if (searchStatus === "end") {
      rows = rows.filter((r) => r.start_dt < nowStr && r.end_dt < nowStr);
    } else if (searchStatus === "ing") {
      rows = rows.filter((r) => r.start_dt < nowStr && r.end_dt > nowStr);
    } else if (searchStatus === "upcoming") {
      rows = rows.filter((r) => r.start_dt > nowStr && r.end_dt > nowStr);
    }
    // legacy: a.start_dt desc, a.end_dt desc
    rows = [...rows].sort((x, y) =>
      x.start_dt !== y.start_dt
        ? y.start_dt.localeCompare(x.start_dt)
        : y.end_dt.localeCompare(x.end_dt),
    );

    const totalResults = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE_EVENT_LOTTERY));
    const start = (page - 1) * PER_PAGE_EVENT_LOTTERY;
    return HttpResponse.json({
      // product_name_en은 검색용 컬럼(응답 스키마 외)이나 mock JSON에 남아도 화면 미사용(무해).
      items: rows.slice(start, start + PER_PAGE_EVENT_LOTTERY),
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE_EVENT_LOTTERY,
        total_results: totalResults,
        total_pages: totalPages,
      },
    });
  }),

  // legacy event_gift_request.php — 사은품 발송 현황(is_delivery=Y 고정, 검색필터, reg_date desc, 30/page).
  http.get(api("/admin/event/gift-request"), ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
    const searchType = url.searchParams.get("search_type") || "";
    const searchValue = url.searchParams.get("search_value") || "";
    const status = url.searchParams.get("status") || "all";
    const eventGiftIdx = url.searchParams.get("event_gift_idx") || "";

    let rows = EVENT_GIFT_REQUEST_ROWS;
    if (searchValue) {
      const field =
        searchType === "tegm.tracking_no"
          ? "tracking_no"
          : searchType === "tegm.receiver"
            ? "receiver"
            : "m_id";
      rows = rows.filter((r) => String(r[field as keyof typeof r]) === searchValue);
    }
    if (status !== "all") {
      rows = rows.filter((r) => String(r.status) === status);
    }
    if (eventGiftIdx) {
      rows = rows.filter((r) => String(r.parent_idx) === eventGiftIdx);
    }

    const totalResults = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE_EVENT_LOTTERY));
    const start = (page - 1) * PER_PAGE_EVENT_LOTTERY;
    return HttpResponse.json({
      // parent_idx는 응답 스키마 외 필드지만 mock JSON에 남아도 화면에서 미사용(무해).
      items: rows.slice(start, start + PER_PAGE_EVENT_LOTTERY),
      event_gift_options: EVENT_GIFT_REQUEST_OPTIONS,
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE_EVENT_LOTTERY,
        total_results: totalResults,
        total_pages: totalPages,
      },
    });
  }),

  // legacy event_gift_member.php — 사은품 이벤트 당첨자현황(reg_date desc, 30/page, searchTitle=m_id 등호).
  http.get(api("/admin/event/gift-member"), ({ request }) => {
    const url = new URL(request.url);
    const idx = Number(url.searchParams.get("idx")) || 0;
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
    const searchTitle = url.searchParams.get("searchTitle") || "";

    let rows = EVENT_GIFT_MEMBER_ROWS[idx] ?? [];
    if (searchTitle) {
      rows = rows.filter((r) => r.m_id === searchTitle);
    }

    const totalResults = rows.length;
    const hasRows = totalResults > 0;
    const info = EVENT_GIFT_MEMBER_INFO[idx];
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE_EVENT_LOTTERY));
    const start = (page - 1) * PER_PAGE_EVENT_LOTTERY;
    return HttpResponse.json({
      items: rows.slice(start, start + PER_PAGE_EVENT_LOTTERY),
      // legacy: 이벤트 정보는 결과 첫 행 파생 → 0건이면 빈 문자열.
      title: hasRows && info ? info.title : "",
      is_delivery: hasRows && info ? info.is_delivery : "",
      start_dt: hasRows && info ? info.start_dt : "",
      end_dt: hasRows && info ? info.end_dt : "",
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE_EVENT_LOTTERY,
        total_results: totalResults,
        total_pages: totalPages,
      },
    });
  }),

  // legacy event_gift_list.php — 사은품 이벤트 진행이력(idx desc, 30/page, 필터 없음).
  http.get(api("/admin/event/gift-list"), ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);

    const rows = EVENT_GIFT_ROWS;
    const totalResults = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE_EVENT_LOTTERY));
    const start = (page - 1) * PER_PAGE_EVENT_LOTTERY;
    return HttpResponse.json({
      items: rows.slice(start, start + PER_PAGE_EVENT_LOTTERY),
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE_EVENT_LOTTERY,
        total_results: totalResults,
        total_pages: totalPages,
      },
    });
  }),

  // legacy event_fm26.php — 풋볼 매니저 26 예약 구매 이벤트(idx asc, 30/page, 필터 없음).
  http.get(api("/admin/event/campaign-fm26"), ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);

    const rows = EVENT_CAMPAIGN_FM26_ROWS;
    const totalResults = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE_EVENT_LOTTERY));
    const start = (page - 1) * PER_PAGE_EVENT_LOTTERY;
    return HttpResponse.json({
      items: rows.slice(start, start + PER_PAGE_EVENT_LOTTERY),
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE_EVENT_LOTTERY,
        total_results: totalResults,
        total_pages: totalPages,
      },
    });
  }),

  // legacy event_list_20250626.php — 2025 여름 프로모션(idx asc, 30/page, 필터 없음).
  http.get(api("/admin/event/campaign-20250626"), ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);

    const rows = EVENT_CAMPAIGN_20250626_ROWS;
    const totalResults = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE_EVENT_LOTTERY));
    const start = (page - 1) * PER_PAGE_EVENT_LOTTERY;
    return HttpResponse.json({
      items: rows.slice(start, start + PER_PAGE_EVENT_LOTTERY),
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE_EVENT_LOTTERY,
        total_results: totalResults,
        total_pages: totalPages,
      },
    });
  }),

  // legacy event_list_202505.php — 2025 가정의달 이벤트(idx desc, 30/page, 필터 없음).
  http.get(api("/admin/event/campaign-202505"), ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);

    const rows = EVENT_CAMPAIGN_202505_ROWS;
    const totalResults = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE_EVENT_LOTTERY));
    const start = (page - 1) * PER_PAGE_EVENT_LOTTERY;
    return HttpResponse.json({
      items: rows.slice(start, start + PER_PAGE_EVENT_LOTTERY),
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE_EVENT_LOTTERY,
        total_results: totalResults,
        total_pages: totalPages,
      },
    });
  }),

  // legacy event_lottery_success.php — 당첨자현황(lottery_date desc, 30/page, searchTitle=m_id 등호).
  http.get(api("/admin/event/lottery-success"), ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
    const searchTitle = url.searchParams.get("searchTitle") || "";

    let rows = EVENT_LOTTERY_SUCCESS_ROWS;
    if (searchTitle) {
      rows = rows.filter((r) => r.m_id === searchTitle);
    }

    const totalResults = rows.length;
    const hasRows = totalResults > 0;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE_EVENT_LOTTERY));
    const start = (page - 1) * PER_PAGE_EVENT_LOTTERY;
    return HttpResponse.json({
      items: rows.slice(start, start + PER_PAGE_EVENT_LOTTERY),
      // legacy: 이벤트 정보는 결과 첫 행 파생 → 0건이면 빈 문자열(page title "()").
      event_name: hasRows ? EVENT_LOTTERY_SUCCESS_INFO.event_name : "",
      event_start_dt: hasRows ? EVENT_LOTTERY_SUCCESS_INFO.event_start_dt : "",
      event_end_dt: hasRows ? EVENT_LOTTERY_SUCCESS_INFO.event_end_dt : "",
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE_EVENT_LOTTERY,
        total_results: totalResults,
        total_pages: totalPages,
      },
    });
  }),

  // legacy event_lottery_list.php — 추첨 이벤트 현황(idx desc, 30/page, 필터 없음).
  http.get(api("/admin/event/lottery-list"), ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);

    const rows = EVENT_LOTTERY_ROWS;
    const totalResults = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE_EVENT_LOTTERY));
    const start = (page - 1) * PER_PAGE_EVENT_LOTTERY;
    return HttpResponse.json({
      items: rows.slice(start, start + PER_PAGE_EVENT_LOTTERY),
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE_EVENT_LOTTERY,
        total_results: totalResults,
        total_pages: totalPages,
      },
    });
  }),

  // legacy event_board_list.php — 이벤트게시판 목록(10/page).
  http.get(api("/admin/event/board-list"), ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
    const isView = url.searchParams.get("is_view") || "";

    let rows = EVENT_BOARD_ROWS;
    if (isView) {
      rows = rows.filter((r) => r.is_view === isView);
    }

    const totalResults = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE_EVENT_BOARD));
    const start = (page - 1) * PER_PAGE_EVENT_BOARD;
    return HttpResponse.json({
      items: rows.slice(start, start + PER_PAGE_EVENT_BOARD),
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE_EVENT_BOARD,
        total_results: totalResults,
        total_pages: totalPages,
      },
    });
  }),

  // legacy event_board_register.php(idx>0) — tbl_event 단건(폼 프리필, contents는 마크다운 소스).
  http.get(api("/admin/event/board/:idx"), ({ params }) => {
    const idx = Number(params.idx) || 0;
    const row = EVENT_BOARD_ROWS.find((r) => r.idx === idx) ?? EVENT_BOARD_ROWS[0];
    return HttpResponse.json({
      idx,
      event_gubun: row.event_gubun,
      subject: row.subject,
      contents: `### ${row.subject}\n\n이벤트 상세 내용(마크다운 소스)입니다.`,
      event_notes: "- 유의사항 1\n- 유의사항 2",
      start_date: row.start_date,
      end_date: row.end_date,
      event_banner: row.event_banner,
      event_link_target: "_blank",
      event_link_url: row.event_link_url,
      is_view: row.is_view,
      show_promotion: row.show_promotion,
    });
  }),

  // legacy event_board_ps.php mode=register — tbl_event 등록.
  http.post(api("/admin/event/board"), () => HttpResponse.json({ success: true })),

  // legacy event_board_ps.php mode=modify — tbl_event 수정.
  http.put(api("/admin/event/board/:idx"), () => HttpResponse.json({ success: true })),

  // legacy event_board_modify.php — tbl_event_goods(event_no별 이벤트 상품).
  http.get(api("/admin/event/board/:idx/goods"), () =>
    HttpResponse.json({
      items: [
        { idx: 11, product_code: "PKG-000101", product_name: "풋볼 매니저 26 (Standard)" },
        { idx: 12, product_code: "PKG-000102", product_name: "풋볼 매니저 26 (Console Edition)" },
      ],
    }),
  ),

  // legacy event_board_ps.php mode=goods_option_search — 옵션상품 검색(status<>'3').
  http.post(api("/admin/event/board/goods/search"), () =>
    HttpResponse.json({
      items: [
        {
          product_code: "PKG-000201",
          product_name: "Cities: Skylines II",
          product_name_en: "Cities: Skylines II",
          platform_name: "PC",
          publisher_name: "Paradox Interactive",
          game_type_name: "게임",
          status: "0",
        },
        {
          product_code: "PKG-000202",
          product_name: "Gothic 1 Remake",
          product_name_en: "Gothic 1 Remake",
          platform_name: "PC",
          publisher_name: "Plaion",
          game_type_name: "게임",
          status: "9",
        },
      ],
    }),
  ),

  // legacy event_board_ps.php mode=group_search — 그룹코드 검색(전체추가용 group_code 동반).
  http.post(api("/admin/event/board/goods/group-search"), async ({ request }) => {
    const b = (await request.json().catch(() => ({}))) as { search_value?: string };
    return HttpResponse.json({
      group_code: b?.search_value ?? "",
      items: [
        {
          product_code: "PKG-000301",
          product_name: "여름 프로모션 번들 A",
          product_name_en: "Summer Bundle A",
          platform_name: "PC",
          publisher_name: "Nordisk Games",
          game_type_name: "번들",
          status: "0",
        },
      ],
    });
  }),

  // legacy event_board_ps.php mode=event_goods_add — 이벤트 상품 추가.
  http.post(api("/admin/event/board/goods"), () => HttpResponse.json({ success: true })),

  // legacy event_board_ps.php mode=event_goods_delete — 이벤트 상품 삭제.
  http.delete(api("/admin/event/board/goods/:idx"), () => HttpResponse.json({ success: true })),

  // legacy event_board_ps.php mode=group_item_add — 그룹 상품 전체 추가.
  http.post(api("/admin/event/board/goods/group-add"), () => HttpResponse.json({ success: true })),
];
