import { http, HttpResponse } from "msw";
import { env } from "@shared/config/env";
import type {
  MemberListItem,
  MemberViewResponse,
  MemberReadyItem,
  MemberSnsItem,
  MemberPointLogItem,
  DirectSendMailLogItem,
} from "@entities/member";

const api = (path: string) => `${env.apiBaseUrl}${path}`;

const PER_PAGE = 30;

// 내부 행 = 응답 컬럼 + 필터 전용(mailling/is_auth). legacy tbl_member tm.* 반환 재현.
type MemberRow = MemberListItem & { mailling: string; is_auth: string };

// legacy status=0 회원(고정 데이터셋). mem_type/level/sns/인증 다양하게.
const members: MemberRow[] = [
  {
    m_no: 100231,
    m_id: "hong123",
    email: "hong@example.com",
    name: "홍길동",
    nickname: "길동이",
    birth_day: "900115",
    hp: "010-1234-5678",
    mem_level: 2,
    reg_date: "2024-05-01 12:03:11",
    log_date: "2026-07-25 09:12:00",
    ip: "1.2.3.4",
    visited: 142,
    sns_type: "kakao",
    mem_type: "P",
    mailling: "Y",
    is_auth: "Y",
  },
  {
    m_no: 100230,
    m_id: "reseller_kim",
    email: "kim@example.com",
    name: "김리셀",
    nickname: "리셀러킴",
    birth_day: "850320",
    hp: "010-2222-3333",
    mem_level: 3,
    reg_date: "2023-11-20 08:40:00",
    log_date: "2026-07-28 22:01:00",
    ip: "5.6.7.8",
    visited: 987,
    sns_type: "naver",
    mem_type: "R",
    mailling: "N",
    is_auth: "Y",
  },
  {
    m_no: 100229,
    m_id: "user_lee",
    email: "",
    name: "이영희",
    nickname: "영희",
    birth_day: "011203",
    hp: "010-4444-5555",
    mem_level: 1,
    reg_date: "2025-02-14 15:22:00",
    log_date: "2026-06-01 10:00:00",
    ip: "9.10.11.12",
    visited: 33,
    sns_type: "payco",
    mem_type: "P",
    mailling: "Y",
    is_auth: "N",
  },
  {
    m_no: 100228,
    m_id: "sleeper01",
    email: "sleep@example.com",
    name: "박휴면",
    nickname: "잠보",
    birth_day: "19781130",
    hp: "010-6666-7777",
    mem_level: 1,
    reg_date: "2020-01-05 09:00:00",
    log_date: "2024-03-01 11:00:00",
    ip: "13.14.15.16",
    visited: 5,
    sns_type: "",
    mem_type: "S",
    mailling: "N",
    is_auth: "N",
  },
  {
    m_no: 100227,
    m_id: "event_choi",
    email: "choi@example.com",
    name: "최이벤",
    nickname: "이벤트",
    birth_day: "950808",
    hp: "010-8888-9999",
    mem_level: 1,
    reg_date: "2025-06-30 18:45:00",
    log_date: "2026-07-27 14:30:00",
    ip: "17.18.19.20",
    visited: 61,
    sns_type: "kakao",
    mem_type: "E",
    mailling: "Y",
    is_auth: "Y",
  },
  {
    m_no: 100226,
    m_id: "vip_jang",
    email: "jang@example.com",
    name: "장브이",
    nickname: "VIP장",
    birth_day: "880212",
    hp: "010-1010-2020",
    mem_level: 3,
    reg_date: "2022-08-11 07:15:00",
    log_date: "2026-07-10 08:00:00",
    ip: "21.22.23.24",
    visited: 512,
    sns_type: "naver",
    mem_type: "P",
    mailling: "Y",
    is_auth: "Y",
  },
  {
    m_no: 100225,
    m_id: "old_user",
    email: "",
    name: "고오래",
    nickname: "올드",
    birth_day: "700601",
    hp: "010-3030-4040",
    mem_level: 2,
    reg_date: "2019-03-22 13:00:00",
    log_date: "2023-05-15 10:00:00",
    ip: "25.26.27.28",
    visited: 8,
    sns_type: "",
    mem_type: "P",
    mailling: "N",
    is_auth: "N",
  },
  {
    m_no: 100224,
    m_id: "normal_seo",
    email: "seo@example.com",
    name: "서일반",
    nickname: "일반서",
    birth_day: "930425",
    hp: "010-5050-6060",
    mem_level: 1,
    reg_date: "2025-07-01 11:11:11",
    log_date: "2026-07-29 07:45:00",
    ip: "29.30.31.32",
    visited: 77,
    sns_type: "payco",
    mem_type: "P",
    mailling: "Y",
    is_auth: "Y",
  },
];

