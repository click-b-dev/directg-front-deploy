import { http, HttpResponse } from "msw";
import { env } from "@shared/config/env";

const api = (path: string) => `${env.apiBaseUrl}${path}`;

// 계약 스키마 사본 (shared는 entities를 import할 수 없다 — FSD import 방향)
type PromotionScheduleRow = {
  idx: number;
  publisher_name: string; // getPublisherName(publisher_code) 결과
  product_code: string;
  product_name: string;
  product_name_en: string;
  product_srp: number; // b.product_srp 퍼블리셔 SRP
  discount_rate: number;
  p_discount_rate: number;
  consumer_price: number;
  promotion_srp: number;
  sale_price: number;
  promotion_start: string;
  promotion_end: string;
  confirm: "Y" | "N";
};

type PromotionUploadBody = { file_name?: string; file_type?: string };

type PromotionWeekendSaveBody = {
  promotion_week_name?: string;
  promotion_week_start?: string;
  promotion_week_end?: string;
  promotion_week_banner_link?: string;
  recommand?: string[];
  best?: string[];
  is_view?: string;
};

type OfflineCouponSaveBody = {
  coupon_name?: string;
  reason?: string;
  issueLimitCnt?: number;
  sdate?: string;
  edate?: string;
  partner?: string;
  code_type?: string;
  coupon_price?: number;
  promotion_code?: string;
  issuePerPersonLimitYn?: string;
  issuePerPersonLimitCnt?: number;
  dailyIssuePerPersonLimitCnt?: number;
};

// datetime-local 'Y-m-dTH:i' → 'Y-m-d H:i:00' (DB 저장 포맷).
const fromLocal = (value: string) => {
  if (!value) return "";
  const s = value.replace("T", " ");
  return s.length === 16 ? `${s}:00` : s;
};

type PromotionSeasonSaveBody = {
  promotion_season_name?: string;
  promotion_season_start?: string;
  promotion_season_end?: string;
  promotion_season_banner_pc?: string;
  promotion_season_banner_mobile?: string;
  promotion_season_banner_link?: string;
  promotion_season_recommand_banner?: string;
  recommand?: string[];
  best?: string[];
  max_discount?: string[];
  add_repay?: string[];
  price_5000?: string[];
  price_10000?: string[];
  max_discount_link?: string;
  add_repay_link?: string;
  is_view?: string;
  notice_title?: string;
  notice_btn_title?: string;
  notice_btn_url?: string;
  notice_view?: string;
};

// legacy tbl_promotion_schedule ⋈ tbl_goods_item 재현. 삭제/승인은 mutable.
// confirm='N'=승인대기(#170), 진행중 기간=진행중(#171), 미시작 기간=진행예정(#172)로 파생.
let PROMOTION_SCHEDULE: PromotionScheduleRow[] = [
  {
    idx: 5120,
    publisher_name: "Electronic Arts",
    product_code: "PC0000512001",
    product_name: "EA SPORTS FC 26 스탠다드 에디션",
    product_name_en: "EA SPORTS FC 26 Standard Edition",
    product_srp: 79800,
    discount_rate: 20,
    p_discount_rate: 15,
    consumer_price: 79800,
    promotion_srp: 67800,
    sale_price: 63840,
    promotion_start: "2026-08-01 00:00:00",
    promotion_end: "2026-08-14 23:59:59",
    confirm: "N",
  },
  {
    idx: 5118,
    publisher_name: "2K Games",
    product_code: "PC0000511802",
    product_name: "문명 7 디럭스 에디션",
    product_name_en: "Sid Meier's Civilization VII Deluxe Edition",
    product_srp: 88000,
    discount_rate: 30,
    p_discount_rate: 25,
    consumer_price: 88000,
    promotion_srp: 66000,
    sale_price: 61600,
    promotion_start: "2026-08-01 00:00:00",
    promotion_end: "2026-08-10 23:59:59",
    confirm: "N",
  },
  {
    idx: 5109,
    publisher_name: "Ubisoft",
    product_code: "PC0000510903",
    product_name: "어쌔신 크리드 섀도우즈",
    product_name_en: "Assassin's Creed Shadows",
    product_srp: 71000,
    discount_rate: 40,
    p_discount_rate: 35,
    consumer_price: 71000,
    promotion_srp: 46150,
    sale_price: 42600,
    promotion_start: "2026-07-28 00:00:00",
    promotion_end: "2026-08-07 23:59:59",
    confirm: "N",
  },
  {
    idx: 5101,
    publisher_name: "CAPCOM",
    product_code: "PC0000510104",
    product_name: "몬스터 헌터 와일즈",
    product_name_en: "Monster Hunter Wilds",
    product_srp: 79800,
    discount_rate: 25,
    p_discount_rate: 20,
    consumer_price: 79800,
    promotion_srp: 63840,
    sale_price: 59850,
    promotion_start: "2026-07-25 00:00:00",
    promotion_end: "2026-08-05 23:59:59",
    confirm: "N",
  },
  // 진행중(promotion_start < 현재 <= promotion_end) fixture — confirm='Y'(승인완료·운영중).
  {
    idx: 5088,
    publisher_name: "SEGA",
    product_code: "PC0000508805",
    product_name: "페르소나 5 더 로열",
    product_name_en: "Persona 5 Royal",
    product_srp: 44800,
    discount_rate: 50,
    p_discount_rate: 45,
    consumer_price: 44800,
    promotion_srp: 24640,
    sale_price: 22400,
    promotion_start: "2026-07-20 00:00:00",
    promotion_end: "2026-08-03 23:59:59",
    confirm: "Y",
  },
  {
    idx: 5079,
    publisher_name: "Bandai Namco",
    product_code: "PC0000507906",
    product_name: "엘든 링 나이트레인",
    product_name_en: "Elden Ring Nightreign",
    product_srp: 49800,
    discount_rate: 15,
    p_discount_rate: 10,
    consumer_price: 49800,
    promotion_srp: 44820,
    sale_price: 42330,
    promotion_start: "2026-07-15 00:00:00",
    promotion_end: "2026-07-31 23:59:59",
    confirm: "Y",
  },
  {
    idx: 5070,
    publisher_name: "Square Enix",
    product_code: "PC0000507007",
    product_name: "파이널 판타지 XVI 컴플리트",
    product_name_en: "Final Fantasy XVI Complete Edition",
    product_srp: 66000,
    discount_rate: 35,
    p_discount_rate: 30,
    consumer_price: 66000,
    promotion_srp: 46200,
    sale_price: 42900,
    promotion_start: "2026-07-24 00:00:00",
    promotion_end: "2026-08-08 23:59:59",
    confirm: "N",
  },
  // 진행예정(promotion_start >= 현재) fixture — confirm Y·N 혼재.
  {
    idx: 5061,
    publisher_name: "Rockstar Games",
    product_code: "PC0000506108",
    product_name: "GTA VI 디지털 디럭스",
    product_name_en: "Grand Theft Auto VI Digital Deluxe",
    product_srp: 99000,
    discount_rate: 10,
    p_discount_rate: 5,
    consumer_price: 99000,
    promotion_srp: 89100,
    sale_price: 89100,
    promotion_start: "2026-08-20 00:00:00",
    promotion_end: "2026-09-03 23:59:59",
    confirm: "Y",
  },
  {
    idx: 5055,
    publisher_name: "Nintendo",
    product_code: "PC0000505509",
    product_name: "젤다의 전설 에코즈 오브 위즈덤",
    product_name_en: "The Legend of Zelda: Echoes of Wisdom",
    product_srp: 64800,
    discount_rate: 20,
    p_discount_rate: 15,
    consumer_price: 64800,
    promotion_srp: 55080,
    sale_price: 51840,
    promotion_start: "2026-08-15 00:00:00",
    promotion_end: "2026-08-28 23:59:59",
    confirm: "N",
  },
  // 종료(promotion_start < 현재 AND promotion_end < 현재) fixture — confirm='Y'(과거 운영·종료).
  {
    idx: 5042,
    publisher_name: "FromSoftware",
    product_code: "PC0000504210",
    product_name: "아머드 코어 6",
    product_name_en: "Armored Core VI: Fires of Rubicon",
    product_srp: 66000,
    discount_rate: 30,
    p_discount_rate: 25,
    consumer_price: 66000,
    promotion_srp: 49500,
    sale_price: 46200,
    promotion_start: "2026-06-20 00:00:00",
    promotion_end: "2026-07-05 23:59:59",
    confirm: "Y",
  },
  {
    idx: 5031,
    publisher_name: "Valve",
    product_code: "PC0000503111",
    product_name: "카운터 스트라이크 2 프라임",
    product_name_en: "Counter-Strike 2 Prime",
    product_srp: 21000,
    discount_rate: 40,
    p_discount_rate: 35,
    consumer_price: 21000,
    promotion_srp: 13650,
    sale_price: 12600,
    promotion_start: "2026-07-01 00:00:00",
    promotion_end: "2026-07-20 23:59:59",
    confirm: "N",
  },
];

