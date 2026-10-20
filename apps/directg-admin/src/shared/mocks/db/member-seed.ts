// 회원 mock 시드 — 기존 8명에 더해 42명을 결정적으로 생성해 총 50명으로 만든다.
// - 앞 20명(index 0~19)은 상세 화면의 모든 필드를 확인할 수 있는 "전체 필드 계정"이다.
// - 나머지 22명은 일부 필드(이메일/휴대폰/생년월일 등)가 비어 있어 빈 값 표시를 확인할 수 있다.
// FSD: shared 레이어라 entities 타입을 import하지 않고 구조만 맞춘다.

export type SeedMember = {
  m_no: number;
  m_id: string;
  email: string;
  name: string;
  nickname: string;
  birth_day: string;
  hp: string;
  mem_level: number;
  reg_date: string;
  log_date: string;
  ip: string;
  visited: number;
  sns_type: string;
  mem_type: string;
  mailling: string;
  is_auth: string;
};

const SURNAMES = ["김", "이", "박", "최", "정", "강", "조", "윤", "장", "임"];
const GIVEN = [
  "민준",
  "서연",
  "지후",
  "하윤",
  "도윤",
  "서아",
  "예준",
  "지유",
  "시우",
  "수아",
  "주원",
  "하은",
  "건우",
  "채원",
  "현우",
  "지민",
  "선우",
  "다은",
  "유준",
  "소율",
  "정우",
  "나윤",
  "승현",
  "예린",
  "재윤",
  "시은",
  "태양",
  "보람",
  "동현",
  "가은",
  "성민",
  "아린",
  "우진",
  "세아",
  "민재",
  "유나",
  "준서",
  "혜원",
  "지훈",
  "다온",
];
const NICK = ["게이머", "콜렉터", "플레이어", "마스터", "루키", "헌터", "레전드", "탐험가"];
const SNS = ["naver", "kakao", "payco", ""];

const pad = (value: number, length = 2) => String(value).padStart(length, "0");

export const GENERATED_COUNT = 42;
export const FULL_FIELD_COUNT = 20;
const FIRST_M_NO = 100300;

const build = (i: number): SeedMember => {
  const full = i < FULL_FIELD_COUNT;
  const j = i - FULL_FIELD_COUNT; // 부분 계정 순번
  const type = i % 10 === 9 ? "S" : i % 7 === 3 ? "R" : i % 13 === 5 ? "E" : "P";

  // 휴면(S)은 최근 접속이 2023년이라 가입일을 2022년 이전으로 둔다.
  const regYear = type === "S" ? 2019 + (i % 4) : 2019 + ((i * 3) % 8);
  const regMonth = regYear === 2026 ? 1 + (i % 9) : 1 + ((i * 5) % 12);
  const regDate = `${regYear}-${pad(regMonth)}-${pad(1 + ((i * 7) % 27))} ${pad((i * 5) % 24)}:${pad((i * 11) % 60)}:${pad((i * 17) % 60)}`;
  // 휴면(S)은 오래전 접속, 나머지는 최근 접속(가입일 이후 보장)
  const logDate =
    type === "S"
      ? `2023-${pad(1 + (i % 12))}-${pad(1 + ((i * 3) % 27))} 10:${pad((i * 7) % 60)}:00`
      : `2026-10-${pad(1 + (i % 19))} ${pad((i * 3) % 24)}:${pad((i * 13) % 60)}:00`;

  const birthYear = 1975 + ((i * 7) % 30);
  const birth6 = `${pad(birthYear % 100)}${pad(1 + ((i * 5) % 12))}${pad(1 + ((i * 11) % 27))}`;
  const birth8 = `${birthYear}${birth6.slice(2)}`;

  const name = `${SURNAMES[i % SURNAMES.length]}${GIVEN[i % GIVEN.length]}`;
  const hasEmail = full || j % 3 !== 0;
  const hasHp = full || j % 4 !== 0;
  const hasBirth = full || j % 5 !== 0;

  return {
    m_no: FIRST_M_NO + i,
    m_id: `user${pad(i + 1)}`,
    email: hasEmail ? `user${pad(i + 1)}@example.com` : "",
    name,
    nickname: `${NICK[i % NICK.length]}${i + 1}`,
    // 전체 필드 계정은 6자리/8자리 생년월일을 번갈아 써서 두 형식을 모두 확인한다.
    birth_day: hasBirth ? (full && i % 2 === 0 ? birth8 : birth6) : "",
    hp: hasHp
      ? `010-${pad(1000 + ((i * 137) % 9000), 4)}-${pad(1000 + ((i * 251) % 9000), 4)}`
      : "",
    mem_level: ((i * 2) % 3) + 1,
    reg_date: regDate,
    log_date: logDate,
    ip: `${10 + (i % 200)}.${(i * 7) % 255}.${(i * 13) % 255}.${1 + ((i * 17) % 254)}`,
    visited: 5 + ((i * 37) % 300),
    sns_type: SNS[i % SNS.length],
    mem_type: type,
    mailling: i % 2 === 0 ? "Y" : "N",
    // 4명 중 1명은 이메일 미인증(승인대기) — 수동승인 흐름 확인용
    is_auth: i % 4 === 3 ? "N" : "Y",
  };
};