const daysSince = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr.replace(" ", "T")).getTime();
  return Math.floor(diff / 86_400_000);
};

const applyFilters = (rows: MemberRow[], url: URL): MemberRow[] => {
  const q = (key: string) => url.searchParams.get(key) ?? "";
  const searchType = q("search_type");
  const searchValue = q("search_value").trim();
  const memberLevel = Number(q("member_level")) || 0;
  const oldLogin = Number(q("old_login")) || 0;
  const mailling = q("mailling");
  const isAuth = q("is_auth");
  const memType = q("mem_type");
  const startReg = q("start_reg_date");
  const endReg = q("end_reg_date");
  const startLog = q("start_log_date");
  const endLog = q("end_log_date");

  return rows.filter((r) => {
    if (memberLevel && r.mem_level !== memberLevel) return false;
    if (oldLogin && daysSince(r.log_date) < oldLogin) return false;
    if (mailling && mailling !== "all" && r.mailling !== mailling) return false;
    if (isAuth && isAuth !== "all" && r.is_auth !== isAuth) return false;
    if (memType && memType !== "all" && r.mem_type !== memType) return false;
    if (startReg && endReg) {
      const d = r.reg_date.slice(0, 10);
      if (d < startReg || d > endReg) return false;
    }
    if (startLog && endLog) {
      const d = r.log_date.slice(0, 10);
      if (d < startLog || d > endLog) return false;
    } else if (startLog && r.log_date.slice(0, 10) < startLog) {
      return false;
    } else if (endLog && r.log_date.slice(0, 10) > endLog) {
      return false;
    }
    if (searchValue) {
      if (searchType === "m_id") {
        if (!r.m_id.startsWith(searchValue)) return false;
      } else if (searchType === "m_no") {
        if (String(r.m_no) !== searchValue) return false;
      } else {
        // name/nickname/hp/ip — 등호(legacy default case)
        const col = (r as unknown as Record<string, unknown>)[searchType];
        if (String(col ?? "") !== searchValue) return false;
      }
    }
    return true;
  });
};

const sortRows = (rows: MemberRow[], url: URL): MemberRow[] => {
  const sort = url.searchParams.get("sort") ?? "";
  const dir = (url.searchParams.get("dir") ?? "").toLowerCase() === "asc" ? "asc" : "desc";
  const memType = url.searchParams.get("mem_type") ?? "";
  // 화이트리스트 밖이면 기본 정렬(mem_type=R이면 log_date, 아니면 reg_date, DESC).
  const col =
    sort === "reg_date" || sort === "log_date" ? sort : memType === "R" ? "log_date" : "reg_date";
  const effDir = sort === "reg_date" || sort === "log_date" ? dir : "desc";
  const sorted = [...rows].sort((a, b) => a[col].localeCompare(b[col]));
  return effDir === "asc" ? sorted : sorted.reverse();
};