// legacy tbl_promotion_weekend 재현(주말특가, 폼 입력·unix 기간·추천/인기게임 resolve 배열).
type WeekendGoods = { product_code: string; product_name: string; game_type: string };
type PromotionWeekendRow = {
  idx: number;
  promotion_week_name: string;
  promotion_week_start: number; // unix sec
  promotion_week_end: number; // unix sec
  promotion_week_banner_link: string;
  is_view: "Y" | "N";
  recommand_goods: WeekendGoods[];
  best_goods: WeekendGoods[];
};

// KST 벽시계(h시) → unix sec (KST=UTC+9). formatDateTime(KST 브라우저 전제)이 동일 시각 표시.
const kst = (y: number, mo: number, d: number, h: number, mi: number) =>
  Math.floor(Date.UTC(y, mo - 1, d, h - 9, mi, 0) / 1000);

// unix sec → 'Y-m-d H:i:s'(로컬=KST 전제, legacy date() 재현). modify 프리필용.
const formatUnix = (sec: number) => {
  const dt = new Date(sec * 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())} ${p(dt.getHours())}:${p(dt.getMinutes())}:${p(dt.getSeconds())}`;
};

// 'Y-m-d H:i:s' → unix sec(legacy strtotime 재현, 로컬 파싱). 실패 시 0.
const parseDateTime = (value: string) => {
  const ms = new Date(value.replace(" ", "T")).getTime();
  return Number.isNaN(ms) ? 0 : Math.floor(ms / 1000);
};

// 저장 코드 배열 → resolve 배열(mock은 name/type resolve 불가 → 코드로 채움, 실제는 백엔드).
const toWeekendGoods = (codes: string[]): WeekendGoods[] =>
  codes.map((c) => ({ product_code: c, product_name: c, game_type: "" }));

// 상세보기(#176) 카드용 resolve 합성(실제는 getGoodsOptionTitleInfo+getGoodsItemDetail 백엔드).
const IMAGE_DOMAIN = "https://image.directg.net";
const resolveViewGoods = (g: WeekendGoods, i: number) => {
  const base = 44000 + (i % 5) * 11000;
  const hasPromo = i % 2 === 0; // 일부만 프로모션가(bg-danger)
  return {
    title_name: g.product_name,
    title_id: 1000 + i,
    title_sku: g.product_code,
    title_domain: IMAGE_DOMAIN,
    product_code: g.product_code,
    product_name: g.product_name,
    option_domain: IMAGE_DOMAIN,
    goods_sku: g.product_code,
    consumer_price: base,
    option_price: base,
    option_discount: 0,
    display_type: i % 3 === 0 ? "edition" : "basic",
    game_type: g.game_type === "dlc" ? "dlc" : "game",
    is_preorder: "N",
    is_bonus: i % 4 === 0 ? "Y" : "N",
    promotion_sale_price: hasPromo ? Math.round((base * 0.7) / 100) * 100 : 0,
    promotion_discount_rate: hasPromo ? 30 : 0,
  };
};

const PROMOTION_WEEKEND: PromotionWeekendRow[] = [
  {
    idx: 12,
    promotion_week_name: "2025년 10월 4주 주말특가",
    promotion_week_start: kst(2025, 10, 24, 16, 0),
    promotion_week_end: kst(2025, 10, 27, 16, 0),
    promotion_week_banner_link: "/event/weekend_202510_4",
    is_view: "Y",
    recommand_goods: [
      { product_code: "PC0000512001", product_name: "EA SPORTS FC 26", game_type: "base" },
      { product_code: "PC0000510104", product_name: "몬스터 헌터 와일즈", game_type: "base" },
    ],
    best_goods: [
      { product_code: "PC0000508805", product_name: "페르소나 5 더 로열", game_type: "base" },
      { product_code: "PC0000504210", product_name: "아머드 코어 6", game_type: "base" },
      {
        product_code: "PC0000503111",
        product_name: "카운터 스트라이크 2 프라임",
        game_type: "dlc",
      },
    ],
  },
  {
    idx: 11,
    promotion_week_name: "2025년 10월 3주 주말특가",
    promotion_week_start: kst(2025, 10, 17, 16, 0),
    promotion_week_end: kst(2025, 10, 20, 16, 0),
    promotion_week_banner_link: "/event/weekend_202510_3",
    is_view: "Y",
    recommand_goods: [
      { product_code: "PC0000511802", product_name: "문명 7 디럭스 에디션", game_type: "base" },
    ],
    best_goods: [
      { product_code: "PC0000507007", product_name: "파이널 판타지 XVI", game_type: "base" },
      { product_code: "PC0000505509", product_name: "젤다의 전설 에코즈", game_type: "base" },
    ],
  },
  {
    idx: 10,
    promotion_week_name: "2025년 9월 4주 주말특가",
    promotion_week_start: kst(2025, 9, 26, 16, 0),
    promotion_week_end: kst(2025, 9, 29, 16, 0),
    promotion_week_banner_link: "/event/weekend_202509_4",
    is_view: "N",
    recommand_goods: [
      { product_code: "PC0000510903", product_name: "어쌔신 크리드 섀도우즈", game_type: "base" },
    ],
    best_goods: [
      { product_code: "PC0000507906", product_name: "엘든 링 나이트레인", game_type: "dlc" },
    ],
  },
];

// legacy tbl_promotion_season 재현(대규모 프로모션, 카드 레이아웃·6 카테고리 코드·배너 URL·공지).
type SeasonGood = { product_code: string; product_name: string };
type PromotionSeasonRow = {
  idx: number;
  promotion_season_name: string;
  promotion_season_start: number; // unix sec
  promotion_season_end: number; // unix sec
  is_view: "Y" | "N";
  notice_view: "Y" | "N";
  notice_title: string;
  notice_btn_url: string;
  notice_btn_title: string;
  promotion_season_banner_pc: string;
  promotion_season_banner_mobile: string;
  promotion_season_banner_link: string;
  promotion_season_recommand_banner: string;
  max_discount_link: string;
  add_repay_link: string;
  recommand_goods: SeasonGood[];
  best_goods: SeasonGood[];
  max_discount_goods: SeasonGood[];
  add_repay_goods: SeasonGood[];
  price_5000_goods: SeasonGood[];
  price_10000_goods: SeasonGood[];
};

const g = (product_code: string, product_name: string): SeasonGood => ({
  product_code,
  product_name,
});

// 저장 코드 배열 → SeasonGood 배열(mock name resolve 불가 → 코드, 실제는 백엔드).
const toSeasonGoods = (codes: string[]): SeasonGood[] =>
  codes.map((c) => ({ product_code: c, product_name: c }));

// 상세보기(#179) 카드용 resolve 합성(#176 resolveViewGoods + 한국어 플래그).
const resolveSeasonViewGoods = (goods: SeasonGood, i: number) => ({
  ...resolveViewGoods({ ...goods, game_type: "game" }, i),
  spoken_korean: i % 2 === 0 ? "Y" : "N",
  interface_korean: "Y",
  exclusive_korean: i % 3 === 0 ? "Y" : "N",
});

const PROMOTION_SEASON: PromotionSeasonRow[] = [
  {
    idx: 8,
    promotion_season_name: "2025 겨울 대규모 프로모션",
    promotion_season_start: kst(2025, 12, 1, 0, 0),
    promotion_season_end: kst(2025, 12, 31, 23, 59),
    is_view: "Y",
    notice_view: "Y",
    notice_title: "겨울 프로모션 참여 안내 및 유의사항",
    notice_btn_url: "/board/notice_view?idx=1024",
    notice_btn_title: "공지 보기",
    promotion_season_banner_pc: "https://image.directg.net/season/2025winter_pc.jpg",
    promotion_season_banner_mobile: "https://image.directg.net/season/2025winter_mo.jpg",
    promotion_season_banner_link: "/event/season_2025winter",
    promotion_season_recommand_banner: "https://image.directg.net/season/2025winter_recommand.jpg",
    max_discount_link: "/event/season_2025winter_maxdiscount",
    add_repay_link: "/event/season_2025winter_repay",
    recommand_goods: [
      g("PC0000512001", "EA SPORTS FC 26"),
      g("PC0000511802", "문명 7 디럭스"),
      g("PC0000510903", "어쌔신 크리드 섀도우즈"),
      g("PC0000510104", "몬스터 헌터 와일즈"),
    ],
    best_goods: [
      g("PC0000508805", "페르소나 5 더 로열"),
      g("PC0000507007", "파이널 판타지 XVI"),
      g("PC0000505509", "젤다의 전설 에코즈"),
      g("PC0000507906", "엘든 링 나이트레인"),
      g("PC0000504210", "아머드 코어 6"),
      g("PC0000503111", "카운터 스트라이크 2 프라임"),
    ],
    max_discount_goods: [
      g("PC0000510903", "어쌔신 크리드 섀도우즈"),
      g("PC0000510104", "몬스터 헌터 와일즈"),
      g("PC0000507007", "파이널 판타지 XVI"),
    ],
    add_repay_goods: [
      g("PC0000508805", "페르소나 5 더 로열"),
      g("PC0000505509", "젤다의 전설 에코즈"),
      g("PC0000507906", "엘든 링 나이트레인"),
    ],
    price_5000_goods: [
      g("PC0000503111", "카운터 스트라이크 2 프라임"),
      g("PC0000504210", "아머드 코어 6"),
      g("PC0000505509", "젤다의 전설 에코즈"),
      g("PC0000511802", "문명 7 디럭스"),
      g("PC0000510104", "몬스터 헌터 와일즈"),
    ],
    price_10000_goods: [
      g("PC0000512001", "EA SPORTS FC 26"),
      g("PC0000507007", "파이널 판타지 XVI"),
      g("PC0000508805", "페르소나 5 더 로열"),
      g("PC0000510903", "어쌔신 크리드 섀도우즈"),
      g("PC0000507906", "엘든 링 나이트레인"),
    ],
  },
  {
    idx: 7,
    promotion_season_name: "2025 가을 게임 페스티벌",
    promotion_season_start: kst(2025, 9, 15, 0, 0),
    promotion_season_end: kst(2025, 10, 15, 23, 59),
    is_view: "N",
    notice_view: "N",
    notice_title: "",
    notice_btn_url: "",
    notice_btn_title: "",
    promotion_season_banner_pc: "https://image.directg.net/season/2025fall_pc.jpg",
    promotion_season_banner_mobile: "https://image.directg.net/season/2025fall_mo.jpg",
    promotion_season_banner_link: "/event/season_2025fall",
    promotion_season_recommand_banner: "https://image.directg.net/season/2025fall_recommand.jpg",
    max_discount_link: "/event/season_2025fall_maxdiscount",
    add_repay_link: "/event/season_2025fall_repay",
    recommand_goods: [
      g("PC0000507906", "엘든 링 나이트레인"),
      g("PC0000504210", "아머드 코어 6"),
      g("PC0000512001", "EA SPORTS FC 26"),
      g("PC0000511802", "문명 7 디럭스"),
    ],
    best_goods: [
      g("PC0000504210", "아머드 코어 6"),
      g("PC0000512001", "EA SPORTS FC 26"),
      g("PC0000508805", "페르소나 5 더 로열"),
      g("PC0000510104", "몬스터 헌터 와일즈"),
      g("PC0000505509", "젤다의 전설 에코즈"),
      g("PC0000503111", "카운터 스트라이크 2 프라임"),
    ],
    max_discount_goods: [
      g("PC0000511802", "문명 7 디럭스"),
      g("PC0000510903", "어쌔신 크리드 섀도우즈"),
      g("PC0000507007", "파이널 판타지 XVI"),
    ],
    add_repay_goods: [
      g("PC0000510104", "몬스터 헌터 와일즈"),
      g("PC0000508805", "페르소나 5 더 로열"),
      g("PC0000507906", "엘든 링 나이트레인"),
    ],
    price_5000_goods: [
      g("PC0000503111", "카운터 스트라이크 2 프라임"),
      g("PC0000505509", "젤다의 전설 에코즈"),
      g("PC0000504210", "아머드 코어 6"),
      g("PC0000511802", "문명 7 디럭스"),
      g("PC0000512001", "EA SPORTS FC 26"),
    ],
    price_10000_goods: [
      g("PC0000508805", "페르소나 5 더 로열"),
      g("PC0000507007", "파이널 판타지 XVI"),
      g("PC0000510903", "어쌔신 크리드 섀도우즈"),
      g("PC0000510104", "몬스터 헌터 와일즈"),
      g("PC0000507906", "엘든 링 나이트레인"),
    ],
  },
];

// legacy tbl_offline_coupon(DGKR) 재현(오프라인 쿠폰, 20/page).
type OfflineCouponRow = {
  sno: number;
  coupon_name: string;
  reason: string;
  regdt: string;
  partner: string;
  sdate: string;
  edate: string;
  coupon_price: number;
  currency: string;
  code_type: "DOWNLOAD" | "STATIC" | "DYNAMIC";
  issue_limit_cnt: number;
  use_count: number;
  status: number;
  promotion_code: string;
  issuePerPersonLimitYn: string; // "Y" | ""
  issuePerPersonLimitCnt: number;
  dailyIssuePerPersonLimitCnt: number;
};

const OFFLINE_COUPON: OfflineCouponRow[] = [
  {
    sno: 34,
    coupon_name: "2026 여름 오프라인 쿠폰",
    reason: "여름 시즌 오프라인 파트너 프로모션",
    regdt: "2026-07-10 11:20:00",
    partner: "GS25",
    sdate: "2026-07-15 00:00:00",
    edate: "2026-08-31 23:59:59",
    coupon_price: 5000,
    currency: "원",
    code_type: "DOWNLOAD",
    issue_limit_cnt: 10000,
    use_count: 3271,
    status: 1,
    promotion_code: "SUMMER2026",
    issuePerPersonLimitYn: "Y",
    issuePerPersonLimitCnt: 1,
    dailyIssuePerPersonLimitCnt: 0,
  },
  {
    sno: 33,
    coupon_name: "PC방 제휴 지정코드",
    reason: "PC방 제휴 지정코드 배포",
    regdt: "2026-06-20 09:00:00",
    partner: "네오위즈 PC방",
    sdate: "2026-07-01 00:00:00",
    edate: "2026-07-20 23:59:59",
    coupon_price: 3000,
    currency: "원",
    code_type: "STATIC",
    issue_limit_cnt: 5000,
    use_count: 4980,
    status: 3,
    promotion_code: "PCROOM-NEOWIZ",
    issuePerPersonLimitYn: "",
    issuePerPersonLimitCnt: 2,
    dailyIssuePerPersonLimitCnt: 1,
  },
  {
    sno: 31,
    coupon_name: "봄 프로모션 난수코드",
    reason: "봄 프로모션 난수코드 발급",
    regdt: "2026-03-05 14:30:00",
    partner: "CU",
    sdate: "2026-03-10 00:00:00",
    edate: "2026-04-30 23:59:59",
    coupon_price: 10000,
    currency: "원",
    code_type: "DYNAMIC",
    issue_limit_cnt: 2000,
    use_count: 1875,
    status: 3,
    promotion_code: "SPRING-RANDOM",
    issuePerPersonLimitYn: "Y",
    issuePerPersonLimitCnt: 1,
    dailyIssuePerPersonLimitCnt: 0,
  },
  {
    sno: 30,
    coupon_name: "신규 파트너 발급대기 쿠폰",
    reason: "이마트24 신규 제휴",
    regdt: "2026-07-28 16:00:00",
    partner: "이마트24",
    sdate: "2026-08-01 00:00:00",
    edate: "2026-09-30 23:59:59",
    coupon_price: 7000,
    currency: "원",
    code_type: "DOWNLOAD",
    issue_limit_cnt: 8000,
    use_count: 0,
    status: 0,
    promotion_code: "EMART24-NEW",
    issuePerPersonLimitYn: "",
    issuePerPersonLimitCnt: 3,
    dailyIssuePerPersonLimitCnt: 1,
  },
];

const PER_PAGE_OFFLINE_COUPON = 20;

const PER_PAGE_PROMOTION = 30;

// legacy 확장자 검증: MIME type을 '/'로 분해해 뒷부분이 xlsx(sheet) 또는 csv만 허용(.xls 거부 quirk).
const ALLOWED_EXT = new Set(["vnd.openxmlformats-officedocument.spreadsheetml.sheet", "csv"]);
const isAllowedFileType = (fileType: string) => {
  const ext = fileType.split("/")[1] ?? "";
  return ALLOWED_EXT.has(ext);
};

// legacy now() 'YYYY-MM-DD HH:MM:SS' — 기간 판정용(동일 포맷 문자열 비교).
const nowString = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};

// legacy 정렬 promotion_start desc, promotion_end desc (승인대기/진행중).
const byStartEndDesc = (a: PromotionScheduleRow, b: PromotionScheduleRow) => {
  const start = b.promotion_start.localeCompare(a.promotion_start);
  return start !== 0 ? start : b.promotion_end.localeCompare(a.promotion_end);
};

// legacy 정렬 promotion_start asc, promotion_end asc, product_name asc (진행예정).
const byStartEndNameAsc = (a: PromotionScheduleRow, b: PromotionScheduleRow) => {
  const start = a.promotion_start.localeCompare(b.promotion_start);
  if (start !== 0) return start;
  const end = a.promotion_end.localeCompare(b.promotion_end);
  return end !== 0 ? end : a.product_name.localeCompare(b.product_name);
};

// search_key/search_value·search_confirm 공통 필터(진행중/진행예정 공유).
const applySearch = (rows: PromotionScheduleRow[], url: URL) => {
  const q = (key: string) => url.searchParams.get(key) ?? "";
  let out = rows;
  const searchValue = q("search_value");
  if (searchValue) {
    const searchKey = q("search_key");
    if (searchKey === "search_name") {
      out = out.filter(
        (r) => r.product_name.includes(searchValue) || r.product_name_en.includes(searchValue),
      );
    } else if (searchKey === "search_product_code") {
      out = out.filter((r) => r.product_code === searchValue);
    }
  }
  const searchConfirm = q("search_confirm");
  if (searchConfirm === "Y" || searchConfirm === "N") {
    out = out.filter((r) => r.confirm === searchConfirm);
  }
  return out;
};

const paginate = (rows: PromotionScheduleRow[], page: number) => {
  const totalResults = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE_PROMOTION));
  const start = (page - 1) * PER_PAGE_PROMOTION;
  return {
    items: rows.slice(start, start + PER_PAGE_PROMOTION),
    pagination: {
      current_page: page,
      results_per_page: PER_PAGE_PROMOTION,
      total_results: totalResults,
      total_pages: totalPages,
    },
  };
};

const pageParam = (url: URL) =>
  Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);

export const promotionHandlers = [
  // legacy promotion/promotion_ready.php — 승인대기 목록(confirm='N', promotion_start desc·promotion_end desc, 30/page).
  http.get(api("/admin/promotion/promotion-ready"), ({ request }) => {
    const url = new URL(request.url);
    const rows = PROMOTION_SCHEDULE.filter((r) => r.confirm === "N").sort(byStartEndDesc);
    return HttpResponse.json(paginate(rows, pageParam(url)));
  }),

  // legacy promotion/promotion_ing.php — 진행중(promotion_start<now<=promotion_end) + 검색필터, 30/page.
  http.get(api("/admin/promotion/promotion-ing"), ({ request }) => {
    const url = new URL(request.url);
    const now = nowString();
    const rows = applySearch(
      PROMOTION_SCHEDULE.filter((r) => r.promotion_start < now && r.promotion_end >= now),
      url,
    ).sort(byStartEndDesc);
    return HttpResponse.json(paginate(rows, pageParam(url)));
  }),

  // legacy promotion/promotion_upcoming.php — 진행예정(promotion_start>=now) + 검색필터, ASC 정렬, 30/page.
  http.get(api("/admin/promotion/promotion-upcoming"), ({ request }) => {
    const url = new URL(request.url);
    const now = nowString();
    const rows = applySearch(
      PROMOTION_SCHEDULE.filter((r) => r.promotion_start >= now && r.promotion_end >= now),
      url,
    ).sort(byStartEndNameAsc);
    return HttpResponse.json(paginate(rows, pageParam(url)));
  }),

  // legacy promotion/promotion_end.php — 종료(promotion_start<now AND promotion_end<now) + 검색필터, 읽기전용, 30/page.
  http.get(api("/admin/promotion/promotion-end"), ({ request }) => {
    const url = new URL(request.url);
    const now = nowString();
    const rows = applySearch(
      PROMOTION_SCHEDULE.filter((r) => r.promotion_start < now && r.promotion_end < now),
      url,
    ).sort(byStartEndDesc);
    return HttpResponse.json(paginate(rows, pageParam(url)));
  }),

  // legacy promotion/promotion_weekend.php — 주말특가 목록(이름검색, promotion_week_start desc·end desc, 30/page).
  http.get(api("/admin/promotion/promotion-weekend"), ({ request }) => {
    const url = new URL(request.url);
    const page = pageParam(url);
    let rows = [...PROMOTION_WEEKEND];
    const searchValue = url.searchParams.get("search_value") ?? "";
    if (searchValue && url.searchParams.get("search_key") === "search_name") {
      rows = rows.filter((r) => r.promotion_week_name.includes(searchValue)); // promotion_week_name LIKE
    }
    rows.sort((a, b) => {
      const start = b.promotion_week_start - a.promotion_week_start;
      return start !== 0 ? start : b.promotion_week_end - a.promotion_week_end;
    });
    const totalResults = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE_PROMOTION));
    const start = (page - 1) * PER_PAGE_PROMOTION;
    return HttpResponse.json({
      items: rows.slice(start, start + PER_PAGE_PROMOTION),
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE_PROMOTION,
        total_results: totalResults,
        total_pages: totalPages,
      },
    });
  }),

  // legacy promotion_weekend_register.php(modify 로드) — 주말특가 상세(프리필).
  http.get(api("/admin/promotion/promotion-weekend/:idx"), ({ params }) => {
    const idx = Number(params.idx);
    const row = PROMOTION_WEEKEND.find((r) => r.idx === idx);
    if (!row) {
      return HttpResponse.json({ success: false }, { status: 404 });
    }
    return HttpResponse.json({
      idx: row.idx,
      promotion_week_name: row.promotion_week_name,
      promotion_week_start: formatUnix(row.promotion_week_start),
      promotion_week_end: formatUnix(row.promotion_week_end),
      promotion_week_banner_link: row.promotion_week_banner_link,
      recommand: row.recommand_goods.map((g) => g.product_code),
      best: row.best_goods.map((g) => g.product_code),
      is_view: row.is_view,
    });
  }),

  // legacy promotion_weekend_ps.php mode=register — 주말특가 등록(insert, reg_date=now).
  http.post(api("/admin/promotion/promotion-weekend"), async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as PromotionWeekendSaveBody;
    const nextIdx = PROMOTION_WEEKEND.reduce((max, r) => Math.max(max, r.idx), 0) + 1;
    PROMOTION_WEEKEND.push({
      idx: nextIdx,
      promotion_week_name: body.promotion_week_name ?? "",
      promotion_week_start: parseDateTime(body.promotion_week_start ?? ""),
      promotion_week_end: parseDateTime(body.promotion_week_end ?? ""),
      promotion_week_banner_link: body.promotion_week_banner_link ?? "",
      is_view: body.is_view === "Y" ? "Y" : "N",
      recommand_goods: toWeekendGoods(body.recommand ?? []),
      best_goods: toWeekendGoods(body.best ?? []),
    });
    return HttpResponse.json({ success: true });
  }),

  // legacy promotion_weekend_ps.php mode=modify — 주말특가 수정(update).
  http.put(api("/admin/promotion/promotion-weekend/:idx"), async ({ params, request }) => {
    const idx = Number(params.idx);
    const body = (await request.json().catch(() => ({}))) as PromotionWeekendSaveBody;
    const row = PROMOTION_WEEKEND.find((r) => r.idx === idx);
    if (!row) {
      return HttpResponse.json({ success: false }, { status: 404 });
    }
    row.promotion_week_name = body.promotion_week_name ?? row.promotion_week_name;
    row.promotion_week_start = parseDateTime(body.promotion_week_start ?? "");
    row.promotion_week_end = parseDateTime(body.promotion_week_end ?? "");
    row.promotion_week_banner_link =
      body.promotion_week_banner_link ?? row.promotion_week_banner_link;
    row.is_view = body.is_view === "Y" ? "Y" : "N";
    row.recommand_goods = toWeekendGoods(body.recommand ?? []);
    row.best_goods = toWeekendGoods(body.best ?? []);
    return HttpResponse.json({ success: true });
  }),

  // legacy promotion_weekend_view.php — 주말특가 상세보기(카드 미리보기, 옵션 resolve).
  http.get(api("/admin/promotion/promotion-weekend/:idx/view"), ({ params }) => {
    const idx = Number(params.idx);
    const row = PROMOTION_WEEKEND.find((r) => r.idx === idx);
    if (!row) {
      return HttpResponse.json({ success: false }, { status: 404 });
    }
    return HttpResponse.json({
      idx: row.idx,
      promotion_week_name: row.promotion_week_name,
      promotion_week_banner_link: row.promotion_week_banner_link,
      recommand: row.recommand_goods.map(resolveViewGoods),
      best: row.best_goods.map(resolveViewGoods),
    });
  }),

  // legacy promotion/promotion_season.php — 대규모 프로모션 목록(카드, 이름검색, start desc·end desc, 30/page).
  // 검색: legacy가 promotion_week_name(없는 컬럼)으로 필터하는 버그 → promotion_season_name으로 수정(개발자 승인).
  http.get(api("/admin/promotion/promotion-season"), ({ request }) => {
    const url = new URL(request.url);
    const page = pageParam(url);
    let rows = [...PROMOTION_SEASON];
    const searchValue = url.searchParams.get("search_value") ?? "";
    if (searchValue && url.searchParams.get("search_key") === "search_name") {
      rows = rows.filter((r) => r.promotion_season_name.includes(searchValue));
    }
    rows.sort((a, b) => {
      const start = b.promotion_season_start - a.promotion_season_start;
      return start !== 0 ? start : b.promotion_season_end - a.promotion_season_end;
    });
    const totalResults = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE_PROMOTION));
    const start = (page - 1) * PER_PAGE_PROMOTION;
    return HttpResponse.json({
      items: rows.slice(start, start + PER_PAGE_PROMOTION),
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE_PROMOTION,
        total_results: totalResults,
        total_pages: totalPages,
      },
    });
  }),

  // legacy promotion_season_register.php(modify 로드) — 대규모 프로모션 상세(프리필).
  http.get(api("/admin/promotion/promotion-season/:idx"), ({ params }) => {
    const idx = Number(params.idx);
    const row = PROMOTION_SEASON.find((r) => r.idx === idx);
    if (!row) {
      return HttpResponse.json({ success: false }, { status: 404 });
    }
    const codes = (goods: SeasonGood[]) => goods.map((x) => x.product_code);
    return HttpResponse.json({
      idx: row.idx,
      promotion_season_name: row.promotion_season_name,
      promotion_season_start: formatUnix(row.promotion_season_start),
      promotion_season_end: formatUnix(row.promotion_season_end),
      promotion_season_banner_pc: row.promotion_season_banner_pc,
      promotion_season_banner_mobile: row.promotion_season_banner_mobile,
      promotion_season_banner_link: row.promotion_season_banner_link,
      promotion_season_recommand_banner: row.promotion_season_recommand_banner,
      recommand: codes(row.recommand_goods),
      best: codes(row.best_goods),
      max_discount: codes(row.max_discount_goods),
      add_repay: codes(row.add_repay_goods),
      price_5000: codes(row.price_5000_goods),
      price_10000: codes(row.price_10000_goods),
      max_discount_link: row.max_discount_link,
      add_repay_link: row.add_repay_link,
      is_view: row.is_view,
      notice_title: row.notice_title,
      notice_btn_title: row.notice_btn_title,
      notice_btn_url: row.notice_btn_url,
      notice_view: row.notice_view,
    });
  }),

  // legacy promotion_season_ps.php mode=register — 대규모 프로모션 등록(legacy ,, 버그 수정).
  http.post(api("/admin/promotion/promotion-season"), async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as PromotionSeasonSaveBody;
    const nextIdx = PROMOTION_SEASON.reduce((max, r) => Math.max(max, r.idx), 0) + 1;
    PROMOTION_SEASON.push({
      idx: nextIdx,
      promotion_season_name: body.promotion_season_name ?? "",
      promotion_season_start: parseDateTime(body.promotion_season_start ?? ""),
      promotion_season_end: parseDateTime(body.promotion_season_end ?? ""),
      is_view: body.is_view === "Y" ? "Y" : "N",
      notice_view: body.notice_view === "Y" ? "Y" : "N",
      notice_title: body.notice_title ?? "",
      notice_btn_url: body.notice_btn_url ?? "",
      notice_btn_title: body.notice_btn_title ?? "",
      promotion_season_banner_pc: body.promotion_season_banner_pc ?? "",
      promotion_season_banner_mobile: body.promotion_season_banner_mobile ?? "",
      promotion_season_banner_link: body.promotion_season_banner_link ?? "",
      promotion_season_recommand_banner: body.promotion_season_recommand_banner ?? "",
      max_discount_link: body.max_discount_link ?? "",
      add_repay_link: body.add_repay_link ?? "",
      recommand_goods: toSeasonGoods(body.recommand ?? []),
      best_goods: toSeasonGoods(body.best ?? []),
      max_discount_goods: toSeasonGoods(body.max_discount ?? []),
      add_repay_goods: toSeasonGoods(body.add_repay ?? []),
      price_5000_goods: toSeasonGoods(body.price_5000 ?? []),
      price_10000_goods: toSeasonGoods(body.price_10000 ?? []),
    });
    return HttpResponse.json({ success: true });
  }),

  // legacy promotion_season_ps.php mode=modify — 대규모 프로모션 수정.
  http.put(api("/admin/promotion/promotion-season/:idx"), async ({ params, request }) => {
    const idx = Number(params.idx);
    const body = (await request.json().catch(() => ({}))) as PromotionSeasonSaveBody;
    const row = PROMOTION_SEASON.find((r) => r.idx === idx);
    if (!row) {
      return HttpResponse.json({ success: false }, { status: 404 });
    }
    row.promotion_season_name = body.promotion_season_name ?? row.promotion_season_name;
    row.promotion_season_start = parseDateTime(body.promotion_season_start ?? "");
    row.promotion_season_end = parseDateTime(body.promotion_season_end ?? "");
    row.promotion_season_banner_pc =
      body.promotion_season_banner_pc ?? row.promotion_season_banner_pc;
    row.promotion_season_banner_mobile =
      body.promotion_season_banner_mobile ?? row.promotion_season_banner_mobile;
    row.promotion_season_banner_link =
      body.promotion_season_banner_link ?? row.promotion_season_banner_link;
    row.promotion_season_recommand_banner =
      body.promotion_season_recommand_banner ?? row.promotion_season_recommand_banner;
    row.max_discount_link = body.max_discount_link ?? row.max_discount_link;
    row.add_repay_link = body.add_repay_link ?? row.add_repay_link;
    row.is_view = body.is_view === "Y" ? "Y" : "N";
    row.notice_view = body.notice_view === "Y" ? "Y" : "N";
    row.notice_title = body.notice_title ?? row.notice_title;
    row.notice_btn_title = body.notice_btn_title ?? row.notice_btn_title;
    row.notice_btn_url = body.notice_btn_url ?? row.notice_btn_url;
    row.recommand_goods = toSeasonGoods(body.recommand ?? []);
    row.best_goods = toSeasonGoods(body.best ?? []);
    row.max_discount_goods = toSeasonGoods(body.max_discount ?? []);
    row.add_repay_goods = toSeasonGoods(body.add_repay ?? []);
    row.price_5000_goods = toSeasonGoods(body.price_5000 ?? []);
    row.price_10000_goods = toSeasonGoods(body.price_10000 ?? []);
    return HttpResponse.json({ success: true });
  }),

  // legacy promotion_season_view.php — 대규모 프로모션 상세보기(6섹션 카드, 옵션 resolve).
  http.get(api("/admin/promotion/promotion-season/:idx/view"), ({ params }) => {
    const idx = Number(params.idx);
    const row = PROMOTION_SEASON.find((r) => r.idx === idx);
    if (!row) {
      return HttpResponse.json({ success: false }, { status: 404 });
    }
    return HttpResponse.json({
      idx: row.idx,
      promotion_season_name: row.promotion_season_name,
      promotion_season_banner_pc: row.promotion_season_banner_pc,
      promotion_season_banner_link: row.promotion_season_banner_link,
      recommand: row.recommand_goods.map(resolveSeasonViewGoods),
      best: row.best_goods.map(resolveSeasonViewGoods),
      max_discount: row.max_discount_goods.map(resolveSeasonViewGoods),
      add_repay: row.add_repay_goods.map(resolveSeasonViewGoods),
      price_5000: row.price_5000_goods.map(resolveSeasonViewGoods),
      price_10000: row.price_10000_goods.map(resolveSeasonViewGoods),
    });
  }),

  // legacy promotion/offline_coupon_list.php — 오프라인 쿠폰 목록(DGKR, sno desc, 20/page).
  http.get(api("/admin/promotion/offline-coupons"), ({ request }) => {
    const url = new URL(request.url);
    const page = pageParam(url);
    let rows = [...OFFLINE_COUPON];
    const searchValue = url.searchParams.get("search_value") ?? "";
    if (searchValue) {
      const searchType = url.searchParams.get("search_type") ?? "";
      if (searchType === "toc.coupon_name") {
        rows = rows.filter((r) => r.coupon_name.includes(searchValue));
      } else if (searchType === "toc.partner") {
        rows = rows.filter((r) => r.partner.includes(searchValue));
      }
    }
    rows.sort((a, b) => b.sno - a.sno);
    const totalResults = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE_OFFLINE_COUPON));
    const start = (page - 1) * PER_PAGE_OFFLINE_COUPON;
    return HttpResponse.json({
      items: rows.slice(start, start + PER_PAGE_OFFLINE_COUPON),
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE_OFFLINE_COUPON,
        total_results: totalResults,
        total_pages: totalPages,
      },
    });
  }),

  // legacy offline_coupon_register.php(update 로드) — 오프라인 쿠폰 상세(프리필). 날짜는 datetime-local 포맷.
  http.get(api("/admin/promotion/offline-coupons/:sno"), ({ params }) => {
    const sno = Number(params.sno);
    const row = OFFLINE_COUPON.find((r) => r.sno === sno);
    if (!row) {
      return HttpResponse.json({ success: false }, { status: 404 });
    }
    const toLocal = (s: string) => s.slice(0, 16).replace(" ", "T"); // 'Y-m-d H:i:s' → 'Y-m-dTH:i'
    return HttpResponse.json({
      sno: row.sno,
      coupon_name: row.coupon_name,
      reason: row.reason,
      issueLimitCnt: row.issue_limit_cnt,
      sdate: toLocal(row.sdate),
      edate: toLocal(row.edate),
      partner: row.partner,
      code_type: row.code_type,
      coupon_price: row.coupon_price,
      promotion_code: row.promotion_code,
      issuePerPersonLimitYn: row.issuePerPersonLimitYn,
      issuePerPersonLimitCnt: row.issuePerPersonLimitCnt,
      dailyIssuePerPersonLimitCnt: row.dailyIssuePerPersonLimitCnt,
    });
  }),

  // legacy offline_coupon_ps.php mode=register — 등록(currency='원'·status=1·regdt=now·코드생성은 백엔드).
  http.post(api("/admin/promotion/offline-coupons"), async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as OfflineCouponSaveBody;
    const nextSno = OFFLINE_COUPON.reduce((max, r) => Math.max(max, r.sno), 0) + 1;
    OFFLINE_COUPON.push({
      sno: nextSno,
      coupon_name: body.coupon_name ?? "",
      reason: body.reason ?? "",
      regdt: nowString(),
      partner: body.partner ?? "",
      sdate: fromLocal(body.sdate ?? ""),
      edate: fromLocal(body.edate ?? ""),
      coupon_price: Number(body.coupon_price ?? 0),
      currency: "원",
      code_type: (body.code_type as OfflineCouponRow["code_type"]) ?? "DYNAMIC",
      issue_limit_cnt: Number(body.issueLimitCnt ?? 0),
      use_count: 0,
      status: 1,
      promotion_code: body.promotion_code ?? "",
      issuePerPersonLimitYn: body.issuePerPersonLimitYn === "Y" ? "Y" : "",
      issuePerPersonLimitCnt: Number(body.issuePerPersonLimitCnt ?? 0),
      dailyIssuePerPersonLimitCnt: Number(body.dailyIssuePerPersonLimitCnt ?? 0),
    });
    return HttpResponse.json({ success: true });
  }),

  // legacy offline_coupon_ps.php mode=update — 수정.
  http.put(api("/admin/promotion/offline-coupons/:sno"), async ({ params, request }) => {
    const sno = Number(params.sno);
    const body = (await request.json().catch(() => ({}))) as OfflineCouponSaveBody;
    const row = OFFLINE_COUPON.find((r) => r.sno === sno);
    if (!row) {
      return HttpResponse.json({ success: false }, { status: 404 });
    }
    row.coupon_name = body.coupon_name ?? row.coupon_name;
    row.reason = body.reason ?? row.reason;
    row.issue_limit_cnt = Number(body.issueLimitCnt ?? row.issue_limit_cnt);
    row.sdate = fromLocal(body.sdate ?? "");
    row.edate = fromLocal(body.edate ?? "");
    row.partner = body.partner ?? row.partner;
    row.code_type = (body.code_type as OfflineCouponRow["code_type"]) ?? row.code_type;
    row.coupon_price = Number(body.coupon_price ?? row.coupon_price);
    row.promotion_code = body.promotion_code ?? row.promotion_code;
    row.issuePerPersonLimitYn = body.issuePerPersonLimitYn === "Y" ? "Y" : "";
    row.issuePerPersonLimitCnt = Number(body.issuePerPersonLimitCnt ?? row.issuePerPersonLimitCnt);
    row.dailyIssuePerPersonLimitCnt = Number(
      body.dailyIssuePerPersonLimitCnt ?? row.dailyIssuePerPersonLimitCnt,
    );
    return HttpResponse.json({ success: true });
  }),

  // legacy offline_coupon_view.php — 오프라인 쿠폰 상세(기본정보 + 사용현황, 20/page).
  http.get(api("/admin/promotion/offline-coupons/:sno/used"), ({ params, request }) => {
    const sno = Number(params.sno);
    const row = OFFLINE_COUPON.find((r) => r.sno === sno);
    if (!row) {
      return HttpResponse.json({ success: false }, { status: 404 });
    }
    const url = new URL(request.url);
    const page = pageParam(url);
    const searchTitle = url.searchParams.get("searchTitle") ?? "";

    // use_count 기반 사용현황 표본 합성(실제는 백엔드 tbl_offline_paper⋈tbl_offline_download).
    const sampleCount = Math.min(row.use_count, 23);
    let used = Array.from({ length: sampleCount }, (_, i) => {
      const n = i + 1;
      return {
        number: `${sno}${String(n).padStart(4, "0")}`,
        m_id: `member${n}`,
        regdt: `2026-07-${String(((n * 3) % 28) + 1).padStart(2, "0")} ${String((n * 7) % 24).padStart(2, "0")}:15:00`,
      };
    });
    if (searchTitle) {
      used = used.filter((u) => u.m_id === searchTitle); // m_id 등호
    }
    used.sort((a, b) => b.regdt.localeCompare(a.regdt)); // regdt DESC

    const totalResults = used.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE_OFFLINE_COUPON));
    const start = (page - 1) * PER_PAGE_OFFLINE_COUPON;
    return HttpResponse.json({
      info: {
        coupon_name: row.coupon_name,
        reason: row.reason,
        issue_limit_cnt: row.issue_limit_cnt,
        sdate: row.sdate,
        edate: row.edate,
        partner: row.partner,
      },
      items: used.slice(start, start + PER_PAGE_OFFLINE_COUPON),
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE_OFFLINE_COUPON,
        total_results: totalResults,
        total_pages: totalPages,
      },
    });
  }),

  // legacy promotion_ps.php mode=file_register — 엑셀 업로드(확장자 검증만 재현, 파싱/upsert는 백엔드).
  http.post(api("/admin/promotion/promotion-ready/upload"), async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as PromotionUploadBody;
    if (!isAllowedFileType(body.file_type ?? "")) {
      return HttpResponse.json({
        success: false,
        message: "엑셀파일 확장자(xls,xlsx,csv)외에는 사용이 불가합니다.",
      });
    }
    // 실제 파싱/upsert는 백엔드. mock은 검증 통과만 응답(신규 행 미생성).
    return HttpResponse.json({ success: true });
  }),

  // legacy promotion_ps.php mode=confirm — confirm='N' 전체 승인(confirm='Y').
  http.post(api("/admin/promotion/promotion-ready/confirm"), () => {
    PROMOTION_SCHEDULE.forEach((r) => {
      if (r.confirm === "N") r.confirm = "Y";
    });
    return HttpResponse.json({ success: true });
  }),

  // legacy promotion_ps.php mode=delete_all — confirm='N' 전체 삭제.
  http.delete(api("/admin/promotion/promotion-ready"), () => {
    PROMOTION_SCHEDULE = PROMOTION_SCHEDULE.filter((r) => r.confirm !== "N");
    return HttpResponse.json({ success: true });
  }),

  // legacy promotion_ps.php mode=delete — 개별 삭제(idx). 진행중/진행예정 포함 공유(제네릭 schedule 삭제).
  http.delete(api("/admin/promotion/promotion-ready/:idx"), ({ params }) => {
    const idx = Number(params.idx);
    const before = PROMOTION_SCHEDULE.length;
    PROMOTION_SCHEDULE = PROMOTION_SCHEDULE.filter((r) => r.idx !== idx);
    if (PROMOTION_SCHEDULE.length === before) {
      return HttpResponse.json({ success: false }, { status: 404 });
    }
    return HttpResponse.json({ success: true });
  }),
];