export const generatedMembers: SeedMember[] = Array.from({ length: GENERATED_COUNT }, (_, i) =>
  build(i),
);

/** 전체 필드 계정(앞 20명)인지 */
export const isFullFieldMember = (m_no: number) =>
  m_no >= FIRST_M_NO && m_no < FIRST_M_NO + FULL_FIELD_COUNT;

/** 이메일 미인증(승인대기, legacy status=5)인 회원 번호 — 기존 3명 + 생성 회원 중 is_auth가 N인 회원 */
export const PENDING_APPROVAL_M_NOS = new Set<string>([
  "100229",
  "100228",
  "100225",
  ...generatedMembers
    .filter((member) => member.is_auth === "N")
    .map((member) => String(member.m_no)),
]);

// ── 회원 상세(member_view) 변주: 포인트 / 주문 / 등급 변동 이력 ──

type SeedOrder = {
  order_date: string;
  settle_no: string;
  step: number;
  step_label: string;
  ordno: string;
  product_name: string;
  price: number;
  status: number;
  status_label: string;
};

const PRODUCTS = [
  ["마블 스파이더맨 2", 64800],
  ["페르소나4 리바이벌", 54800],
  ["발더스 게이트 3", 66000],
  ["슈퍼마리오 원더", 64800],
  ["스팀 월렛 코드 50,000원", 50000],
  ["엘든 링", 59800],
  ["젤다의 전설 티어스 오브 더 킹덤", 69800],
  ["사이버펑크 2077", 39800],
  ["스타듀 밸리", 16000],
  ["할로우 나이트", 17000],
] as const;
// 대부분 주문완료(2)·구매확정(6), 일부는 취소요청(8)·취소완료(9)
const STATUS_CYCLE = [2, 6, 2, 9, 6, 2, 8, 6, 2, 6] as const;
const STATUS_LABEL: Record<number, string> = {
  2: "주문완료",
  6: "구매확정",
  8: "취소요청",
  9: "취소완료",
};

const orderFor = (i: number, k: number): SeedOrder => {
  const [product, price] = PRODUCTS[(i + k) % PRODUCTS.length];
  const status = STATUS_CYCLE[(i + k) % STATUS_CYCLE.length];
  const canceled = status === 8 || status === 9;
  const day = new Date(2026, 9, 19 - k * 4);
  const ymd = `${day.getFullYear()}${pad(day.getMonth() + 1)}${pad(day.getDate())}`;
  return {
    order_date: `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())} ${pad((i * 3 + k) % 24)}:${pad((k * 17) % 60)}:00`,
    settle_no: `S${ymd}${pad(i, 3)}${pad(k)}`,
    step: canceled ? 99 : 2,
    step_label: canceled ? "취소완료" : "결제완료",
    ordno: `O${700000 + i * 100 + k}`,
    product_name: product,
    price,
    status,
    status_label: STATUS_LABEL[status],
  };
};

export type SeedViewExtras = {
  point: number;
  level_history: Array<{ history_date: string; mem_level: number; order_price: number }>;
  order_stats: { step2_cnt: number; step2_price: number; success_cnt: number; cancel_cnt: number };
  orders: { total_results: number; items: SeedOrder[] };
};

export const memberViewExtras = (m_no: number): SeedViewExtras | undefined => {
  const i = m_no - FIRST_M_NO;
  if (i < 0 || i >= GENERATED_COUNT) return undefined;
  const full = i < FULL_FIELD_COUNT;

  // 첫 번째 전체 필드 계정은 주문 25건으로 페이지네이션(20개)을 확인한다.
  const orderCount = full ? (i === 0 ? 25 : 3 + ((i * 2) % 9)) : i % 3;
  const items = Array.from({ length: orderCount }, (_, k) => orderFor(i, k));
  const paid = items.filter((order) => order.step === 2);
  const canceled = items.filter((order) => order.status === 8 || order.status === 9);

  const historyCount = full ? 2 + (i % 5) : i % 2;
  const level_history = Array.from({ length: historyCount }, (_, k) => {
    const month = 9 - k * 3; // 3개월 단위 산정
    const year = month > 0 ? 2026 : 2025;
    const m = month > 0 ? month : month + 12;
    return {
      history_date: `${year}-${pad(m)}`,
      mem_level: Math.max(1, Math.min(3, ((i + k) % 3) + 1)),
      order_price: 4500 + ((i * 31 + k * 7) % 40) * 10000,
    };
  });

  return {
    point: full ? 1500 + i * 2750 : i % 2 === 0 ? 0 : 300 * i,
    level_history,
    order_stats: {
      step2_cnt: paid.length,
      step2_price: paid.reduce((sum, order) => sum + order.price, 0),
      success_cnt: items.length - canceled.length,
      cancel_cnt: canceled.length,
    },
    orders: { total_results: items.length, items },
  };
};