// legacy getCheckoutStatus / getOrderStatus 라벨(백엔드 계산 재현).
const CHECKOUT_LABEL: Record<number, string> = {
  1: "입금대기",
  2: "결제완료",
  8: "환불요청",
  9: "환불완료",
  99: "취소완료",
};
const ORDER_STATUS_LABEL: Record<number, string> = {
  1: "주문대기",
  2: "주문완료",
  3: "배송준비",
  4: "배송중",
  5: "배송완료",
  6: "구매확정",
  8: "취소요청",
  9: "취소완료",
};

// legacy member_view.php 통합 응답 — members 재사용 + 합성 이력/주문/문의.
const buildView = (mNo: string): MemberViewResponse => {
  const m = members.find((r) => String(r.m_no) === mNo) ?? members[0];
  return {
    member: {
      m_no: m.m_no,
      m_id: m.m_id,
      email: m.email,
      name: m.name,
      nickname: m.nickname,
      birth_day: m.birth_day,
      hp: m.hp,
      mem_level: m.mem_level,
      reg_date: m.reg_date,
      log_date: m.log_date,
      ip: m.ip,
      visited: m.visited,
      sns_type: m.sns_type,
      mem_type: m.mem_type,
      is_auth: m.is_auth,
      point: 15400,
    },
    level_history: [
      { history_date: "2026-06", mem_level: 2, order_price: 320000 },
      { history_date: "2026-03", mem_level: 1, order_price: 150000 },
    ],
    level_history_total: 2,
    order_stats: { step2_cnt: 12, step2_price: 540000, success_cnt: 10, cancel_cnt: 2 },
    orders: {
      total_results: 3,
      items: [
        {
          order_date: "2026-07-20 10:00:00",
          settle_no: "S20260720001",
          step: 2,
          step_label: CHECKOUT_LABEL[2],
          ordno: "O456001",
          product_name: "젤다의 전설 왕국의 눈물",
          price: 62000,
          status: 2,
          status_label: ORDER_STATUS_LABEL[2],
        },
        {
          order_date: "2026-05-11 14:30:00",
          settle_no: "S20260511009",
          step: 99,
          step_label: CHECKOUT_LABEL[99],
          ordno: "O456000",
          product_name: "발더스 게이트 3",
          price: 66000,
          status: 9,
          status_label: ORDER_STATUS_LABEL[9],
        },
        {
          order_date: "2026-02-02 09:10:00",
          settle_no: "S20260202003",
          step: 2,
          step_label: CHECKOUT_LABEL[2],
          ordno: "O455900",
          product_name: "슈퍼마리오 원더",
          price: 64800,
          status: 6,
          status_label: ORDER_STATUS_LABEL[6],
        },
      ],
    },
    qna: {
      total_results: 2,
      items: [
        {
          gubun: "2",
          idx: 88,
          subject: "결제가 안돼요",
          file_cnt: 1,
          reg_date: "2026-07-01 09:00:00",
          answer: "확인 후 처리했습니다.",
          admin_id: "admin1",
        },
        {
          gubun: "5",
          idx: 71,
          subject: "제품 키 오류 문의",
          file_cnt: 0,
          reg_date: "2026-04-15 16:20:00",
          answer: "",
          admin_id: "",
        },
      ],
    },
  };
};

// legacy status=5(승인대기) 회원 — country/channel 포함.
const readyMembers: MemberReadyItem[] = [
  {
    m_no: 100242,
    m_id: "waiting_park",
    name: "박대기",
    nickname: "대기박",
    ip: "203.0.113.5",
    country: "KR",
    reg_date: "2026-07-28 10:12:00",
    channel: "web",
  },
  {
    m_no: 100241,
    m_id: "pending_ru",
    name: "이반",
    nickname: "ivan",
    ip: "77.88.55.60",
    country: "RU",
    reg_date: "2026-07-27 22:40:00",
    channel: "web",
  },
  {
    m_no: 100239,
    m_id: "newbie_kim",
    name: "김신규",
    nickname: "뉴비김",
    ip: "1.201.10.20",
    country: "KR",
    reg_date: "2026-07-25 09:05:00",
    channel: "mobile",
  },
];

