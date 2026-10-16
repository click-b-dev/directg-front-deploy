import { http, HttpResponse } from "msw";
import { env } from "@shared/config/env";
import { db } from "../db";

const api = (path: string) => `${env.apiBaseUrl}${path}`;

type OptionStatus = "0" | "1" | "2" | "9" | "3";
type OptionCategory =
  | "game"
  | "edition"
  | "dlc"
  | "etc"
  | "holomodels"
  | "holomodelsdlc"
  | "holomodelsedition";
const CATEGORIES: OptionCategory[] = [
  "game",
  "edition",
  "dlc",
  "etc",
  "holomodels",
  "holomodelsdlc",
  "holomodelsedition",
];

type OptionProduct = {
  product_code: string;
  product_name: string;
  product_name_en: string;
  platform: string;
  release_date: string;
  game_type: string;
  display_type: string;
  supplier: string;
  is_free: "Y" | "N";
  is_free_url: string;
  consumer_price: number;
  discount: number;
  price: number;
  status: OptionStatus;
};
type MutationResponse = { success: boolean };

const prod = (code: string, name: string, over: Partial<OptionProduct> = {}): OptionProduct => ({
  product_code: code,
  product_name: name,
  product_name_en: `${name} (EN)`,
  platform: "PC",
  release_date: "2026-06-01",
  game_type: "게임",
  display_type: "기본",
  supplier: "H2 Interactive",
  is_free: "N",
  is_free_url: "",
  consumer_price: 66000,
  discount: 10,
  price: 59400,
  status: "0",
  ...over,
});

// 카테고리별 후보 풀(검색 대상). 실제는 tbl_goods_item.
const CANDIDATE_POOL: Record<OptionCategory, OptionProduct[]> = {
  game: [
    prod("DG-G-1001", "젤다의 전설 왕국의 눈물", { game_type: "게임", display_type: "기본" }),
    prod("DG-G-1002", "젤다의 전설 스탠다드", { discount: 0, price: 66000 }),
    prod("DG-G-1003", "무료체험판", { is_free: "Y", is_free_url: "https://directg.net/free" }),
    prod("DG-G-1004", "젤다의 전설 얼티밋", {
      platform: "Switch",
      consumer_price: 79000,
      discount: 15,
      price: 67150,
    }),
    prod("DG-G-1005", "젤다의 전설 (구작)", {
      platform: "Switch",
      release_date: "2017-03-03",
      status: "3",
    }),
    prod("DG-G-1006", "젤다의 전설 스팀판", {
      platform: "Steam",
      supplier: "Valve",
      discount: 20,
      price: 52800,
    }),
  ],
  edition: [
    prod("DG-E-2001", "젤다 디럭스 에디션", {
      display_type: "에디션",
      consumer_price: 89000,
      price: 80100,
    }),
    prod("DG-E-2002", "젤다 컬렉터스 에디션", {
      display_type: "에디션",
      consumer_price: 120000,
      price: 108000,
    }),
    prod("DG-E-2003", "젤다 얼티밋 에디션", {
      display_type: "에디션",
      consumer_price: 150000,
      discount: 20,
      price: 120000,
    }),
    prod("DG-E-2004", "젤다 스타터 에디션", {
      display_type: "에디션",
      consumer_price: 59000,
      discount: 0,
      price: 59000,
      status: "1",
    }),
  ],
  dlc: [
    prod("DG-D-3001", "확장팩 DLC", { game_type: "DLC", consumer_price: 30000, price: 27000 }),
    prod("DG-D-3002", "시즌패스", {
      game_type: "DLC",
      consumer_price: 45000,
      price: 40500,
      status: "9",
    }),
    prod("DG-D-3003", "추가 스토리 DLC", {
      game_type: "DLC",
      consumer_price: 20000,
      discount: 25,
      price: 15000,
    }),
    prod("DG-D-3004", "코스튬 DLC", {
      game_type: "DLC",
      is_free: "Y",
      is_free_url: "https://directg.net/free/costume",
    }),
    prod("DG-D-3005", "사운드트랙 DLC", {
      game_type: "DLC",
      consumer_price: 15000,
      price: 13500,
      status: "2",
    }),
  ],
  etc: [
    prod("DG-A-4001", "공식 아트북", { game_type: "액세서리", supplier: "H2 Goods" }),
    prod("DG-A-4002", "피규어", { game_type: "액세서리", supplier: "H2 Goods", status: "2" }),
    prod("DG-A-4003", "스틸북 케이스", {
      game_type: "액세서리",
      supplier: "H2 Goods",
      consumer_price: 25000,
      price: 22500,
    }),
    prod("DG-A-4004", "한정판 굿즈세트", {
      game_type: "액세서리",
      supplier: "H2 Goods",
      consumer_price: 89000,
      discount: 10,
      price: 80100,
      status: "3",
    }),
  ],
  holomodels: [
    prod("DG-H-5001", "홀로모델 본체", { game_type: "홀로모델" }),
    prod("DG-H-5002", "홀로모델 디럭스", {
      game_type: "홀로모델",
      consumer_price: 99000,
      price: 89100,
    }),
    prod("DG-H-5003", "홀로모델 프리미엄", {
      game_type: "홀로모델",
      consumer_price: 149000,
      discount: 15,
      price: 126650,
    }),
    prod("DG-H-5004", "홀로모델 라이트", {
      game_type: "홀로모델",
      consumer_price: 59000,
      discount: 0,
      price: 59000,
      status: "9",
    }),
  ],
  holomodelsdlc: [
    prod("DG-HD-6001", "홀로모델 DLC 팩", { game_type: "홀로모델DLC" }),
    prod("DG-HD-6002", "홀로모델 의상 팩", {
      game_type: "홀로모델DLC",
      consumer_price: 18000,
      price: 16200,
    }),
    prod("DG-HD-6003", "홀로모델 모션 팩", {
      game_type: "홀로모델DLC",
      is_free: "Y",
      is_free_url: "https://directg.net/free/motion",
    }),
  ],
  holomodelsedition: [
    prod("DG-HE-7001", "홀로모델 에디션", { display_type: "홀로에디션" }),
    prod("DG-HE-7002", "홀로모델 스페셜 에디션", {
      display_type: "홀로에디션",
      consumer_price: 199000,
      discount: 20,
      price: 159200,
    }),
    prod("DG-HE-7003", "홀로모델 콜라보 에디션", {
      display_type: "홀로에디션",
      consumer_price: 249000,
      price: 224100,
      status: "1",
    }),
  ],
};