const applyReadyFilters = (rows: MemberReadyItem[], url: URL): MemberReadyItem[] => {
  const searchType = url.searchParams.get("search_type") ?? "";
  const searchValue = (url.searchParams.get("search_value") ?? "").trim();
  if (!searchValue) return rows;
  return rows.filter((r) => {
    if (searchType === "m_id") return r.m_id.startsWith(searchValue);
    // name/nickname — 등호(legacy default case)
    const col = (r as unknown as Record<string, unknown>)[searchType];
    return String(col ?? "") === searchValue;
  });
};

// legacy 간편로그인 연동 회원(status=0 ∩ sns_type). idx DESC 정렬용 idx 포함.
type SnsRow = MemberSnsItem & { idx: number; sns_type: string };
const snsMembers: SnsRow[] = [
  {
    idx: 501,
    sns_type: "NAVER",
    m_no: 100230,
    m_id: "reseller_kim",
    email: "kim@example.com",
    name: "김리셀",
    nickname: "리셀러킴",
    birth_day: "850320",
    ip: "5.6.7.8",
    country: "KR",
    visited: 987,
    flag: "C",
    reg_date: "2023-11-20 08:40:00",
    sns_connect_date: "2024-01-05 10:00:00",
  },
  {
    idx: 502,
    sns_type: "NAVER",
    m_no: 100226,
    m_id: "vip_jang",
    email: "jang@example.com",
    name: "장브이",
    nickname: "VIP장",
    birth_day: "880212",
    ip: "21.22.23.24",
    country: "KR",
    visited: 512,
    flag: "N",
    reg_date: "2022-08-11 07:15:00",
    sns_connect_date: "2022-08-11 07:20:00",
  },
  {
    idx: 503,
    sns_type: "KAKAO",
    m_no: 100231,
    m_id: "hong123",
    email: "hong@example.com",
    name: "홍길동",
    nickname: "길동이",
    birth_day: "900115",
    ip: "1.2.3.4",
    country: "KR",
    visited: 142,
    flag: "N",
    reg_date: "2024-05-01 12:03:11",
    sns_connect_date: "2024-05-01 12:05:00",
  },
  {
    idx: 504,
    sns_type: "KAKAO",
    m_no: 100227,
    m_id: "event_choi",
    email: "choi@example.com",
    name: "최이벤",
    nickname: "이벤트",
    birth_day: "950808",
    ip: "17.18.19.20",
    country: "KR",
    visited: 61,
    flag: "C",
    reg_date: "2025-06-30 18:45:00",
    sns_connect_date: "2025-07-02 09:00:00",
  },
  {
    idx: 505,
    sns_type: "PAYCO",
    m_no: 100229,
    m_id: "user_lee",
    email: "",
    name: "이영희",
    nickname: "영희",
    birth_day: "011203",
    ip: "9.10.11.12",
    country: "KR",
    visited: 33,
    flag: "N",
    reg_date: "2025-02-14 15:22:00",
    sns_connect_date: "2025-02-14 15:25:00",
  },
];

const applySnsFilters = (rows: SnsRow[], url: URL): SnsRow[] => {
  const snsType = url.searchParams.get("sns_type") ?? "";
  const searchType = url.searchParams.get("search_type") ?? "";
  const searchValue = (url.searchParams.get("search_value") ?? "").trim();
  const snsFlag = url.searchParams.get("sns_flag") ?? "";
  return rows.filter((r) => {
    if (r.sns_type !== snsType) return false;
    if (snsFlag && snsFlag !== "all" && r.flag !== snsFlag) return false;
    if (searchValue) {
      if (searchType === "m_id") {
        if (!r.m_id.startsWith(searchValue)) return false;
      } else {
        // name/nickname/ip — 등호(legacy default case)
        const col = (r as unknown as Record<string, unknown>)[searchType];
        if (String(col ?? "") !== searchValue) return false;
      }
    }
    return true;
  });
};

// legacy tbl_emoney_log 내역(회원 m_id/mem_level 조인 반환).
const pointLogs: MemberPointLogItem[] = [
  {
    sno: 90015,
    m_no: 100231,
    m_id: "hong123",
    mem_level: 2,
    emoney_type: "+",
    emoney: 5000,
    regdt: "2026-07-20 10:00:00",
    admin_id: "admin1",
    memo: "리뉴얼 기념 포인트 지급",
  },
  {
    sno: 90014,
    m_no: 100230,
    m_id: "reseller_kim",
    mem_level: 3,
    emoney_type: "-",
    emoney: 3000,
    regdt: "2026-07-18 14:30:00",
    admin_id: "admin1",
    memo: "차액보정",
  },
  {
    sno: 90013,
    m_no: 100231,
    m_id: "hong123",
    mem_level: 2,
    emoney_type: "-",
    emoney: 1500,
    regdt: "2026-07-15 09:10:00",
    admin_id: "admin2",
    memo: "상품구매 시 포인트 사용",
  },
  {
    sno: 90012,
    m_no: 100226,
    m_id: "vip_jang",
    mem_level: 3,
    emoney_type: "+",
    emoney: 10000,
    regdt: "2026-06-30 18:00:00",
    admin_id: "admin1",
    memo: "회원등급에 따른 추가포인트 지급",
  },
];

const PER_PAGE_POINT = 50;

const applyPointFilters = (rows: MemberPointLogItem[], url: URL): MemberPointLogItem[] => {
  const searchValue = (url.searchParams.get("search_value") ?? "").trim();
  const emoneyType = url.searchParams.get("emoney_type") ?? "";
  return rows.filter((r) => {
    if (emoneyType && emoneyType !== "all" && r.emoney_type !== emoneyType) return false;
    // search_value = 아이디 완전일치(legacy getMemberNo → m_no 필터).
    if (searchValue && r.m_id !== searchValue) return false;
    return true;
  });
};

// legacy tbl_email_api 발송 로그.
const PER_PAGE_MAIL = 50;
const mailLogs: DirectSendMailLogItem[] = [
  {
    gubun: "join",
    email: "hong@example.com",
    reg_date: "2026-07-29 08:00:00",
    result: "1",
    failed: 0,
    state: 2,
    smtp_msg: "",
  },
  {
    gubun: "password",
    email: "kim@example.com",
    reg_date: "2026-07-28 14:30:00",
    result: "1",
    failed: 0,
    state: 2,
    smtp_msg: "",
  },
  {
    gubun: "qna",
    email: "choi@example.com",
    reg_date: "2026-07-27 10:15:00",
    result: "0",
    failed: 4,
    state: 4,
    smtp_msg: "550 invalid domain",
  },
  {
    gubun: "join",
    email: "user_lee@example.com",
    reg_date: "2026-07-25 09:05:00",
    result: "0",
    failed: 1,
    state: 6,
    smtp_msg: "mailbox full",
  },
];