// title별 attached 옵션(가변). 실제 tbl_title_option.
const optionStore = new Map<number, Record<OptionCategory, OptionProduct[]>>();
const emptyCategories = (): Record<OptionCategory, OptionProduct[]> => ({
  game: [],
  edition: [],
  dlc: [],
  etc: [],
  holomodels: [],
  holomodelsdlc: [],
  holomodelsedition: [],
});
const findInPool = (category: OptionCategory, code: string) =>
  CANDIDATE_POOL[category].find((p) => p.product_code === code);
const getOptions = (titleId: number): Record<OptionCategory, OptionProduct[]> => {
  if (!optionStore.has(titleId)) {
    const seed = emptyCategories();
    if (titleId === 1001) {
      // 카테고리별 attached 샘플(화면 채움용).
      seed.game = [findInPool("game", "DG-G-1001")!, findInPool("game", "DG-G-1004")!];
      seed.edition = [findInPool("edition", "DG-E-2001")!, findInPool("edition", "DG-E-2002")!];
      seed.dlc = [
        findInPool("dlc", "DG-D-3001")!,
        findInPool("dlc", "DG-D-3002")!,
        findInPool("dlc", "DG-D-3004")!,
      ];
      seed.etc = [findInPool("etc", "DG-A-4001")!];
      seed.holomodels = [findInPool("holomodels", "DG-H-5001")!];
      seed.holomodelsdlc = [findInPool("holomodelsdlc", "DG-HD-6001")!];
      seed.holomodelsedition = [findInPool("holomodelsedition", "DG-HE-7001")!];
    } else if (titleId === 1002) {
      // 발더스 게이트: 기본게임 + 에디션 + DLC 샘플.
      seed.game = [findInPool("game", "DG-G-1006")!];
      seed.edition = [findInPool("edition", "DG-E-2003")!];
      seed.dlc = [findInPool("dlc", "DG-D-3003")!];
    }
    optionStore.set(titleId, seed);
  }
  return optionStore.get(titleId)!;
};

const contains = (haystack: string, needle: string) =>
  haystack.toLowerCase().includes(needle.toLowerCase());

export const titleOptionHandlers = [
  // legacy title_option_register.php 로드 — 7개 카테고리 attached.
  http.get(api("/admin/goods/titles/:titleId/options"), ({ params }) => {
    const titleId = Number(params.titleId);
    const row = db.goodsTitle.all().find((r) => r.title_id === titleId);
    if (!row) {
      return HttpResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }
    return HttpResponse.json({
      title_id: row.title_id,
      title_name: row.title_name,
      title_name_en: row.title_name_en,
      categories: getOptions(titleId),
    });
  }),

  // legacy title_ps.php option_{cat}_search — 후보(attached 제외, 이름 포함).
  http.get(api("/admin/goods/titles/:titleId/option-search"), ({ params, request }) => {
    const titleId = Number(params.titleId);
    const url = new URL(request.url);
    const category = url.searchParams.get("category") as OptionCategory;
    const value = url.searchParams.get("value") ?? "";
    if (!CATEGORIES.includes(category)) {
      return HttpResponse.json([], { status: 200 });
    }
    const attached = new Set(getOptions(titleId)[category].map((p) => p.product_code));
    const results = CANDIDATE_POOL[category]
      .filter((p) => !attached.has(p.product_code))
      .filter((p) => contains(p.product_name, value) || contains(p.product_name_en, value))
      .map((p) => ({
        product_code: p.product_code,
        product_name: p.product_name,
        product_name_en: p.product_name_en,
        platform: p.platform,
        publisher: p.supplier,
        game_type: p.game_type,
        bundle_type: "",
        status: p.status,
      }));
    return HttpResponse.json(results);
  }),

  // legacy title_ps.php option_{cat}_add — attached 추가.
  http.post(api("/admin/goods/titles/:titleId/options"), async ({ params, request }) => {
    const titleId = Number(params.titleId);
    const body = (await request.json()) as { category: OptionCategory; product_code: string };
    const found = findInPool(body.category, body.product_code);
    if (found) {
      const current = getOptions(titleId);
      if (!current[body.category].some((p) => p.product_code === body.product_code)) {
        optionStore.set(titleId, {
          ...current,
          [body.category]: [...current[body.category], found],
        });
      }
    }
    return HttpResponse.json<MutationResponse>({ success: true });
  }),

  // legacy title_ps.php option_{cat}_delete — attached 제거.
  http.delete(api("/admin/goods/titles/:titleId/options/:category/:productCode"), ({ params }) => {
    const titleId = Number(params.titleId);
    const category = params.category as OptionCategory;
    const code = String(params.productCode);
    const current = getOptions(titleId);
    if (CATEGORIES.includes(category)) {
      optionStore.set(titleId, {
        ...current,
        [category]: current[category].filter((p) => p.product_code !== code),
      });
    }
    return HttpResponse.json<MutationResponse>({ success: true });
  }),
];