export const memberHandlers = [
  http.get(api("/admin/member/list"), ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
    const filtered = sortRows(applyFilters(members, url), url);
    const totalResults = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE));
    const start = (page - 1) * PER_PAGE;
    return HttpResponse.json({
      items: filtered.slice(start, start + PER_PAGE),
      pagination: { current_page: page, total_results: totalResults, total_pages: totalPages },
      total_all: members.length,
    });
  }),

  http.get(api("/admin/member/view"), ({ request }) => {
    const url = new URL(request.url);
    return HttpResponse.json(buildView(url.searchParams.get("m_no") ?? ""));
  }),

  http.get(api("/admin/member/ready"), ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
    // 기본 정렬 reg_date DESC 고정.
    const filtered = [...applyReadyFilters(readyMembers, url)].sort((a, b) =>
      b.reg_date.localeCompare(a.reg_date),
    );
    const totalResults = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE));
    const start = (page - 1) * PER_PAGE;
    return HttpResponse.json({
      items: filtered.slice(start, start + PER_PAGE),
      pagination: { current_page: page, total_results: totalResults, total_pages: totalPages },
      total_all: readyMembers.length,
    });
  }),

  http.post(api("/admin/member/leave"), () => HttpResponse.json({ success: true })),

  http.post(api("/admin/member/auth-reset"), () => HttpResponse.json({ success: true })),

  http.post(api("/admin/member/apply"), () => HttpResponse.json({ success: true })),

  http.post(api("/admin/member/delete"), () => HttpResponse.json({ success: true })),

  http.get(api("/admin/member/sns"), ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
    // si.idx DESC 고정.
    const filtered = [...applySnsFilters(snsMembers, url)].sort((a, b) => b.idx - a.idx);
    const totalResults = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE));
    const start = (page - 1) * PER_PAGE;
    const snsType = url.searchParams.get("sns_type") ?? "";
    const totalAll = snsMembers.filter((r) => r.sns_type === snsType).length;
    return HttpResponse.json({
      items: filtered.slice(start, start + PER_PAGE),
      pagination: { current_page: page, total_results: totalResults, total_pages: totalPages },
      total_all: totalAll,
    });
  }),

  http.get(api("/admin/member/point/list"), ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
    // tel.sno DESC 고정.
    const filtered = [...applyPointFilters(pointLogs, url)].sort((a, b) => b.sno - a.sno);
    const totalResults = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE_POINT));
    const start = (page - 1) * PER_PAGE_POINT;
    return HttpResponse.json({
      items: filtered.slice(start, start + PER_PAGE_POINT),
      pagination: { current_page: page, total_results: totalResults, total_pages: totalPages },
      total_all: pointLogs.length,
    });
  }),

  http.get(api("/admin/member/point/target"), ({ request }) => {
    const url = new URL(request.url);
    const searchValue = (url.searchParams.get("search_value") ?? "").trim();
    const m = members.find((r) => r.m_id === searchValue);
    if (!m) {
      return HttpResponse.json({ member: null });
    }
    return HttpResponse.json({
      member: {
        m_no: m.m_no,
        m_id: m.m_id,
        nickname: m.nickname,
        name: m.name,
        mem_level: m.mem_level,
        point: 15400,
        reg_date: m.reg_date,
        log_date: m.log_date,
      },
    });
  }),

  http.post(api("/admin/member/point"), async ({ request }) => {
    const body = (await request.json()) as { point_type?: string };
    const message = body.point_type === "sub" ? "포인트 차감완료" : "포인트 지급완료";
    return HttpResponse.json({ success: true, message });
  }),

  http.get(api("/admin/member/directsend/remaining"), () =>
    HttpResponse.json({ remaining_point: 152340 }),
  ),

  http.get(api("/admin/member/directsend/mail-log"), ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
    const gubun = url.searchParams.get("gubun") ?? "";
    const failed = url.searchParams.get("failed") ?? "";
    const searchValue = (url.searchParams.get("search_value") ?? "").trim();
    const filtered = mailLogs.filter((r) => {
      if (gubun && gubun !== "all" && r.gubun !== gubun) return false;
      if (failed && failed !== "all") {
        // failed=1 → IN(1,4), failed=0 → =0.
        if (failed === "1" ? !(r.failed === 1 || r.failed === 4) : r.failed !== Number(failed))
          return false;
      }
      if (searchValue && r.email !== searchValue) return false;
      return true;
    });
    // tea.reg_date DESC 고정.
    const sorted = [...filtered].sort((a, b) => b.reg_date.localeCompare(a.reg_date));
    const totalResults = sorted.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE_MAIL));
    const start = (page - 1) * PER_PAGE_MAIL;
    return HttpResponse.json({
      items: sorted.slice(start, start + PER_PAGE_MAIL),
      pagination: { current_page: page, total_results: totalResults, total_pages: totalPages },
    });
  }),
];
